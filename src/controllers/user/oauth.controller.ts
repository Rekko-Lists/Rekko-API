import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import {
    oauthDiscordSchema,
    oauthFirebaseSchema
} from '../../domain/schemas/user/oauth.schemas';
import {
    oauthService,
    refreshTokenService
} from '../../infraestructure/container/user.container';
import { ok } from '../../utils/http/response';
import { getClientInfo } from '../../utils/http/http.util';

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
