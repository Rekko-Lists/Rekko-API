import { Router } from 'express';
import authRouter from './auth.routes';
import oauthRouter from './oauth.routes';
import userRouter from './user.routes';
import postRouter from './post.routes';
import commentRouter from './comment.routes';
import animeRouter from './anime.routes';
import challengeRouter from './challenge.routes';
import malRouter from './mal.routes';

const router = Router();

router.use('/', authRouter);
router.use('/oauth', oauthRouter);
router.use('/user', userRouter);
router.use('/post', postRouter);
router.use('/comment', commentRouter);
router.use('/anime', animeRouter);
router.use('/challenge', challengeRouter);
router.use('/mal', malRouter);

export default router;
