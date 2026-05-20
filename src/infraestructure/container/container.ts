import { prisma } from '../database/prisma.client';

// ===== REPOSITORIES =====
import { AnimePrismaRepository } from '../persistence/prisma/anime/Anime.prisma.repository';
import { UserPrismaRepository } from '../persistence/prisma/user/User.prisma.repository';
import { EmailAuthPrismaRepository } from '../persistence/prisma/user/EmailAuth.prisma.repository';
import { PasswordAuthPrismaRepository } from '../persistence/prisma/user/PasswordAuth.prisma.repository';
import { RefreshTokenPrismaRepository } from '../persistence/prisma/user/RefreshToken.prisma.repository';
import { OAuthPrismaRepository } from '../persistence/prisma/user/OAuth.prisma.repository';
import { PostPrismaRepository } from '../persistence/prisma/publication/Post.prisma.repository';
import { LikePrismaRepository } from '../persistence/prisma/publication/Like.prisma.repository';
import { CommentPrismaRepository } from '../persistence/prisma/publication/Comment.prisma.repository';

// ===== EXTERNAL SERVICES (Mailer, Storage) =====
import { EmailHandler } from '../services/mailer/nodemailer.service';
import { CloudinaryHandler } from '../services/storage/cloudinary.service';
import { MalService as MalApiService } from '../services/mal/mal.service';

// ===== DOMAIN SERVICES =====
import { MalService } from '../../services/anime/mal.service';
import { AnimeService } from '../../services/anime/anime.service';
import { SearchService } from '../../services/search/search.service';
import { UserService } from '../../services/user/user.service';
import { EmailAuthService } from '../../services/user/emailAuth.service';
import { PasswordAuthService } from '../../services/user/passwordAuth.service';
import { RefreshTokenService } from '../../services/user/refreshToken.service';
import { OAuthService } from '../../services/user/oauth.service';
import { UploadService } from '../../services/user/upload.service';
import { PostService } from '../../services/publication/post.service';
import { LikeService } from '../../services/publication/like.service';
import { CommentService } from '../../services/publication/comment.service';

// ===== REPOSITORIES INITIALIZATION =====
const animeRepository = new AnimePrismaRepository(prisma);
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
const postRepository = new PostPrismaRepository(prisma);
const likeRepository = new LikePrismaRepository(prisma);
const commentRepository = new CommentPrismaRepository(prisma);

// ===== EXTERNAL SERVICES INITIALIZATION =====
const emailHandler = new EmailHandler();
const cloudinaryHandler = new CloudinaryHandler();

// ===== MAL API SERVICE (Anime from MyAnimeList) =====
const malAuthService = new MalApiService();
const malService = new MalService(malAuthService);

// ===== ANIME SERVICES =====
const animeService = new AnimeService(
    animeRepository,
    malService
);
const searchService = new SearchService(
    animeRepository,
    userRepository,
    postRepository,
    malService
);

// ===== USER SERVICES =====
const userService = new UserService(userRepository);
const emailAuthService = new EmailAuthService(
    userRepository,
    emailAuthRepository,
    emailHandler
);
const passwordAuthService = new PasswordAuthService(
    userRepository,
    passwordAuthRepository
);
const refreshTokenService = new RefreshTokenService(
    userRepository,
    refreshTokenRepository
);
const oauthService = new OAuthService(
    userRepository,
    emailAuthRepository,
    oauthRepository,
    emailAuthService
);
const uploadService = new UploadService(
    userService,
    cloudinaryHandler
);
const likeService = new LikeService(
    likeRepository,
    postRepository,
    commentRepository,
    animeRepository
);
const postService = new PostService(
    postRepository,
    commentRepository,
    cloudinaryHandler,
    likeService
);

const commentService = new CommentService(
    commentRepository,
    postRepository,
    likeService
);

// ===== CONTAINER EXPORT =====
export const container = {
    repositories: {
        anime: animeRepository,
        user: userRepository,
        emailAuth: emailAuthRepository,
        passwordAuth: passwordAuthRepository,
        refreshToken: refreshTokenRepository,
        oauth: oauthRepository,
        post: postRepository
    },
    externalServices: {
        emailHandler,
        cloudinaryHandler,
        malAuth: malAuthService
    },
    services: {
        anime: animeService,
        search: searchService,
        user: userService,
        emailAuth: emailAuthService,
        passwordAuth: passwordAuthService,
        refreshToken: refreshTokenService,
        oauth: oauthService,
        upload: uploadService,
        post: postService,
        comment: commentService,
        like: likeService,
        mal: malService
    }
} as const;

export type Container = typeof container;
