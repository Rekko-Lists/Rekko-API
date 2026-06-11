import { Router } from 'express';
import {
    getSessions,
    login,
    logout,
    refreshToken,
    revokeSession
} from '../../../controllers/user/auth.controller';
import { forgotPasswordByEmail } from '../../../controllers/user/passwordAuth.controller';

const router = Router();

router.route('/login').post(login);

router.route('/forgot-password').post(forgotPasswordByEmail);

router.route('/logout').post(logout);

router.route('/refresh').post(refreshToken);

router.route('/sessions').get(getSessions);

router.route('/sessions/:id').delete(revokeSession);

export default router;
