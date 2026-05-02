import { Router } from 'express';
import {
    searchMalAnimes,
    getMalAnime,
    getAuthUrl,
    handleAuthCallback
} from '../../../controllers/anime/mal.controller';

const router = Router();

router.route('/auth/url').get(getAuthUrl);

router.route('/auth/callback').get(handleAuthCallback);

router.route('/search').get(searchMalAnimes);

router.route('/:malid').get(getMalAnime);

export default router;
