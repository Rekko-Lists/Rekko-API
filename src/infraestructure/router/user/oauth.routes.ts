import { Router } from 'express';
import {
    oauthDiscord,
    oauthGoogle
} from './../../controllers/user/oauth.controller';

const router = Router();

router.route('/google').post(oauthGoogle);

router.route('/discord').post(oauthDiscord);

export default router;
