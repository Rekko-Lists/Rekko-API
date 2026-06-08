import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import {
    challengeFiltersSchema,
    dateStringSchema,
    ChallengeWithRelations,
    CreateChallengeDto
} from '../../domain/schemas/challenge/challenge.schemas';
import { ValidationError } from '../../exceptions/exceptions';
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

        const created =
            await services.challenge.createDailyChallenges({
                date: validated.date,
                challenges: enrichedChallenges
            });

        ok(res, 'Challenges created successfully', {
            challenges: ChallengeResponseMapper.toDTOArray(created)
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
        const date = dateStringSchema.parse(req.params.date);

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
        const date = dateStringSchema.parse(req.params.date);

        await services.challenge.deleteChallengesByDate(date);

        ok(res, `Challenges for ${date} deleted successfully`);
    }
);

export const updateChallenge = catchAsync(
    async (req: Request, res: Response) => {
        const { services, externalServices } = req.container!;
        const challengeId = parseInt(
            req.params.challengeId as string,
            10
        );
        if (isNaN(challengeId) || challengeId <= 0) {
            throw new ValidationError(
                'challengeId must be a positive integer'
            );
        }

        const files = (req.files as Express.Multer.File[]) || [];

        let dataToUpdate: Record<string, any> = {};

        if (files.length > 0) {
            if (!req.body?.type) {
                throw new ValidationError(
                    'Field "type" is required when uploading files'
                );
            }
            const filesMap =
                externalServices.challengeRequestParser.buildFilesMap(
                    files
                );
            const fakeChallenge: CreateChallengeDto = {
                type: req.body.type as
                    | 'anime'
                    | 'character'
                    | 'opening'
                    | 'emoji',
                malId: 0,
                data: {}
            };
            const date =
                req.body.date ||
                new Date().toISOString().split('T')[0];
            const enriched =
                await externalServices.challengeDataEnricher.enrichChallenge(
                    fakeChallenge,
                    filesMap,
                    0,
                    date
                );
            dataToUpdate = enriched.data;
        } else if (req.body?.data) {
            try {
                dataToUpdate =
                    typeof req.body.data === 'string'
                        ? JSON.parse(req.body.data)
                        : req.body.data;
            } catch {
                throw new ValidationError(
                    'Invalid JSON in "data" field'
                );
            }
        } else {
            throw new ValidationError(
                'No data provided for update. Send files or a "data" JSON field.'
            );
        }

        const updated = await services.challenge.updateChallenge(
            challengeId,
            dataToUpdate
        );

        ok(res, 'Challenge updated successfully', {
            challenge: ChallengeResponseMapper.toDTO(
                updated as ChallengeWithRelations
            )
        });
    }
);
