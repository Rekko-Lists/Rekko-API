import { Router } from 'express';
import authRouter from './user/auth.routes';
import oauthRouter from './user/oauth.routes';
import userRouter from './user/user.routes';
import postRouter from './post.routes';
import commentRouter from './comment.routes';
import animeRouter from './anime.routes';
import challengeRouter from './challenge.routes';
import malRouter from './anime/mal.routes';
import {
    authAuthMiddleware,
    userAuthMiddleware
} from '../../middlewares/auth.middleware';

const router = Router();

router.use('/auth', authAuthMiddleware, authRouter);
router.use('/oauth', oauthRouter);
router.use('/user', userAuthMiddleware, userRouter);
router.use('/post', postRouter);
router.use('/comment', commentRouter);
router.use('/anime', animeRouter);
router.use('/challenge', challengeRouter);
router.use('/mal', malRouter);

export default router;
