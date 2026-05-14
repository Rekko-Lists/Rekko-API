export function rankByRelevance<T>(
    items: T[],
    query: string,
    getName: (item: T) => string,
    getId: (item: T) => any
): T[] {
    if (!items?.length || !query?.trim()) {
        return items;
    }

    const q = query.toLowerCase();
    const seen = new Map<any, { item: T; score: number }>();

    for (const item of items) {
        const id = getId(item);
        const name = getName(item).toLowerCase();

        let score = 0;

        if (name === q) {
            score = 1.0;
        } else if (name.startsWith(q)) {
            score = 0.8;
        } else if (name.includes(q)) {
            score = 0.6;
        } else {
            const words = q.split(' ');
            const matched = words.filter((w) =>
                name.includes(w)
            ).length;
            if (matched > 0) {
                score = 0.4 * (matched / words.length);
            }
        }

        const existing = seen.get(id);
        if (!existing || existing.score < score) {
            seen.set(id, { item, score });
        }
    }

    return [...seen.values()]
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
}
