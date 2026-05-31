/**
 * Ranks items by relevance to a query string.
 *
 * Scoring tiers (highest → lowest):
 *   1.00          exact match
 *   0.90–0.95     name starts with the full query (bonus for shorter names — closer match)
 *   0.75          query starts a word inside the name (word-boundary match)
 *   0.60          query appears anywhere inside the name
 *   0–0.40        partial word-level match
 *
 * When two items share the same score, the optional `getRank` value is used as
 * a tiebreaker (lower value = higher priority, e.g. MAL rank where 1 is best).
 */
export function rankByRelevance<T>(
    items: T[],
    query: string,
    getName: (item: T) => string | string[],
    getId: (item: T) => unknown,
    getRank?: (item: T) => number
): T[] {
    if (!items?.length || !query?.trim()) {
        return items;
    }

    const q = query.toLowerCase().trim();

    // Escape special regex chars so user input is treated as a literal string.
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Matches the query at the start of a word (handles accented/Unicode chars).
    const wordBoundaryRe = new RegExp(
        `(?:^|\\s)${escaped}`,
        'i'
    );

    const scoreName = (name: string): number => {
        const normalized = name.toLowerCase();

        if (normalized === q) {
            return 1.0;
        }

        if (normalized.startsWith(q)) {
            // Proportional bonus: a shorter name matching the full query prefix is
            // more relevant than a long title that merely happens to start with it.
            return 0.9 + (q.length / normalized.length) * 0.05;
        }

        if (wordBoundaryRe.test(normalized)) {
            // "Sword Art Online" when searching "art" — starts a word.
            return 0.75;
        }

        if (normalized.includes(q)) {
            return 0.6;
        }

        const queryWords = q.split(/\s+/);
        const matched = queryWords.filter((w) =>
            normalized.includes(w)
        ).length;

        return matched > 0
            ? 0.4 * (matched / queryWords.length)
            : 0;
    };

    const seen = new Map<
        unknown,
        { item: T; score: number; rank: number }
    >();

    for (const item of items) {
        const id = getId(item);
        const names = [getName(item)].flat().filter(Boolean);
        const rank = getRank
            ? getRank(item) || Infinity
            : Infinity;
        const score = Math.max(...names.map(scoreName), 0);

        const existing = seen.get(id);
        if (!existing || existing.score < score) {
            seen.set(id, { item, score, rank });
        }
    }

    return [...seen.values()]
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            // Tiebreaker: lower rank = more popular/relevant (e.g. MAL rank 1 beats rank 500).
            return a.rank - b.rank;
        })
        .map(({ item }) => item);
}
