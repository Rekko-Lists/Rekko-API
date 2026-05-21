import { Router } from 'express';
import {
    getAnime,
    getAnimes,
    getGenres,
    getSeasonalAnimes,
    seedAnimes,
    likeAnime,
    unlikeAnime
} from '../../../controllers/anime/anime.controller';
import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';
import { validateSeasonParams } from '../../../middlewares/validators/anime.validator';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import {
    deleteRate,
    getRate,
    postRate
} from '../../../controllers/anime/rate.controller';
import {
    deleteWatch,
    getWatch,
    postWatch
} from '../../../controllers/anime/watch.controller';

const router = Router();

router.route('/').get(parseQueryOptions, getAnimes);

router.route('/genres').get(getGenres);
router.route('/seed').get(authMiddleware, seedAnimes);

router
    .route('/season')
    .get(
        parseQueryOptions,
        validateSeasonParams,
        getSeasonalAnimes
    );

router.route('/rate').post(authMiddleware, postRate);

router
    .route('/rate/user/:userid')
    .get(parseQueryOptions, getRate);

router.route('/rate/:malid').delete(authMiddleware, deleteRate);

router.route('/watch').post(authMiddleware, postWatch);

router
    .route('/watch/user/:userid')
    .get(parseQueryOptions, getWatch);

router
    .route('/watch/:malid')
    .delete(authMiddleware, deleteWatch);

router
    .route('/:malid/like')
    .post(authMiddleware, likeAnime)
    .delete(authMiddleware, unlikeAnime);

router.route('/:malid').get(getAnime);

export default router;
