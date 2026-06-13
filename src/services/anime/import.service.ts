import { XMLParser } from 'fast-xml-parser';
import { WatchService } from './watch.service';
import { RateService } from './rate.service';
import {
    ImportEntry,
    ImportResult,
    WatchStateValue
} from '../../domain/schemas/anime/import.schemas';
import {
    NotFoundError,
    ValidationError
} from '../../exceptions/exceptions';

const ANILIST_GRAPHQL_URL = 'https://graphql.anilist.co';

const ANILIST_LIST_QUERY = `
query ($name: String) {
  MediaListCollection(userName: $name, type: ANIME) {
    lists {
      entries {
        status
        progress
        score(format: POINT_10)
        media { idMal }
      }
    }
  }
}`;

// MAL XML `<my_status>` (current text export, plus legacy numeric codes).
const MAL_STATUS_MAP: Record<string, WatchStateValue> = {
    watching: 'WATCHING',
    completed: 'COMPLETED',
    'on-hold': 'ON_HOLD',
    'on hold': 'ON_HOLD',
    dropped: 'DROPPED',
    'plan to watch': 'PLAN_TO_WATCH',
    '1': 'WATCHING',
    '2': 'COMPLETED',
    '3': 'ON_HOLD',
    '4': 'DROPPED',
    '6': 'PLAN_TO_WATCH'
};

// AniList `MediaListEntry.status` enum.
const ANILIST_STATUS_MAP: Record<string, WatchStateValue> = {
    CURRENT: 'WATCHING',
    REPEATING: 'WATCHING',
    COMPLETED: 'COMPLETED',
    PAUSED: 'ON_HOLD',
    DROPPED: 'DROPPED',
    PLANNING: 'PLAN_TO_WATCH'
};

export class ImportService {
    constructor(
        private readonly watchService: WatchService,
        private readonly rateService: RateService
    ) {}

    async importFromMalXml(
        userId: number,
        xml: string
    ): Promise<ImportResult> {
        const entries = this.parseMalXml(xml);
        return this.importEntries(userId, entries);
    }

    async importFromAnilist(
        userId: number,
        username: string
    ): Promise<ImportResult> {
        const entries = await this.fetchAnilistList(username);
        return this.importEntries(userId, entries);
    }

    /**
     * Writes each entry into the user's watch list (and rating if scored).
     * Resilient by design: a single anime that cannot be resolved or whose
     * progress exceeds our known episode count never aborts the whole import.
     */
    private async importEntries(
        userId: number,
        entries: ImportEntry[]
    ): Promise<ImportResult> {
        const result: ImportResult = {
            imported: 0,
            skipped: 0,
            failed: []
        };

        for (const entry of entries) {
            if (!entry.malId || entry.malId <= 0) {
                result.skipped++;
                continue;
            }

            try {
                await this.watchService.updateProgress(
                    userId,
                    entry.malId,
                    entry.numEpisodes,
                    entry.state
                );
            } catch (error) {
                // Most commonly the imported progress is greater than the
                // episode count we have stored — retry once without progress.
                try {
                    await this.watchService.updateProgress(
                        userId,
                        entry.malId,
                        0,
                        entry.state
                    );
                } catch (retryError) {
                    result.failed.push({
                        malId: entry.malId,
                        reason:
                            retryError instanceof Error
                                ? retryError.message
                                : 'Unknown error'
                    });
                    continue;
                }
            }

            if (entry.score > 0) {
                // Ratings are best-effort: a failure here must not drop the
                // already-imported watch entry.
                try {
                    await this.rateService.rateAnime(
                        userId,
                        entry.malId,
                        entry.score
                    );
                } catch {
                    /* ignore rating failures */
                }
            }

            result.imported++;
        }

        return result;
    }

    private parseMalXml(xml: string): ImportEntry[] {
        const parser = new XMLParser({
            ignoreAttributes: true,
            parseTagValue: false,
            trimValues: true
        });

        let parsed: any;
        try {
            parsed = parser.parse(xml);
        } catch {
            throw new ValidationError(
                'The provided file is not a valid MyAnimeList XML export.'
            );
        }

        const animeNode = parsed?.myanimelist?.anime;
        if (!animeNode) {
            throw new ValidationError(
                'No anime entries were found in the XML file.'
            );
        }

        const rawEntries: any[] = Array.isArray(animeNode)
            ? animeNode
            : [animeNode];

        const entries: ImportEntry[] = [];
        for (const raw of rawEntries) {
            const malId = parseInt(
                String(raw?.series_animedb_id ?? ''),
                10
            );
            if (!Number.isFinite(malId) || malId <= 0) continue;

            const statusKey = String(raw?.my_status ?? '')
                .trim()
                .toLowerCase();
            const state = MAL_STATUS_MAP[statusKey];
            if (!state) continue;

            entries.push({
                malId,
                state,
                numEpisodes: this.toInt(raw?.my_watched_episodes),
                score: this.clampScore(this.toInt(raw?.my_score))
            });
        }

        return entries;
    }

    private async fetchAnilistList(
        username: string
    ): Promise<ImportEntry[]> {
        let response: Response;
        try {
            response = await fetch(ANILIST_GRAPHQL_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    query: ANILIST_LIST_QUERY,
                    variables: { name: username }
                })
            });
        } catch {
            throw new ValidationError(
                'Could not reach AniList. Please try again later.'
            );
        }

        if (response.status === 404) {
            throw new NotFoundError(
                `AniList user "${username}" was not found.`
            );
        }

        const json: any = await response.json();

        if (json?.errors?.length) {
            const message = String(
                json.errors[0]?.message ?? ''
            ).toLowerCase();
            if (message.includes('not found')) {
                throw new NotFoundError(
                    `AniList user "${username}" was not found.`
                );
            }
            throw new ValidationError(
                'AniList rejected the request. Check the username and try again.'
            );
        }

        const lists =
            json?.data?.MediaListCollection?.lists ?? [];
        const entries: ImportEntry[] = [];

        for (const list of lists) {
            for (const rawEntry of list?.entries ?? []) {
                const malId = rawEntry?.media?.idMal;
                if (!malId) continue; // AniList entry without a MAL mapping

                const state =
                    ANILIST_STATUS_MAP[
                        String(rawEntry?.status ?? '')
                    ];
                if (!state) continue;

                entries.push({
                    malId: Number(malId),
                    state,
                    numEpisodes: this.toInt(rawEntry?.progress),
                    score: this.clampScore(
                        this.toInt(rawEntry?.score)
                    )
                });
            }
        }

        return entries;
    }

    private toInt(value: unknown): number {
        const n = parseInt(String(value ?? ''), 10);
        return Number.isFinite(n) && n > 0 ? n : 0;
    }

    private clampScore(score: number): number {
        if (score <= 0) return 0;
        return Math.min(10, Math.round(score));
    }
}
