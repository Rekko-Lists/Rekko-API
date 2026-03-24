import { Router } from 'express';
import {
  getUser,
  postUser,
  patchUser,
  deleteUser,
  changeEmail,
  changePassword,
  getUsers,
  changeEmailConfirm
} from '../../controllers/user.controller';

const router = Router();

router.route('/').get(getUsers).post(postUser);

router
  .route('/:username')
  .get(getUser)
  .patch(patchUser)
  .delete(deleteUser);

router.route('/:username/change-email').post(changeEmail);

router
  .route('/:username/change-email/confirm')
  .post(changeEmailConfirm);

router.route('/:username/change-password').post(changePassword);

export default router;
