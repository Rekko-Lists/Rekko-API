import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import {
    oauthDiscordSchema,
    oauthFirebaseSchema
} from '../../domain/schemas/user/oauth.schemas';
import { ok } from '../../utils/http/response';
import { getClientInfo } from '../../utils/http/http.util';

export const oauthGoogle = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const { tokenId } = oauthFirebaseSchema.parse(req.body);

        const clientInfo = getClientInfo(req);

        const user = await services.oauth.googleAuth(tokenId);

        const tokens =
            await services.refreshToken.generateTokenPair(
                user.getUserId(),
                clientInfo.userAgent,
                clientInfo.ip
            );

        ok(res, 'Google OAuth account created successfully', {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
);

export const oauthDiscord = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const { code } = oauthDiscordSchema.parse(req.body);

        const clientInfo = getClientInfo(req);

        const user = await services.oauth.discordAuth(code);

        const tokens =
            await services.refreshToken.generateTokenPair(
                user.getUserId(),
                clientInfo.userAgent,
                clientInfo.ip
            );

        ok(res, 'Discord OAuth account created successfully', {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }
);
