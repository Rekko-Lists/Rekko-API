import nodemailer, { Transporter } from 'nodemailer';
import { buildUrl } from '../../../utils/http/redirect';

export class EmailHandler {
    private transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
    }

    async sendVerifyEmail(
        email: string,
        username: string,
        token: string
    ): Promise<void> {
        const url = buildUrl({
            domain:
                process.env.NODE_ENV! === 'development'
                    ? process.env.APP_URL_DEV! +
                      ':' +
                      process.env.SERVER_PORT
                    : process.env.APP_URL_PROD!,
            path: `/user/${username}/verify-email/confirm`,
            params: { token }
        });

        await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Verifica tu correo electronico',
            html: `
                <h2>Verifica tu email</h2>
                <p>Haz click en el link para confirmar:</p>
                <a href="${url}">Verificar email</a>
                <p>Este link expira en 10 minutos.</p>
            `
        });
    }

    async sendChangeEmailConfirmation(
        email: string,
        username: string,
        token: string
    ): Promise<void> {
        const url = buildUrl({
            domain:
                process.env.NODE_ENV! === 'development'
                    ? process.env.APP_URL_DEV! +
                      ':' +
                      process.env.SERVER_PORT
                    : process.env.APP_URL_PROD!,
            path: `/user/${username}/change-email/confirm`,
            params: { token }
        });

        await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Confirma tu cambio de email',
            html: `
                <h2>Confirma tu cambio de email</h2>
                <p>Haz click en el link para confirmar:</p>
                <a href="${url}">Confirmar email</a>
                <p>Este link expira en 10 minutos.</p>
            `
        });
    }

    async sendChangePasswordConfirmation(
        email: string,
        username: string,
        token: string
    ): Promise<void> {
        const url = buildUrl({
            domain:
                process.env.NODE_ENV! === 'development'
                    ? process.env.CLIENT_URL_DEV!
                    : process.env.CLIENT_URL_PROD!,
            path: process.env.CLIENT_PATH_RESET_PASSWORD!,
            params: { token, username }
        });

        await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Confirma tu cambio de contraseña',
            html: `
                <h2>Confirma tu cambio de contraseña</h2>
                <p>Haz click en el link para confirmar:</p>
                <a href="${url}">Confirmar contraseña</a>
                <p>Este link expira en 10 minutos.</p>
            `
        });
    }
}
