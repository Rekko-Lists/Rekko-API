import { Request, Response } from 'express';
import { SEARCH_LIMITS } from '../../domain/schemas/search/search.schemas';
import { ok } from '../../utils/http/response';
import { catchAsync } from '../../utils/http/catchAsync';
import { ValidationError } from '../../exceptions/exceptions';
import { randomUUID } from 'crypto';

export const getAuthUrl = catchAsync(
    async (req: Request, res: Response) => {
        const { externalServices } = req.container!;
        const state = randomUUID();
        const redirectUri =
            process.env.NODE_ENV === 'development'
                ? `${process.env.APP_URL_DEV}:${process.env.SERVER_PORT}/mal/auth/callback`
                : `${process.env.APP_URL_PROD}/mal/auth/callback`;

        const authUrl =
            externalServices.malAuth.getAuthorizationUrl(
                redirectUri,
                state
            );

        ok(res, 'Authorization URL generated', {
            authUrl,
            state
        });
    }
);

export const handleAuthCallback = catchAsync(
    async (req: Request, res: Response) => {
        const { externalServices } = req.container!;
        const { code, state } = req.query;

        if (!code || typeof code !== 'string') {
            throw new ValidationError(
                'Authorization code is required',
                { received: code }
            );
        }

        if (!state || typeof state !== 'string') {
            throw new ValidationError(
                'State parameter is required',
                { received: state }
            );
        }

        const tokenData =
            await externalServices.malAuth.getAccessToken(
                code,
                state
            );

        ok(res, 'Access token obtained successfully', {
            ...tokenData
        });
    }
);

export const searchMalAnimes = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const { query, limit } = req.query;

        if (!query || typeof query !== 'string') {
            throw new ValidationError(
                'Query parameter is required and must be a string',
                { received: query }
            );
        }

        const limitNumber =
            limit && !isNaN(Number(limit))
                ? Number(limit)
                : SEARCH_LIMITS.MAX_RESULTS;

        const animes = await services.mal.searchAnimes(
            query,
            limitNumber
        );

        ok(res, 'Animes found in MAL', animes);
    }
);

export const getMalAnime = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const { malid } = req.params;

        const malIdNumber = Number(malid);

        if (isNaN(malIdNumber)) {
            throw new ValidationError(
                'MAL ID must be a valid number',
                { received: malid }
            );
        }

        const anime =
            await services.mal.getAnimeById(malIdNumber);
        const mapped = services.mal.mapMalToAnime(anime);

        ok(res, 'Anime found in MAL', {
            ...anime,
            mapped
        });
    }
);
