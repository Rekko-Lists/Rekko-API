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
import { cacheMiddleware } from '../../../middlewares/cache.middleware';

const CACHE_15_MIN = 15 * 60;
const CACHE_1_HOUR = 60 * 60;
const CACHE_24_HOURS = 24 * 60 * 60;

const router = Router();

router
    .route('/')
    .get(optionalAuthMiddleware, parseQueryOptions, getAnimes);

router
    .route('/genres')
    .get(cacheMiddleware(CACHE_24_HOURS), getGenres);
router
    .route('/seasonal/top')
    .get(cacheMiddleware(CACHE_15_MIN), getTopSeasonalAnimes);
router
    .route('/popular')
    .get(cacheMiddleware(CACHE_1_HOUR), getPopularAnimes);
router
    .route('/airing-today')
    .get(cacheMiddleware(CACHE_15_MIN), getAiringTodayAnimes);
router
    .route('/weekly-airing')
    .get(cacheMiddleware(CACHE_15_MIN), getWeeklyAiringAnimes);
router
    .route('/top-upcoming')
    .get(cacheMiddleware(CACHE_1_HOUR), getTopUpcomingAnimes);
router
    .route('/popular-upcoming')
    .get(
        cacheMiddleware(CACHE_1_HOUR),
        getPopularUpcomingAnimes
    );
router
    .route('/top-airing')
    .get(cacheMiddleware(CACHE_15_MIN), getTopAiringAnimes);
router
    .route('/seed')
    .get(authMiddleware, roleMiddleware(['ADMIN']), seedAnimes);

router
    .route('/season')
    .get(
        cacheMiddleware(CACHE_1_HOUR),
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
