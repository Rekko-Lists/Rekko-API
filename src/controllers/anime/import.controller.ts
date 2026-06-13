import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { ValidationError } from '../../exceptions/exceptions';
import { anilistImportSchema } from '../../domain/schemas/anime/import.schemas';

export const importMalXml = catchAsync(
    async (req: Request, res: Response) => {
        if (!req.file) {
            throw new ValidationError(
                'No XML file was uploaded. Use the "list" field.'
            );
        }

        const { services } = req.container!;
        const userId = req.user!.userId;

        const xml = req.file.buffer.toString('utf-8');
        const result =
            await services.import.importFromMalXml(userId, xml);

        ok(res, 'MyAnimeList import completed', result);
    }
);

export const importAnilist = catchAsync(
    async (req: Request, res: Response) => {
        const { username } = anilistImportSchema.parse(req.body);

        const { services } = req.container!;
        const userId = req.user!.userId;

        const result =
            await services.import.importFromAnilist(
                userId,
                username
            );

        ok(res, 'AniList import completed', result);
    }
);
