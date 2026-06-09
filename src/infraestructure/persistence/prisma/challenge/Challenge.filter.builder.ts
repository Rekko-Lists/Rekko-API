import {
    CHALLENGE_TYPE_IDS,
    ChallengeFilters
} from '../../../../domain/schemas/challenge/challenge.schemas';
import { prisma } from '../../../database/prisma.client';

export class ChallengeFilterBuilder {

    async build(filters: ChallengeFilters): Promise<any> {
        const where: any = {};

        if (filters.type) {
            where.typeId = CHALLENGE_TYPE_IDS[filters.type];
        }

        if (filters.fromDate || filters.toDate) {
            const dayIds = await this.resolveDateRange(
                filters.fromDate,
                filters.toDate
            );

            if (dayIds.length === 0) {
                return null;
            }

            where.dayId = { in: dayIds };
        }

        if (filters.malId) {
            const anime = await this.resolveAnimeId(
                filters.malId
            );

            if (!anime) {
                return null;
            }

            where.animeId = anime.animeId;
        }

        return where;
    }

    /**
     * Resuelve el rango de fechas a una lista de dayIds.
     */
    private async resolveDateRange(
        fromDate?: string,
        toDate?: string
    ): Promise<number[]> {
        const dateWhere: any = {};

        if (fromDate && toDate) {
            dateWhere.date = {
                gte: fromDate,
                lte: toDate
            };
        } else if (fromDate) {
            dateWhere.date = { gte: fromDate };
        } else if (toDate) {
            dateWhere.date = { lte: toDate };
        }

        const days = await prisma.day.findMany({
            where: dateWhere,
            select: { dayId: true }
        });

        return days.map((d: any) => d.dayId);
    }

    /**
     * Resuelve un malId a animeId.
     */
    private async resolveAnimeId(malId: number) {
        return await prisma.anime.findUnique({
            where: { malId },
            select: { animeId: true }
        });
    }
}
