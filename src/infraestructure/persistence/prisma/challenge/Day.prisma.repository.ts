import { Day } from '../../../../domain/entities/Day';
import { DayRepository } from '../../../../domain/repositories/challenge/Day.repository';
import { prisma } from '../../../database/prisma.client';
import { handlePrismaError } from '../../../errors/prisma.errors';

export class DayPrismaRepository implements DayRepository {
    constructor(private readonly db = prisma) {}

    async create(date: string): Promise<Day | null> {
        try {
            const day = await this.db.day.create({
                data: { date }
            });
            return Day.fromPersistence(day);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findById(dayId: number): Promise<Day | null> {
        try {
            const day = await this.db.day.findUnique({
                where: { dayId }
            });
            if (!day) return null;
            return Day.fromPersistence(day);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findByDate(date: string): Promise<Day | null> {
        try {
            const day = await this.db.day.findUnique({
                where: { date }
            });
            if (!day) return null;
            return Day.fromPersistence(day);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async findOrCreate(date: string): Promise<Day> {
        try {
            const day = await this.db.day.upsert({
                where: { date },
                update: {},
                create: { date }
            });
            return Day.fromPersistence(day);
        } catch (error) {
            handlePrismaError(error);
        }
    }

    async delete(dayId: number): Promise<boolean> {
        try {
            await this.db.day.delete({
                where: { dayId }
            });
            return true;
        } catch (error) {
            handlePrismaError(error);
        }
    }
}
