import { InvalidTokenError } from '../../domain/errors/auth.errors';
import {
    DiscordAccessToken,
    OAuthData
} from '../../domain/schemas/user/oauth.schemas';

export async function exchangeCodeForToken(
    code: string
): Promise<DiscordAccessToken> {
    const userInfo = discordInfo();

    try {
        const response = await fetch(
            'https://discord.com/api/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: userInfo.clientId,
                    client_secret: userInfo.clientSecret,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: userInfo.redirectUri
                }).toString()
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Discord OAuth Error:', error);
            throw new InvalidTokenError(
                `Discord token exchange failed: ${error.error_description || error.error}`
            );
        }

        const jsonRes = await response.json();

        return { accessToken: jsonRes.access_token };
    } catch (error) {
        throw new InvalidTokenError(
            `Failed to exchange Discord code: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

export async function getDiscordUser(
    accessToken: string
): Promise<OAuthData> {
    try {
        const response = await fetch(
            'https://discord.com/api/users/@me',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new InvalidTokenError(
                `Failed to fetch Discord user: ${response.statusText}`
            );
        }

        const discordUser = await response.json();

        return {
            provider: 'discord',
            providerUserId: discordUser.id,
            email: discordUser.email,
            username: discordUser.username
        };
    } catch (error) {
        throw new InvalidTokenError(
            `Discord user lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
}

function discordInfo() {
    const clientId =
        process.env.NODE_ENV === 'development'
            ? process.env.DISCORD_CLIENT_ID_DEV!
            : process.env.DISCORD_CLIENT_ID_PROD!;

    const clientSecret =
        process.env.NODE_ENV === 'development'
            ? process.env.DISCORD_SECRET_ID_DEV!
            : process.env.DISCORD_SECRET_ID_PROD!;

    const redirectUri =
        process.env.NODE_ENV === 'development'
            ? process.env.DISCORD_REDIRECT_URI_DEV! +
              process.env.DISCORD_PATH_CALLBACK
            : process.env.DISCORD_REDIRECT_URI_PROD! +
              process.env.DISCORD_PATH_CALLBACK;

    return { clientId, clientSecret, redirectUri };
}
