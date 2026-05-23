import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { AnimeRelationMapper } from '../../domain/entities/mappers/AnimeRelationMapper';
import { ValidationError } from '../../exceptions/ValidationError';

export const getRelatedAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const malId = parseInt(req.params.malid as string);

        if (isNaN(malId)) {
            throw new ValidationError(
                'Invalid malId parameter',
                {
                    received: req.params.malid
                }
            );
        }

        const { services } = req.container!;
        const relations =
            await services.anime.getRelatedAnimes(malId);

        ok(res, 'Related animes found', {
            relations: AnimeRelationMapper.toDTOs(relations)
        });
    }
);
