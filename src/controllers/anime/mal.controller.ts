import { Request, Response } from 'express';
import {
    malAuthService,
    malService
} from '../../infraestructure/container/anime.container';
import { ok } from '../../utils/http/response';
import { catchAsync } from '../../utils/http/catchAsync';
import { BadRequestError } from '../../domain/errors/http.errors';
import { randomUUID } from 'crypto';

export const getAuthUrl = catchAsync(
    async (req: Request, res: Response) => {
        const state = randomUUID();
        const redirectUri =
            process.env.NODE_ENV === 'development'
                ? `${process.env.APP_URL_DEV}:${process.env.SERVER_PORT}/mal/auth/callback`
                : `${process.env.APP_URL_PROD}/mal/auth/callback`;

        const authUrl = malAuthService.getAuthorizationUrl(
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
        const { code, state } = req.query;

        if (!code || typeof code !== 'string') {
            throw new BadRequestError(
                'Authorization code is required'
            );
        }

        if (!state || typeof state !== 'string') {
            throw new BadRequestError(
                'State parameter is required'
            );
        }

        const tokenData = await malAuthService.getAccessToken(
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
        const { query, limit } = req.query;

        if (!query || typeof query !== 'string') {
            throw new BadRequestError(
                'Query parameter is required and must be a string'
            );
        }

        const limitNumber =
            limit && !isNaN(Number(limit)) ? Number(limit) : 10;

        const animes = await malService.searchAnimes(
            query,
            limitNumber
        );

        ok(res, 'Animes found in MAL', animes);
    }
);

export const getMalAnime = catchAsync(
    async (req: Request, res: Response) => {
        const { malid } = req.params;

        const malIdNumber = Number(malid);

        if (isNaN(malIdNumber)) {
            throw new BadRequestError(
                'MAL ID must be a valid number'
            );
        }

        const anime = await malService.getAnimeById(malIdNumber);
        const mapped = malService.mapMalToAnime(anime);

        ok(res, 'Anime found in MAL', {
            ...anime,
            mapped
        });
    }
);
