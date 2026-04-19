import { Router } from 'express';
import {
    getSessions,
    login,
    logout,
    refreshToken,
    register,
    revokeSession
} from '../../controllers/user/auth.controller';

const router = Router();

router.route('/login').post(login);

router.route('/register').post(register);

router.route('/logout').post(logout);

router.route('/refresh').post(refreshToken);

router.route('/sessions').get(getSessions);

router.route('/sessions/:id').delete(revokeSession);

export default router;
