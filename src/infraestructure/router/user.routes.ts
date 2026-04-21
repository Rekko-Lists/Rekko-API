import { Router } from 'express';
import {
    getUser,
    postUser,
    patchUser,
    deleteUser,
    getUsers,
    changeUsername,
    socialAccounts,
    patchReputation,
    getUserById
} from '../../controllers/user/user.controller';
import {
    changeEmail,
    changeEmailConfirm,
    verifyEmail,
    verifyEmailRequest
} from '../../controllers/user/emailAuth.controller';
import {
    forgotPassword,
    resetPassword
} from '../../controllers/user/passwordAuth.controller';

import {
    validateUsername,
    validateUserQuery
} from '../../middlewares/validators/user.validator';
import { parseQueryOptions } from '../../middlewares/queryOptions.middleware';

const router = Router();

router
    .route('/')
    .get(parseQueryOptions, validateUserQuery, getUsers)
    .post(postUser);

router.route('/:id').get(getUserById);

router.use('/:username', validateUsername);

router
    .route('/:username')
    .get(parseQueryOptions, validateUserQuery, getUser)
    .patch(patchUser)
    .delete(deleteUser);

router.route('/:username/change-email').post(changeEmail);

router
    .route('/:username/change-email/confirm')
    .get(changeEmailConfirm);

router.route('/:username/verify-email').post(verifyEmailRequest);

router.route('/:username/verify-email/confirm').get(verifyEmail);

router.route('/:username/social-accounts').patch(socialAccounts);

router.route('/:username/change-username').patch(changeUsername);

router.route('/:username/forgot-password').post(forgotPassword);

router.route('/:username/reset-password').post(resetPassword);

router.route('/:username/reputation').patch(patchReputation);

export default router;
