import { prisma } from '../database/prisma.client';
import { UserPrismaRepository } from '../persistence/prisma/user/User.prisma.repository';
import { UserService } from '../../services/user/user.service';
import { EmailAuthPrismaRepository } from '../persistence/prisma/user/EmailAuth.prisma.repository';
import { PasswordAuthPrismaRepository } from '../persistence/prisma/user/PasswordAuth.prisma.repository';
import { RefreshTokenPrismaRepository } from '../persistence/prisma/user/RefreshToken.prisma.repository';
import { EmailAuthService } from '../../services/user/emailAuth.service';
import { PasswordAuthService } from '../../services/user/passwordAuth.service';
import { RefreshTokenService } from '../../services/user/refreshToken.service';
import { EmailHandler } from '../../utils/handlers/email.handler';
import { OAuthPrismaRepository } from '../persistence/prisma/user/OAuth.prisma.repository';
import { OAuthService } from '../../services/user/oauth.service';

const userRepository = new UserPrismaRepository(prisma);
const emailAuthRepository = new EmailAuthPrismaRepository(
    prisma
);
const passwordAuthRepository = new PasswordAuthPrismaRepository(
    prisma
);
const refreshTokenRepository = new RefreshTokenPrismaRepository(
    prisma
);
const oauthRepository = new OAuthPrismaRepository(prisma);

const emailHandler = new EmailHandler();

export const userService = new UserService(userRepository);
export const emailAuthService = new EmailAuthService(
    userRepository,
    emailAuthRepository,
    emailHandler
);
export const passwordAuthService = new PasswordAuthService(
    userRepository,
    passwordAuthRepository
);
export const refreshTokenService = new RefreshTokenService(
    userRepository,
    refreshTokenRepository
);
export const oauthService = new OAuthService(
    userRepository,
    emailAuthRepository,
    oauthRepository
);
