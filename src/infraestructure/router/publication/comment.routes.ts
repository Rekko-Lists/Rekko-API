import { Router } from 'express';
import {
    createComment,
    deleteComment,
    getCommentsByPostId,
    getCommentsByParentId,
    likeComment,
    unlikeComment
} from '../../../controllers/publication/comment.controller';
import {
    authMiddleware,
    optionalAuthMiddleware
} from '../../../middlewares/auth.middleware';
import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';
import { emailVerifyMiddleware } from '../../../middlewares/emailVerify.middleware';

const router = Router();

router
    .route('/')
    .post(authMiddleware, emailVerifyMiddleware, createComment);

router
    .route('/by-post/:postId')
    .get(
        optionalAuthMiddleware,
        parseQueryOptions,
        getCommentsByPostId
    );

router
    .route('/by-parent/:parentId')
    .get(
        optionalAuthMiddleware,
        parseQueryOptions,
        getCommentsByParentId
    );

router
    .route('/:commentid/like')
    .post(authMiddleware, likeComment)
    .delete(authMiddleware, unlikeComment);

router
    .route('/:commentid')
    .delete(authMiddleware, deleteComment);

export default router;
