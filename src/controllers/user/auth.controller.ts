import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import {
    refreshTokenService,
    emailAuthService
} from '../../infraestructure/container/user.container';
import { ok } from '../../utils/handlers/response.handler';
import { loginSchema } from '../../domain/schemas/user.schemas';

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

export function register(req: Request, res: Response) {
    res.status(200).send('Register');
}

export function logout(req: Request, res: Response) {
    res.status(200).send('Logout');
}

export function refreshToken(req: Request, res: Response) {
    res.status(200).send('Refresh Token');
}

export function getSessions(req: Request, res: Response) {
    res.status(200).send('Forgot Password');
}

export function revokeSession(req: Request, res: Response) {
    res.status(200).send('Forgot Password');
}

function getClientInfo(req: Request): {
    userAgent: string;
    ip: string;
} {
    const userAgent = req.get('user-agent') || 'Unknown';
    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';

    return { userAgent, ip };
}
