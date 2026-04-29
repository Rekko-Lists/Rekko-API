import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import { EmailAuthRepository } from '../../domain/repositories/user/EmailAuth.repository';
import { OAuthRepository } from '../../domain/repositories/user/OAuth.repository';
import { UserNotFoundError } from '../../domain/errors/auth.errors';
import { OAuthData } from '../../domain/schemas/user.schemas';
import { verifyFirebaseTokenId } from '../../utils/oauth/firebase';
import {
    exchangeCodeForToken,
    getDiscordUser
} from '../../utils/oauth/discord';
import { OAuth } from '../../domain/entities/OAuth';
import { emailAuthService } from '../../infraestructure/container/user.container';

export class OAuthService {
    constructor(
        private readonly userRepository: UserRepository<User>,
        private readonly emailAuthRepository: EmailAuthRepository<User>,
        private readonly oauthRepository: OAuthRepository<OAuth>
    ) {}

    async googleAuth(tokenId: string) {
        const googleUser = await verifyFirebaseTokenId(tokenId);

        const data: OAuthData = {
            provider: 'google',
            providerUserId: googleUser.uid,
            email: googleUser.email
        };

        const user = await this.createUserAccount(data);

        await this.createOAuthAccount(user.getUserId(), data);

        return user;
    }

    async discordAuth(code: string) {
        const { accessToken } = await exchangeCodeForToken(code);

        const data = await getDiscordUser(accessToken);

        const user = await this.createUserAccount(data);

        await this.createOAuthAccount(user.getUserId(), data);

        return user;
    }

    private async createUserAccount(data: OAuthData) {
        let user = await this.emailAuthRepository.findByEmail(
            data.email
        );

        if (!user) {
            const oauthUser = User.fromOAuth(data);

            user = await this.userRepository.create(oauthUser);

            if (!user) {
                throw new UserNotFoundError(
                    'Failed to create OAuth user'
                );
            }

            await emailAuthService.verifyEmailRequest(
                user.getUsername()
            );
        }

        return user;
    }

    private async createOAuthAccount(
        userId: number,
        data: OAuthData
    ) {
        let oauthAccount =
            await this.oauthRepository.findByProviderAndProviderUserId(
                data.provider,
                data.providerUserId
            );

        if (!oauthAccount) {
            const oauth = OAuth.fromPersistence({
                oauthId: 0,
                userId,
                provider: data.provider,
                providerUserId: data.providerUserId
            });

            await this.oauthRepository.link(oauth);
        }
    }
}
