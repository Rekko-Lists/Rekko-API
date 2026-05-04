import { Router } from 'express';
import {
    getAnime,
    getSearchAnimes,
    postAnime
} from '../../../controllers/anime/anime.controller';

const router = Router();

router.route('/search').get(getSearchAnimes);

router.route('/import/mal/:malid').post(postAnime);

router.route('/:animeid').get(getAnime);

export default router;
