import { Router } from 'express';
import authRouter from './user/auth.routes';
import oauthRouter from './user/oauth.routes';
import userRouter from './user/user.routes';
import postRouter from './publication/post.routes';
import commentRouter from './comment.routes';
import animeRouter from './anime/anime.routes';
import challengeRouter from './challenge.routes';
import malRouter from './anime/mal.routes';
import searchRouter from './search/search.routes';
import {
    authAuthMiddleware,
    userAuthMiddleware
} from '../../middlewares/auth.middleware';
import { injectDependencies } from '../../middlewares/dependencyInjection.middleware';

const router = Router();

router.use(injectDependencies);

// IMPLEMENTED
router.use('/auth', authAuthMiddleware, authRouter);
router.use('/oauth', oauthRouter);
router.use('/user', userAuthMiddleware, userRouter);
router.use('/mal', malRouter);
router.use('/anime', animeRouter);
router.use('/api/search', searchRouter);
router.use('/post', postRouter);

// WORKING
router.use('/comment', commentRouter);

// NOT IMPLEMENTED YET
router.use('/challenge', challengeRouter);

export default router;
