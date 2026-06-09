import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { buildUrl } from '../../../utils/http/redirect';

interface EmailTemplateOptions {
    title: string;
    preheader: string;
    bodyHtml: string;
    ctaLabel: string;
    ctaUrl: string;
}

function getClientUrl(): string {
    return process.env.NODE_ENV === 'development'
        ? (process.env.CLIENT_URL_DEV ?? '')
        : (process.env.CLIENT_URL_PROD ?? '');
}

function buildEmailHtml(opts: EmailTemplateOptions): string {
    const clientUrl = getClientUrl();
    const logoUrl = `${clientUrl}/rekko_logo.png`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0F0F1A;font-family:'Segoe UI',Arial,sans-serif;">
  <!-- Preheader (hidden) -->
  <span style="display:none;font-size:1px;color:#0F0F1A;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preheader}</span>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0F0F1A;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#1E1E2E;border-radius:14px;overflow:hidden;border:1px solid #2E2E42;">
          <!-- Header / logo strip -->
          <tr>
            <td align="center" style="background-color:#FF8A00;padding:28px 32px;">
              <img src="${logoUrl}" alt="Rekko" width="130" style="display:block;max-width:130px;height:auto;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.3;">${opts.title}</h1>
              ${opts.bodyHtml}

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                <tr>
                  <td align="center" style="background-color:#FF9E00;border-radius:8px;">
                    <a href="${opts.ctaUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:0.3px;">
                      ${opts.ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:12px;color:#6B6B88;line-height:1.5;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
                <a href="${opts.ctaUrl}" style="color:#FF9E00;word-break:break-all;">${opts.ctaUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;border-top:1px solid #2E2E42;">
              <p style="margin:0;font-size:12px;color:#6B6B88;line-height:1.6;">
                Este enlace expira en <strong style="color:#A0A0B8;">10 minutos</strong>.<br/>
                Si no solicitaste este correo puedes ignorarlo de forma segura.
              </p>
              <p style="margin:16px 0 0;font-size:11px;color:#4A4A62;">
                © Rekko · Anime Social Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export class EmailHandler {
    private transporter: Transporter;

    constructor() {
        const transportOptions: SMTPTransport.Options & {
            family: 4;
        } = {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT) || 587,
            secure: false,
            family: 4,
            connectionTimeout: 15_000,
            greetingTimeout: 15_000,
            socketTimeout: 30_000,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        };

        this.transporter =
            nodemailer.createTransport(transportOptions);
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
            subject: 'Verifica tu correo electronico — Rekko',
            html: buildEmailHtml({
                title: 'Verifica tu email',
                preheader: 'Confirma tu dirección de correo para completar el registro en Rekko.',
                bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#C0C0D8;line-height:1.6;">
                    Hola <strong style="color:#FFFFFF;">${username}</strong>, gracias por unirte a Rekko.<br/>
                    Haz clic en el botón de abajo para verificar tu dirección de correo electrónico.
                </p>`,
                ctaLabel: 'Verificar email',
                ctaUrl: url
            })
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
            subject: 'Confirma tu cambio de email — Rekko',
            html: buildEmailHtml({
                title: 'Cambio de email solicitado',
                preheader: 'Confirma el cambio de tu dirección de correo en Rekko.',
                bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#C0C0D8;line-height:1.6;">
                    Hola <strong style="color:#FFFFFF;">${username}</strong>,<br/>
                    hemos recibido una solicitud para cambiar el email asociado a tu cuenta.<br/>
                    Haz clic en el botón de abajo para confirmarlo.
                </p>`,
                ctaLabel: 'Confirmar cambio de email',
                ctaUrl: url
            })
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
                    ? process.env.APP_URL_DEV!
                    : process.env.APP_URL_PROD!,
            path: process.env.CLIENT_PATH_RESET_PASSWORD!,
            params: { token, username }
        });

        await this.transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: 'Restablece tu contraseña — Rekko',
            html: buildEmailHtml({
                title: 'Restablecer contraseña',
                preheader: 'Solicitud de restablecimiento de contraseña para tu cuenta Rekko.',
                bodyHtml: `<p style="margin:0 0 16px;font-size:15px;color:#C0C0D8;line-height:1.6;">
                    Hola <strong style="color:#FFFFFF;">${username}</strong>,<br/>
                    hemos recibido una solicitud para restablecer la contraseña de tu cuenta.<br/>
                    Haz clic en el botón de abajo para crear una nueva contraseña.
                </p>
                <p style="margin:0 0 0;font-size:13px;color:#6B6B88;">
                    Si no solicitaste este cambio, puedes ignorar este correo.
                </p>`,
                ctaLabel: 'Restablecer contraseña',
                ctaUrl: url
            })
        });
    }
}
