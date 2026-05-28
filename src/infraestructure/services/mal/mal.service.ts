import {
    MalRequest,
    malRequestSchema,
    malTokenDataSchema,
    MalTokenResponse,
    malTokenResponseSchema,
    MalTokenResult,
    malTokenResultSchema
} from '../../../domain/schemas/anime/mal.schemas';
import {
    NotFoundError,
    MalApiError
} from '../../../exceptions/exceptions';
import { randomBytes } from 'crypto';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import { DEFAULTS } from '../../../constants';
import { logger } from '../../../utils/logger';

export class MalService {
    private baseUrl = 'https://api.myanimelist.net/v2';
    private authUrl = 'https://myanimelist.net/v1/oauth2';
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private refreshToken: string;
    private tokenExpiresAt: number | null = null;
    private tokenStoreLoaded = false;
    private tokenStorePath: string;
    // Lock para serializar refreshes: si ya hay uno en curso, los demás
    // await sobre la misma promise en lugar de lanzar uno nuevo.
    private refreshLock: Promise<void> | null = null;
    private authorizationRequests = new Map<
        string,
        MalRequest
    >();

    constructor() {
        this.clientId = process.env.MAL_CLIENT_ID!;
        this.clientSecret = process.env.MAL_CLIENT_SECRET!;
        this.refreshToken = process.env.MAL_REFRESH_TOKEN!;
        this.tokenStorePath = resolve(
            process.env.MAL_TOKEN_STORE_PATH || '.mal-token.json'
        );

        this.loadTokenStoreSync();

        if (!this.accessToken) {
            this.accessToken =
                process.env.MAL_ACCESS_TOKEN || null;
            this.tokenExpiresAt = process.env
                .MAL_TOKEN_EXPIRES_AT
                ? Number(process.env.MAL_TOKEN_EXPIRES_AT)
                : null;
        }
    }

    private loadTokenStoreSync(): void {
        try {
            if (!existsSync(this.tokenStorePath)) return;

            const content = require('fs').readFileSync(
                this.tokenStorePath,
                'utf8'
            );
            const tokenData = malTokenDataSchema.parse(
                JSON.parse(content)
            );

            this.accessToken = tokenData.accessToken;
            this.refreshToken = tokenData.refreshToken;
            this.tokenExpiresAt = tokenData.tokenExpiresAt;
            this.tokenStoreLoaded = true;
        } catch (error) {
            logger.warn('Failed to load MAL token store', error);
        }
    }

