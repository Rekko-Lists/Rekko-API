import { Request, Response } from 'express';

import { passwordAuthService } from '../../infraestructure/container/user.container';

import { catchAsync } from '../../utils/http/catchAsync';
import { buildUrl } from '../../utils/http/redirect';

import { userResetPassword } from '../../domain/schemas/user/user.schemas';
import { AuthError } from '../../domain/errors/auth.errors';

export const forgotPassword = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const username = req.params.username as string;

            await passwordAuthService.forgotPassoword(username);

            // La SOLICITUD de cambio de cotraseña se ha mandado
            res.redirect(
                buildUrl({
                    domain:
                        process.env.NODE_ENV === 'development'
                            ? process.env.CLIENT_URL_DEV!
                            : process.env.CLIENT_URL_PROD!,
                    path: '/password-forgot',
                    params: { status: 'success' }
                })
            );
        } catch (error) {
            // La SOLICITUD de cambio de contraseña no se ha mandado y manda el motivo
            if (error instanceof AuthError) {
                return res.redirect(
                    buildUrl({
                        domain:
                            process.env.NODE_ENV ===
                            'development'
                                ? process.env.CLIENT_URL_DEV!
                                : process.env.CLIENT_URL_PROD!,
                        path: '/password-forgot',
                        params: { status: error.redirectStatus! }
                    })
                );
            }

            throw error;
        }
    }
);

export const resetPassword = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const data = {
                username: req.params.username,
                token: req.query.token,
                password: req.body.password,
                passwordRepeat: req.body.passwordRepeat
            };

            const validatedInput = userResetPassword.parse(data);

            await passwordAuthService.resetPassword(
                validatedInput
            );

            // La contraseña se ha cambiado
            res.redirect(
                buildUrl({
                    domain:
                        process.env.NODE_ENV === 'development'
                            ? process.env.CLIENT_URL_DEV!
                            : process.env.CLIENT_URL_PROD!,
                    path: '/password-changed',
                    params: { status: 'success' }
                })
            );
        } catch (error) {
            // La contraseña no se ha cambiado y manda el motivo
            if (error instanceof AuthError) {
                return res.redirect(
                    buildUrl({
                        domain:
                            process.env.NODE_ENV ===
                            'development'
                                ? process.env.CLIENT_URL_DEV!
                                : process.env.CLIENT_URL_PROD!,
                        path: '/password-changed',
                        params: { status: error.redirectStatus! }
                    })
                );
            }
            throw error;
        }
    }
);
