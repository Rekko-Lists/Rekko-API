import { Challenge } from '../../../../domain/entities/Challenge';
import { ChallengeRepository } from '../../../../domain/repositories/challenge/Challenge.repository';
import {
    FindOptions,
    FindRepository
} from '../../../../domain/schemas/find.schemas';
import {
    ChallengeFilters,
    ChallengeWithRelations
} from '../../../../domain/schemas/challenge/challenge.schemas';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';
import { buildPrismaPageQuery } from '../../../../utils/prisma/prismaHelper';
import { ChallengeFilterBuilder } from './Challenge.filter.builder';

const CHALLENGE_INCLUDE = {
    type: true,
    anime: true
} as const;

export class ChallengePrismaRepository implements ChallengeRepository {
    constructor(private readonly db = prisma) {}

    async create(entity: Challenge): Promise<Challenge | null> {
        try {
            const challenge = await this.db.challenge.create({
                data: {
                    typeId: entity.getTypeId(),
                    dayId: entity.getDayId(),
                    animeId: entity.getAnimeId(),
                    data: entity.getData()
                }
            });
            return Challenge.fromPersistence(challenge);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByDate(date: string): Promise<ChallengeWithRelations[]> {
        try {
            const dayRecord = await this.db.day.findUnique({
                where: { date }
            });

            if (!dayRecord) return [];

            return this.db.challenge.findMany({
                where: { dayId: dayRecord.dayId },
                include: CHALLENGE_INCLUDE
            }) as Promise<ChallengeWithRelations[]>;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findWithFilters(
        findOptions: FindOptions,
        filters: ChallengeFilters
    ): Promise<FindRepository<ChallengeWithRelations>> {
        try {
            const { skip, take, orderBy } = buildPrismaPageQuery(
                findOptions,
                'challengeId'
            );

            const filterBuilder = new ChallengeFilterBuilder();
            const where = await filterBuilder.build(filters);

            if (where === null) {
                return { data: [], total: 0 };
            }

            const [challenges, total] = await Promise.all([
                this.db.challenge.findMany({
                    where,
                    skip,
                    take,
                    orderBy,
                    include: CHALLENGE_INCLUDE
                }),
                this.db.challenge.count({ where })
            ]);

            return {
                data: challenges as ChallengeWithRelations[],
                total
            };
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async deleteByDate(date: string): Promise<boolean> {
        try {
            const dayRecord = await this.db.day.findUnique({
                where: { date }
            });

            if (!dayRecord) return false;

            const result = await this.db.challenge.deleteMany({
                where: { dayId: dayRecord.dayId }
            });

            return result.count > 0;
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async createBatch(
        challenges: Challenge[]
    ): Promise<ChallengeWithRelations[]> {
        try {
            const created = await this.db.$transaction(
                challenges.map((challenge) =>
                    this.db.challenge.create({
                        data: {
                            typeId: challenge.getTypeId(),
                            dayId: challenge.getDayId(),
                            animeId: challenge.getAnimeId(),
                            data: challenge.getData()
                        },
                        include: CHALLENGE_INCLUDE
                    })
                )
            );

            return created as ChallengeWithRelations[];
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
