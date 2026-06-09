import {
    Router,
    Request,
    Response,
    NextFunction
} from 'express';
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
} from '../../../controllers/user/user.controller';
import {
    changeEmail,
    changeEmailConfirm,
    verifyEmail,
    verifyEmailRequest
} from '../../../controllers/user/emailAuth.controller';
import {
    forgotPassword,
    resetPassword
} from '../../../controllers/user/passwordAuth.controller';
import {
    uploadProfileImage,
    uploadBannerImage,
    uploadBackgroundImage
} from '../../../controllers/user/upload.controller';
import {
    getLikedAnimesByUserId,
    getLikedPostsByUserId
} from '../../../controllers/user/like.controller';

import {
    validateUsername,
    validateUserQuery
} from '../../../middlewares/validators/user.validator';
import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';
import {
    uploadMiddleware,
    validateImageType
} from '../../../middlewares/upload.middleware';
import { ownershipMiddleware } from '../../../middlewares/ownership.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';

const router = Router();

router
    .route('/')
    .get(parseQueryOptions, validateUserQuery, getUsers)
    .post(postUser);

router.get(
    '/:id',
    (req: Request, res: Response, next: NextFunction) => {
        if (!/^\d+$/.test(String(req.params.id)))
            return next('route');
        return getUserById(req, res, next);
    }
);

router
    .route('/:userid/liked-animes')
    .get(parseQueryOptions, getLikedAnimesByUserId);

router
    .route('/:userid/liked-posts')
    .get(parseQueryOptions, getLikedPostsByUserId);

router.use('/:username', validateUsername);

router
    .route('/:username')
    .get(parseQueryOptions, validateUserQuery, getUser)
    .patch(ownershipMiddleware, patchUser)
    .delete(ownershipMiddleware, deleteUser);

router
    .route('/:username/change-email')
    .post(ownershipMiddleware, changeEmail);

router
    .route('/:username/change-email/confirm')
    .get(changeEmailConfirm);

router
    .route('/:username/verify-email')
    .post(ownershipMiddleware, verifyEmailRequest);

router.route('/:username/verify-email/confirm').get(verifyEmail);

router
    .route('/:username/social-accounts')
    .patch(ownershipMiddleware, socialAccounts);

router
    .route('/:username/change-username')
    .patch(ownershipMiddleware, changeUsername);

router.route('/:username/forgot-password').post(forgotPassword);

router.route('/:username/reset-password').post(resetPassword);

router
    .route('/:username/reputation')
    .patch(
        roleMiddleware(['ADMIN', 'MODERATOR']),
        patchReputation
    );

router
    .route('/:username/upload-profile-image')
    .post(
        ownershipMiddleware,
        uploadMiddleware.single('profileImage'),
        validateImageType('profileImage'),
        uploadProfileImage
    );

router
    .route('/:username/upload-banner-image')
    .post(
        ownershipMiddleware,
        uploadMiddleware.single('bannerImage'),
        validateImageType('bannerImage'),
        uploadBannerImage
    );

router
    .route('/:username/upload-background-image')
    .post(
        ownershipMiddleware,
        uploadMiddleware.single('backgroundImage'),
        validateImageType('backgroundImage'),
        uploadBackgroundImage
    );

export default router;
