import { Router } from 'express';
import {
  forgotPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword
} from './../controllers/auth.controller';

const router = Router();

router.route('/login').post(login);

router.route('/register').post(register);

router.route('/logout').post(logout);

router.route('/forgot-password').post(forgotPassword);

router.route('/reset-password').post(resetPassword);

router.route('/refresh').post(refreshToken);

export default router;
