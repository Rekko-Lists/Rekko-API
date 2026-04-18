import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { emailAuthService } from '../../infraestructure/container/user.container';
import { ok } from '../../utils/handlers/response.handler';
import {
    userUpdateEmail,
    userUsernameToken
} from '../../domain/schemas/user.schemas';
import { buildUrl } from '../../utils/handlers/redirect.handler';
import { AuthError } from '../../domain/errors/auth.errors';

export const verifyEmailRequest = catchAsync(
    async (req: Request, res: Response) => {
        const result = await emailAuthService.verifyEmailRequest(
            req.params.username as string
        );

        ok(res, 'Verification email sended.', result);
    }
);

export const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const data = {
                username: req.params.username,
                token: req.query.token
            };

            const validatedInput = userUsernameToken.parse(data);

            await emailAuthService.verifyEmail(validatedInput);

            // El correo se ha verificado
            res.redirect(
                buildUrl({
                    domain:
                        process.env.NODE_ENV === 'development'
                            ? process.env.CLIENT_URL_DEV!
                            : process.env.CLIENT_URL_PROD!,
                    path: '/email-verified',
                    params: { status: 'success' }
                })
            );
        } catch (error) {
            // El correo no se ha verificado y manda al motivo
            if (error instanceof AuthError) {
                return res.redirect(
                    buildUrl({
                        domain:
                            process.env.NODE_ENV ===
                            'development'
                                ? process.env.CLIENT_URL_DEV!
                                : process.env.CLIENT_URL_PROD!,
                        path: '/email-verified',
                        params: { status: error.redirectStatus! }
                    })
                );
            }

            throw error;
        }
    }
);

export const changeEmail = catchAsync(
    async (req: Request, res: Response) => {
        const data = {
            username: req.params.username,
            newEmail: req.body.newEmail
        };

        const validatedInput = userUpdateEmail.parse(data);

        const result =
            await emailAuthService.updateEmailRequest(
                validatedInput
            );

        ok(res, 'Email request sended succesfully.', result);
    }
);

export const changeEmailConfirm = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const data = {
                username: req.params.username,
                token: req.query.token
            };

            const validatedInput = userUsernameToken.parse(data);

            await emailAuthService.updateEmail(validatedInput);

            // El correo se ha cambiado
            res.redirect(
                buildUrl({
                    domain:
                        process.env.NODE_ENV === 'development'
                            ? process.env.CLIENT_URL_DEV!
                            : process.env.CLIENT_URL_PROD!,
                    path: '/email-changed',
                    params: { status: 'success' }
                })
            );
        } catch (error) {
            // El correo no se ha cambiado y manda el motivo
            if (error instanceof AuthError) {
                return res.redirect(
                    buildUrl({
                        domain:
                            process.env.NODE_ENV ===
                            'development'
                                ? process.env.CLIENT_URL_DEV!
                                : process.env.CLIENT_URL_PROD!,
                        path: '/email-changed',
                        params: { status: error.redirectStatus! }
                    })
                );
            }

            throw error;
        }
    }
);
