export const ANIME_WEEKLY_POST_WEIGHT = 4;

export function getUtcWeekStart(date = new Date()): Date {
    const value = new Date(date);
    value.setUTCHours(0, 0, 0, 0);
    const day = value.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    value.setUTCDate(value.getUTCDate() + mondayOffset);
    return value;
}
