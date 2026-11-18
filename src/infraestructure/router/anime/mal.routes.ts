import { Router } from 'express';
import {
    searchMalAnimes,
    getMalAnime,
    getAuthUrl,
    handleAuthCallback
} from '../../../controllers/anime/mal.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';

const router = Router();

router.route('/auth/url').get(authMiddleware, roleMiddleware(['ADMIN']), getAuthUrl);

router.route('/auth/callback').get(handleAuthCallback);

router.route('/search').get(searchMalAnimes);

router.route('/:malid').get(getMalAnime);

export default router;
