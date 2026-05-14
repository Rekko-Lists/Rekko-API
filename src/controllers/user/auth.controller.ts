import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import {
    loginSchema,
    refreshTokenSchema
} from '../../domain/schemas/user/auth.schemas';
import { getClientInfo } from '../../utils/http/http.util';

export const login = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const validatedInput = loginSchema.parse(req.body);

        const user =
            await services.emailAuth.authenticateByEmailAndPassword(
                validatedInput.email,
                validatedInput.password
            );

        const { userAgent, ip } = getClientInfo(req);

        const tokens =
            await services.refreshToken.generateTokenPair(
                user.getUserId(),
                userAgent,
                ip
            );

        ok(res, 'Login successful', {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                userId: user.getUserId(),
                email: user.getEmail(),
                username: user.getUsername()
            }
        });
    }
);

export const logout = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const validatedInput = refreshTokenSchema.parse(
            req.body
        );

        await services.refreshToken.revokeSessionByToken(
            validatedInput.refreshToken
        );

        ok(res, 'Logout successful');
    }
);

export const refreshToken = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const validatedInput = refreshTokenSchema.parse(
            req.body
        );

        const tokens =
            await services.refreshToken.refreshAccessToken(
                validatedInput.refreshToken
            );

        ok(res, 'Token refreshed successfully', {
            accessToken: tokens.accessToken
        });
    }
);

export const getSessions = catchAsync(
    async (req: Request, res: Response) => {
        res.status(501).json({
            message: 'Not implemented',
            details: 'GET Sessions'
        });
    }
);

export const revokeSession = catchAsync(
    async (req: Request, res: Response) => {
        res.status(501).json({
            message: 'Not implemented',
            details: 'Revoke Session'
        });
    }
);