    getAuthorizationUrl(
        redirectUri: string,
        state: string
    ): string {
        const codeVerifier = this.generateCodeVerifier();

        this.authorizationRequests.set(
            state,
            malRequestSchema.parse({
                codeVerifier,
                redirectUri
            })
        );

        setTimeout(
            () => this.authorizationRequests.delete(state),
            DEFAULTS.MAL_AUTH_REQUEST_TTL_MS
        );

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: redirectUri,
            code_challenge: codeVerifier,
            code_challenge_method: 'plain',
            state
        });

        return `${this.authUrl}/authorize?${params.toString()}`;
    }

    async getAccessToken(
        authCode: string,
        state: string
    ): Promise<MalTokenResult> {
        const authorizationRequest =
            this.authorizationRequests.get(state);

        if (!authorizationRequest) {
            throw new MalApiError(
                'Code verifier not found or expired. Please start authorization again.'
            );
        }

        const data = await this.requestToken(
            new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: authCode,
                redirect_uri: authorizationRequest.redirectUri,
                code_verifier: authorizationRequest.codeVerifier,
                grant_type: 'authorization_code'
            }),
            'Failed to get MAL access token'
        );

        await this.setTokenData(data);
        this.authorizationRequests.delete(state);

        return malTokenResultSchema.parse({
            accessToken: this.accessToken || '',
            refreshToken: this.refreshToken,
            expiresIn: data.expires_in
        });
    }

    async fetchFromMal(
        endpoint: string,
        params?: Record<string, string | number>
    ): Promise<Response> {
        await this.ensureAccessToken();

        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.entries(params || {}).forEach(([key, value]) => {
            url.searchParams.append(key, String(value));
        });

        const response = await fetch(url.toString(), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.accessToken}`
            },
            // Cap total request a 15s — MAL puede ser lento pero raramente
            // tarda más de esto. Antes era 8s y provocaba timeouts espurios.
            signal: AbortSignal.timeout(
                DEFAULTS.MAL_REQUEST_TIMEOUT_MS
            )
        });

        if (response.status === 404) {
            throw new NotFoundError(
                `MAL resource not found: ${endpoint}`
            );
        }

        if (!response.ok) {
            throw new MalApiError(
                `MAL API Error: ${response.status} - ${response.statusText}`,
                response.status
            );
        }

        return response;
    }

    private generateCodeVerifier(): string {
        return randomBytes(64)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    private async ensureAccessToken(): Promise<void> {
        await this.loadTokenStore();

        if (this.isTokenValid()) return;

        // Si ya hay un refresh en curso (otro slot concurrente lo inició),
        // esperamos a que termine y re-chequeamos. Así solo se hace una
        // llamada a MAL /token aunque lleguen N requests simultáneos.
        if (this.refreshLock) {
            await this.refreshLock;
            if (this.isTokenValid()) return;
        }

        this.refreshLock = this.refreshAccessToken().finally(() => {
            this.refreshLock = null;
        });

        await this.refreshLock;
    }

    private isTokenValid(): boolean {
        return (
            this.accessToken !== null &&
            this.tokenExpiresAt !== null &&
            Date.now() <
                this.tokenExpiresAt -
                    DEFAULTS.MAL_TOKEN_REFRESH_MARGIN_MS
        );
    }

    private async refreshAccessToken(): Promise<void> {
        const data = await this.requestToken(
            new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.refreshToken,
                grant_type: 'refresh_token'
            }),
            'Failed to refresh MAL access token'
        );

        await this.setTokenData(data);
    }

    private async requestToken(
        params: URLSearchParams,
        errorMessage: string
    ): Promise<MalTokenResponse> {
        const response = await fetch(`${this.authUrl}/token`, {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded'
            },
            body: params.toString(),
            signal: AbortSignal.timeout(
                DEFAULTS.MAL_REQUEST_TIMEOUT_MS
            )
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new MalApiError(
                `${errorMessage}: ${response.status} - ${response.statusText} - ${errorBody}`,
                response.status
            );
        }

        return malTokenResponseSchema.parse(
            await response.json()
        );
    }

    private async setTokenData(
        data: MalTokenResponse
    ): Promise<void> {
        this.accessToken = data.access_token;
        this.refreshToken =
            data.refresh_token || this.refreshToken;
        this.tokenExpiresAt =
            Date.now() + data.expires_in * 1000;

        await this.persistTokenStore();
    }

    private async loadTokenStore(): Promise<void> {
        if (this.tokenStoreLoaded) return;

        this.tokenStoreLoaded = true;

        try {
            const tokenData = malTokenDataSchema.parse(
                JSON.parse(
                    await readFile(this.tokenStorePath, 'utf8')
                )
            );

            this.accessToken = tokenData.accessToken;
            this.refreshToken = tokenData.refreshToken;
            this.tokenExpiresAt = tokenData.tokenExpiresAt;
        } catch (error: unknown) {
            const code =
                typeof error === 'object' &&
                error !== null &&
                'code' in error
                    ? error.code
                    : undefined;

            if (code !== 'ENOENT') {
                throw error;
            }
        }
    }

    private async persistTokenStore(): Promise<void> {
        if (
            !this.accessToken ||
            !this.refreshToken ||
            !this.tokenExpiresAt
        ) {
            return;
        }

        const tokenData = malTokenDataSchema.parse({
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            tokenExpiresAt: this.tokenExpiresAt
        });

        await mkdir(dirname(this.tokenStorePath), {
            recursive: true
        });
        await writeFile(
            this.tokenStorePath,
            JSON.stringify(tokenData, null, 2),
            'utf8'
        );
    }
}
