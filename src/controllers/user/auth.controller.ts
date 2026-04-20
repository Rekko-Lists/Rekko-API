import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import {
    refreshTokenService,
    emailAuthService
} from '../../infraestructure/container/user.container';
import { ok } from '../../utils/handlers/response.handler';
import {
    loginSchema,
    refreshTokenSchema
} from '../../domain/schemas/user.schemas';

export const login = catchAsync(
    async (req: Request, res: Response) => {
        const validatedInput = loginSchema.parse(req.body);

        const user =
            await emailAuthService.authenticateByEmailAndPassword(
                validatedInput.email,
                validatedInput.password
            );

        const { userAgent, ip } = getClientInfo(req);

        const tokens =
            await refreshTokenService.generateTokenPair(
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
        const validatedInput = refreshTokenSchema.parse(
            req.body
        );

        await refreshTokenService.revokeSessionByToken(
            validatedInput.refreshToken
        );

        ok(res, 'Logout successful');
    }
);

export const refreshToken = catchAsync(
    async (req: Request, res: Response) => {
        const validatedInput = refreshTokenSchema.parse(
            req.body
        );

        const tokens =
            await refreshTokenService.refreshAccessToken(
                validatedInput.refreshToken
            );

        ok(res, 'Token refreshed successfully', {
            accessToken: tokens.accessToken
        });
    }
);

export function getSessions(req: Request, res: Response) {
    res.status(501).json({
        message: 'Not implemented',
        details: 'GET Sessions'
    });
}

export function revokeSession(req: Request, res: Response) {
    res.status(501).json({
        message: 'Not implemented',
        details: 'Revoke Session'
    });
}

function getClientInfo(req: Request): {
    userAgent: string;
    ip: string;
} {
    const userAgent = req.get('user-agent') || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';

    return { userAgent, ip };
}
