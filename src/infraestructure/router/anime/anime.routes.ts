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

router
    .route('/:malid/like')
    .post(authMiddleware, likeAnime)
    .delete(authMiddleware, unlikeAnime);

router.route('/:malid').get(getAnime);

export default router;
