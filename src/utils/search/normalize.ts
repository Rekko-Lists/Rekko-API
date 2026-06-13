/**
 * Normalizes a title for tolerant search: decomposes accents, drops diacritics,
 * lowercases, and strips every non-alphanumeric character. This collapses
 * spacing/punctuation/alias variants so "Full metal Alchemist",
 * "Fullmetal Alchemist" and "fullmetal-alchemist" all map to the same token.
 */
export function normalizeTitle(value: string | null | undefined): string {
    if (!value) return '';
    return value
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '') // strip combining diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

/**
 * Builds the persisted `searchText` from the primary name and any alternative
 * titles (english + synonyms). Each title is normalized independently and
 * joined with a space so distinct aliases stay searchable while remaining
 * whitespace-insensitive within each alias.
 */
export function buildSearchText(
    name: string,
    titleEnglish?: string | null,
    titleSynonyms?: string[] | null
): string {
    const parts = [name, titleEnglish, ...(titleSynonyms ?? [])];
    return parts
        .map((part) => normalizeTitle(part))
        .filter(Boolean)
        .join(' ');
}
