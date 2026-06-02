import { Router } from 'express';
import {
    getAnime,
    getAnimes,
    getGenres,
    getSeasonalAnimes,
    getTopSeasonalAnimes,
    getPopularAnimes,
    getAiringTodayAnimes,
    getWeeklyAiringAnimes,
    getTopUpcomingAnimes,
    getPopularUpcomingAnimes,
    getTopAiringAnimes,
    seedAnimes,
    likeAnime,
    unlikeAnime
} from '../../../controllers/anime/anime.controller';
import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';
import { validateSeasonParams } from '../../../middlewares/validators/anime.validator';
import {
    authMiddleware,
    optionalAuthMiddleware
} from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';
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
import {
    getRecommendedViaPosts,
    getSimilarAnimes,
    getPostsByAnime
} from '../../../controllers/anime/recommendations.controller';
import { getRelatedAnimes } from '../../../controllers/anime/animeRelation.controller';

const router = Router();

router
    .route('/')
    .get(optionalAuthMiddleware, parseQueryOptions, getAnimes);

router.route('/genres').get(getGenres);
router.route('/seasonal/top').get(getTopSeasonalAnimes);
router.route('/popular').get(getPopularAnimes);
router.route('/airing-today').get(getAiringTodayAnimes);
router.route('/weekly-airing').get(getWeeklyAiringAnimes);
router.route('/top-upcoming').get(getTopUpcomingAnimes);
router.route('/popular-upcoming').get(getPopularUpcomingAnimes);
router.route('/top-airing').get(getTopAiringAnimes);
router
    .route('/seed')
    .get(authMiddleware, roleMiddleware(['ADMIN']), seedAnimes);

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

router
    .route('/:malid/recommended-via-posts')
    .get(parseQueryOptions, getRecommendedViaPosts);

router.route('/:malid/similar').get(getSimilarAnimes);

router
    .route('/:malid/posts')
    .get(
        optionalAuthMiddleware,
        parseQueryOptions,
        getPostsByAnime
    );

router.route('/:malid/related').get(getRelatedAnimes);

router.route('/:malid').get(optionalAuthMiddleware, getAnime);

export default router;
