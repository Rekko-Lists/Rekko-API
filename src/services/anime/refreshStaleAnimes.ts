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
 */

/**
 * Refresca un único anime contra MAL y persiste el resultado de forma atómica.
 * Lanza si MAL falla o si la persistencia falla — el caller decide si tragarse
 * el error (background fire-and-forget) o propagarlo.
 */
export async function refreshStaleAnime(
    malId: number,
    malService: MalService,
    animeRepository: AnimeRepository
): Promise<void> {
    const malAnime = await malService.getAnimeById(malId);
    const mappedAnime = malService.mapMalToAnime(malAnime);

    // `updateAnime` usa nested writes -> Prisma garantiza atomicidad
    // (anime + broadcast + animeGenres se actualizan en una transacción implícita).
    await animeRepository.updateAnime(malId, mappedAnime as any);
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
 * Fire-and-forget: dispara `refreshStaleAnime` por cada `malId` en paralelo
 * vía `Promise.allSettled` para que un fallo individual no aborte al resto.
 * Loggea rechazos con prefijo `[refresh stale <malId>]` y NUNCA throw —
 * la respuesta al usuario no debe verse afectada.
 */
export function triggerBackgroundRefresh(
    malIds: number[],
    malService: MalService,
    animeRepository: AnimeRepository
): void {
    if (malIds.length === 0) return;

    Promise.allSettled(
        malIds.map((malId) =>
            refreshStaleAnime(malId, malService, animeRepository)
        )
    )
        .then((results) => {
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(
                        `[refresh stale ${malIds[index]}]`,
                        result.reason
                    );
                }
            });
        })
        .catch((err) => {
            // Defensive: Promise.allSettled no debería rechazar nunca,
            // pero si la cadena .then() lanza, no queremos un unhandled rejection.
            console.error(
                '[refresh stale] unexpected error in background refresh chain',
                err
            );
        });
}
