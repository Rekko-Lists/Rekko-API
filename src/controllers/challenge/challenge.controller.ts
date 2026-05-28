import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { challengeFiltersSchema } from '../../domain/schemas/challenge/challenge.schemas';
import { ValidationError } from '../../exceptions/ValidationError';
import { ChallengeResponseMapper } from '../../infraestructure/services/challenge/challengeResponse.mapper';

export const createChallenges = catchAsync(
    async (req: Request, res: Response) => {
        const { services, externalServices } = req.container!;
        const files = (req.files as Express.Multer.File[]) || [];

        const { validated, filesMap } =
            externalServices.challengeRequestParser.parse(
                req.body?.challenges,
                files
            );

        const enrichedChallenges =
            await externalServices.challengeDataEnricher.enrichBatch(
                validated.challenges,
                filesMap,
                validated.date
            );

        validateDateFormat(validated.date);

        if (validated.challenges.length !== 4) {
            throw new ValidationError(
                'Exactly 4 challenges are required'
            );
        }

        const createdChallenges =
            await services.challenge.createDailyChallenges({
                date: validated.date,
                challenges: enrichedChallenges
            });

        const created =
            await services.challenge.getChallengesByDate(
                validated.date
            );

        ok(res, 'Challenges created successfully', {
            challenges: ChallengeResponseMapper.toDTOArray(
                created
            )
        });
    }
);

export const getChallenges = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const findOptions = (req as any).findOptions;

        const filters = challengeFiltersSchema.parse(req.query);

        const result = await services.challenge.getChallenges(
            findOptions,
            filters
        );

        const { page, limit } = findOptions.pagination;
        const pages = Math.ceil(result.total / limit);

        ok(res, 'Challenges found', {
            challenges: ChallengeResponseMapper.toDTOArray(
                result.data
            ),
            pagination: {
                page,
                limit,
                total: result.total,
                pages
            }
        });
    }
);

export const getDailyChallenges = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;

        const dailyChallenges =
            await services.challenge.getDailyChallenges();

        ok(res, 'Daily challenges retrieved', {
            challenges: ChallengeResponseMapper.toDTOArray(
                dailyChallenges
            ),
            date: new Date().toISOString().split('T')[0]
        });
    }
);

export const getChallengesByDate = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const date = req.params.date as string;

        validateDateFormat(date);

        const challenges =
            await services.challenge.getChallengesByDate(date);

        ok(res, `Challenges for ${date} retrieved`, {
            challenges: ChallengeResponseMapper.toDTOArray(
                challenges
            ),
            date
        });
    }
);

export const deleteChallengesByDate = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const date = req.params.date as string;

        validateDateFormat(date);

        await services.challenge.deleteChallengesByDate(date);

        ok(res, `Challenges for ${date} deleted successfully`);
    }
);

const validateDateFormat = (date: string) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        throw new ValidationError(
            'Invalid date format. Expected YYYY-MM-DD'
        );
    }
};
