import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import {
    userUpdateEmail,
    userUsernameToken
} from '../../domain/schemas/user/user.schemas';
import { buildUrl } from '../../utils/http/redirect';
import { AppError } from '../../exceptions/exceptions';

export const verifyEmailRequest = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const result =
            await services.emailAuth.verifyEmailRequest(
                req.params.username as string
            );

        ok(res, 'Verification email sended.', result);
    }
);

export const verifyEmail = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const { services } = req.container!;
            const data = {
                username: req.params.username,
                token: req.query.token
            };

            const validatedInput = userUsernameToken.parse(data);

            await services.emailAuth.verifyEmail(validatedInput);

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
            if (error instanceof AppError) {
                return res.redirect(
                    buildUrl({
                        domain:
                            process.env.NODE_ENV ===
                            'development'
                                ? process.env.CLIENT_URL_DEV!
                                : process.env.CLIENT_URL_PROD!,
                        path: '/email-verified',
                        params: { status: 'error', message: error.code }
                    })
                );
            }

            throw error;
        }
    }
);

export const changeEmail = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const data = {
            username: req.params.username,
            newEmail: req.body.newEmail
        };

        const validatedInput = userUpdateEmail.parse(data);

        const result =
            await services.emailAuth.updateEmailRequest(
                validatedInput
            );

        ok(res, 'Email request sended succesfully.', result);
    }
);

export const changeEmailConfirm = catchAsync(
    async (req: Request, res: Response) => {
        try {
            const { services } = req.container!;
            const data = {
                username: req.params.username,
                token: req.query.token
            };

            const validatedInput = userUsernameToken.parse(data);

            await services.emailAuth.updateEmail(validatedInput);

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
            if (error instanceof AppError) {
                return res.redirect(
                    buildUrl({
                        domain:
                            process.env.NODE_ENV ===
                            'development'
                                ? process.env.CLIENT_URL_DEV!
                                : process.env.CLIENT_URL_PROD!,
                        path: '/email-changed',
                        params: { status: 'error', message: error.code }
                    })
                );
            }

            throw error;
        }
    }
);
