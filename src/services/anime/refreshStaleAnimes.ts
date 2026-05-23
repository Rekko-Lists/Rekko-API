import { Anime } from '../../domain/entities/Anime';
import { AnimeRepository } from '../../domain/repositories/anime/Anime.repository';
import { MalService } from './mal.service';

/**
 * Utilidades para detectar animes "stale" (cuyo `nextUpdate` ya pasó)
 * y refrescarlos en background contra MAL sin bloquear la respuesta.
 *
 * El refresh delega en `AnimeRepository.updateAnime`, que ejecuta un único
 * `prisma.anime.update({ data: { ..., broadcast, animeGenres } })` con
 * nested writes — Prisma lo envuelve en una transacción implícita, por lo
 * que la actualización de `anime` + sus relaciones es atómica (ACID).
 *
 * Scheduler global con concurrency cap + dedup:
 *   - Cap evita agotar el pool de Postgres (max_clients = 15 en sesión).
 *   - Dedup evita que requests concurrentes refresquen el mismo `malId` N
 *     veces (cada uno encuentra el mismo set stale hasta que se actualiza).
 */

// Si MAL falla (timeout, 5xx, red), empujamos nextUpdate 30 min al futuro para
// no martillear MAL en cada request que devuelva este anime como stale.
const FAILURE_BACKOFF_MS = 30 * 60 * 1000;

// Cap global de refreshes simultáneos. Cada slot puede consumir hasta
// 1 conexión a MAL + 1 conexión a Postgres, así que con pool_size=15
// dejamos margen amplio para tráfico real.
const MAX_CONCURRENT_REFRESH = 3;

// Estado del scheduler — process-local. Si hay múltiples procesos cada uno
// tiene su propio cap (peor caso: N_procesos * MAX_CONCURRENT_REFRESH).
const inFlight = new Set<number>();
const pending: number[] = [];
let activeCount = 0;

/**
 * Refresca un único anime contra MAL y persiste el resultado de forma atómica.
 * Si MAL falla, aplica un back-off en `nextUpdate` y re-lanza el error para
 * que el caller pueda loggearlo.
 */
export async function refreshStaleAnime(
    malId: number,
    malService: MalService,
    animeRepository: AnimeRepository
): Promise<void> {
    try {
        const malAnime = await malService.getAnimeById(malId);
        const mappedAnime = malService.mapMalToAnime(malAnime);

        // `updateAnime` usa nested writes -> Prisma garantiza atomicidad
        // (anime + broadcast + animeGenres se actualizan en una transacción implícita).
        await animeRepository.updateAnime(malId, mappedAnime as any);
    } catch (error) {
        // Best-effort: si el bump también falla (p.ej. pool agotado por
        // tráfico real), no es crítico. La próxima request volverá a marcarlo
        // stale y reintentará — sólo retrasa la convergencia.
        try {
            await animeRepository.bumpNextUpdate(
                malId,
                FAILURE_BACKOFF_MS
            );
        } catch (bumpError) {
            console.warn(
                `[refresh stale ${malId}] back-off bump failed`,
                bumpError
            );
        }
        throw error;
    }
}

/**
 * Devuelve los `malId` de las entidades cuya `nextUpdate` ya ha pasado.
 * Acepta entidades `Anime` (que exponen `isStale()` y `getMalId()`).
 */
export function findStaleAnimeMalIds(animes: Anime[]): number[] {
    const stale: number[] = [];

    for (const anime of animes) {
        if (anime.isStale()) {
            stale.push(anime.getMalId());
        }
    }

    return stale;
}

/**
 * Encola `malId`s para refresh en background. NUNCA throw — la respuesta al
 * usuario no debe verse afectada.
 *
 * Si un `malId` ya está en cola o en vuelo, se ignora (dedup).
 * El procesado real se hace en `pump`, respetando `MAX_CONCURRENT_REFRESH`.
 */
export function triggerBackgroundRefresh(
    malIds: number[],
    malService: MalService,
    animeRepository: AnimeRepository
): void {
    if (malIds.length === 0) return;

    let enqueued = 0;
    for (const id of malIds) {
        if (inFlight.has(id)) continue;
        inFlight.add(id);
        pending.push(id);
        enqueued++;
    }

    if (enqueued === 0) return;

    pump(malService, animeRepository);
}

/**
 * Drena `pending` hasta saturar `MAX_CONCURRENT_REFRESH`. Cada refresh,
 * al terminar (éxito o fallo), libera su slot y vuelve a llamar a `pump`
 * para procesar lo siguiente en cola.
 */
function pump(
    malService: MalService,
    animeRepository: AnimeRepository
): void {
    while (
        activeCount < MAX_CONCURRENT_REFRESH &&
        pending.length > 0
    ) {
        const malId = pending.shift()!;
        activeCount++;

        refreshStaleAnime(malId, malService, animeRepository)
            .catch((err) => {
                console.error(`[refresh stale ${malId}]`, err);
            })
            .finally(() => {
                activeCount--;
                inFlight.delete(malId);
                pump(malService, animeRepository);
            });
    }
}
