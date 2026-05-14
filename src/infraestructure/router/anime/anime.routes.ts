import { Router } from 'express';
import {
    getAnime,
    getAnimes,
    getSeasonalAnimes
} from '../../../controllers/anime/anime.controller';
import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';
import { validateSeasonParams } from '../../../middlewares/validators/anime.validator';

const router = Router();

router.route('/').get(parseQueryOptions, getAnimes);

router.route('/season').get(
    parseQueryOptions,
    validateSeasonParams,
    getSeasonalAnimes
);

router.route('/:malid').get(getAnime);

export default router;
