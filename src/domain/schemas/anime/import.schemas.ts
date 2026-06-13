import { z } from 'zod';

export const anilistImportSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(1, 'AniList username is required')
            .max(50, 'AniList username is too long')
    })
    .strict();

export type AnilistImportInput = z.infer<typeof anilistImportSchema>;

// Internal Prisma watch-state enum values, shared with the watch service.
export type WatchStateValue =
    | 'WATCHING'
    | 'COMPLETED'
    | 'ON_HOLD'
    | 'DROPPED'
    | 'PLAN_TO_WATCH';

/** A single anime entry normalized from any import source. */
export interface ImportEntry {
    malId: number;
    state: WatchStateValue;
    numEpisodes: number;
    score: number; // 0 means "no score"
}

export interface ImportResult {
    imported: number;
    skipped: number;
    failed: { malId: number; reason: string }[];
}
