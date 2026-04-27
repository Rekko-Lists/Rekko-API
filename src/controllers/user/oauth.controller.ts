import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import {
    oauthDiscordSchema,
    oauthFirebaseSchema
} from '../../domain/schemas/user.schemas';
import {
    oauthService,
    refreshTokenService
} from '../../infraestructure/container/user.container';
import { ok } from '../../utils/handlers/response.handler';
import { getClientInfo } from '../../utils/http.util';

export const oauthGoogle = catchAsync(
    async (req: Request, res: Response) => {
        const { tokenId } = oauthFirebaseSchema.parse(req.body);

        const clientInfo = getClientInfo(req);

        const user = await oauthService.googleAuth(tokenId);

        const tokens =
            await refreshTokenService.generateTokenPair(
                user.getUserId(),
                clientInfo.userAgent,
                clientInfo.ip
            );

        ok(res, 'Google OAuth account created succesfully', {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
);

export const oauthDiscord = catchAsync(
    async (req: Request, res: Response) => {
        const { code } = oauthDiscordSchema.parse(req.body);

        const clientInfo = getClientInfo(req);

        const user = await oauthService.discordAuth(code);

        const tokens =
            await refreshTokenService.generateTokenPair(
                user.getUserId(),
                clientInfo.userAgent,
                clientInfo.ip
            );

        ok(res, 'Discord OAuth account created succesfully', {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
);
