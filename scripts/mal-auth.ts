/**
 * MAL OAuth — automatización del flujo de autorización contra un backend ya
 * desplegado (p. ej. producción en Railway).
 *
 * Qué hace, de punta a punta:
 *  1. Pide al backend `GET {BASE}/mal/auth/url` → devuelve { authUrl, state }.
 *     El backend guarda en memoria el codeVerifier asociado a ese `state`.
 *  2. Abre la `authUrl` de MyAnimeList en un navegador (Playwright) y, si hace
 *     falta, inicia sesión con tu cuenta de MAL y pulsa "Allow".
 *  3. MAL redirige a `{BASE}/mal/auth/callback?code&state` — es decir, al MISMO
 *     backend — que intercambia el code por tokens y los PERSISTE en su token
 *     store (`MAL_TOKEN_STORE_PATH`). A partir de ahí el backend ya puede
 *     hablar con la API de MAL.
 *
 * IMPORTANTE: la `authUrl` y el callback deben caer en la misma instancia del
 * backend (el codeVerifier vive en memoria). En Railway con una sola réplica
 * esto se cumple. Solo tienes que poner en la app de MAL, como redirect URI,
 * exactamente `{APP_URL_PROD}/mal/auth/callback`.
 *
 * Uso:
 *   1. Instala Playwright una vez:  npm i -D playwright  &&  npx playwright install chromium
 *   2. Define las variables de entorno (ver abajo) en .env o en el shell.
 *   3. Ejecuta:  npm run mal:auth
 *
 * Variables de entorno que lee este script:
 *   MAL_AUTH_BASE_URL  Base del backend a autorizar. Si no, usa APP_URL_PROD.
 *                      Ej: https://tu-api.up.railway.app
 *   MAL_LOGIN_USER     Usuario/email de tu cuenta de MyAnimeList.
 *   MAL_LOGIN_PASS     Contraseña de tu cuenta de MyAnimeList.
 *   MAL_AUTH_HEADLESS  "true" para ocultar el navegador (por defecto se muestra,
 *                      útil si MAL pide captcha y lo tienes que resolver a mano).
 */
import 'dotenv/config';
import { chromium, Page } from 'playwright';

const BASE = (
    process.env.MAL_AUTH_BASE_URL ||
    process.env.APP_URL_PROD ||
    ''
).replace(/\/+$/, '');

const LOGIN_USER = process.env.MAL_LOGIN_USER || '';
const LOGIN_PASS = process.env.MAL_LOGIN_PASS || '';
const HEADLESS = process.env.MAL_AUTH_HEADLESS === 'true';

const CALLBACK_GLOB = '**/mal/auth/callback*';

function log(...args: unknown[]): void {
    console.log('[mal-auth]', ...args);
}

function fail(message: string): never {
    console.error('[mal-auth] ERROR:', message);
    process.exit(1);
}

/** Pide al backend de producción la URL de autorización + state. */
async function getAuthorizationUrl(): Promise<{
    authUrl: string;
    state: string;
}> {
    const url = `${BASE}/mal/auth/url`;
    log(`Pidiendo authUrl a ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
        fail(
            `El backend respondió ${res.status} al pedir /mal/auth/url. ` +
                `¿Está vivo ${BASE}?`
        );
    }

    const body = (await res.json()) as {
        data?: { authUrl?: string; state?: string };
    };

    const authUrl = body.data?.authUrl;
    const state = body.data?.state;
    if (!authUrl || !state) {
        fail(
            'Respuesta inesperada de /mal/auth/url (faltan authUrl/state): ' +
                JSON.stringify(body)
        );
    }

    return { authUrl, state };
}

/** Rellena el login de MAL si la página lo está pidiendo. */
async function loginIfNeeded(page: Page): Promise<void> {
    const userField = page
        .locator('input[name="loginUserName"], #loginUserName')
        .first();

    // Si no aparece el formulario de login en unos segundos, asumimos que ya
    // hay sesión (cookies) y seguimos al paso de consentimiento.
    try {
        await userField.waitFor({ state: 'visible', timeout: 8000 });
    } catch {
        log('No hay formulario de login (sesión ya iniciada). Continuo.');
        return;
    }

    if (!LOGIN_USER || !LOGIN_PASS) {
        fail(
            'MAL pide login pero MAL_LOGIN_USER / MAL_LOGIN_PASS no están ' +
                'definidos. Defínelos o inicia sesión a mano en el navegador.'
        );
    }

    log('Rellenando login de MAL…');
    await userField.fill(LOGIN_USER);
    await page
        .locator('input[name="password"], #login-password')
        .first()
        .fill(LOGIN_PASS);

    const submit = page
        .locator(
            'button.btn-form-submit, input[type="submit"], button[type="submit"]'
        )
        .first();
    await Promise.all([
        page
            .waitForLoadState('networkidle')
            .catch(() => undefined),
        submit.click()
    ]);

    log(
        'Login enviado. Si MAL muestra un captcha, resuélvelo en el ' +
            'navegador; el script espera.'
    );
}

/** Pulsa el botón "Allow"/"Agree" del consentimiento OAuth si aparece. */
async function approveIfNeeded(page: Page): Promise<void> {
    // Si ya estamos en el callback, MAL auto-aprobó (app ya autorizada antes).
    if (page.url().includes('/mal/auth/callback')) return;

    const allow = page
        .locator(
            [
                'input[type="submit"][value="Allow"]',
                'button:has-text("Allow")',
                'button:has-text("Agree")',
                'button:has-text("Permitir")',
                'input[value="Allow"]'
            ].join(', ')
        )
        .first();

    try {
        await allow.waitFor({ state: 'visible', timeout: 15000 });
    } catch {
        log(
            'No vi botón de "Allow" (puede que MAL ya tuviera la app ' +
                'autorizada). Continuo.'
        );
        return;
    }

    log('Pulsando "Allow"…');
    await allow.click();
}

async function main(): Promise<void> {
    if (!BASE) {
        fail(
            'Falta la base del backend. Define MAL_AUTH_BASE_URL o APP_URL_PROD.'
        );
    }

    const { authUrl } = await getAuthorizationUrl();

    const browser = await chromium.launch({ headless: HEADLESS });
    const page = await browser.newPage();

    let callbackBody = '';
    try {
        log('Abriendo la URL de autorización de MAL…');
        await page.goto(authUrl, { waitUntil: 'domcontentloaded' });

        await loginIfNeeded(page);
        await approveIfNeeded(page);

        log('Esperando la redirección al callback del backend…');
        await page.waitForURL(CALLBACK_GLOB, { timeout: 60000 });

        // El callback del backend responde JSON; lo leemos del <body>.
        callbackBody = await page.evaluate(
            () => document.body.innerText
        );
    } catch (err) {
        await browser.close();
        fail(
            'El flujo no llegó al callback a tiempo. ' +
                (err instanceof Error ? err.message : String(err))
        );
    }

    await browser.close();

    let parsed: { success?: boolean; message?: string } = {};
    try {
        parsed = JSON.parse(callbackBody);
    } catch {
        fail(
            'El callback no devolvió JSON válido. Respuesta:\n' +
                callbackBody.slice(0, 500)
        );
    }

    if (parsed.success) {
        log('✅ Listo. El backend obtuvo y persistió el token de MAL.');
        log(`   Mensaje del backend: ${parsed.message ?? '(sin mensaje)'}`);
    } else {
        fail(
            'El backend no confirmó éxito. Respuesta:\n' +
                JSON.stringify(parsed, null, 2)
        );
    }
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
