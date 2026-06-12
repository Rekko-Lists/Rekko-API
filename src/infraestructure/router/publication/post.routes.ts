import { Router } from 'express';
import {
    postPost,
    getPosts,
    getPost,
    deletePost,
    getPostsByUsername,
    getPostsByMalId,
    getPopularPosts,
    likePost,
    unlikePost
} from '../../../controllers/publication/post.controller';

import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';

import {
    uploadMiddleware,
    validateImageType
} from '../../../middlewares/upload.middleware';
import {
    authMiddleware,
    optionalAuthMiddleware
} from '../../../middlewares/auth.middleware';
import { emailVerifyMiddleware } from '../../../middlewares/emailVerify.middleware';

const router = Router();

router
    .route('/')
    .get(optionalAuthMiddleware, parseQueryOptions, getPosts)
    .post(
        authMiddleware,
        // Solo posts/comments requieren email verificado (contenido publico);
        // likes, ratings y watch-list quedan libres a proposito.
        emailVerifyMiddleware,
        uploadMiddleware.single('postImage'),
        validateImageType('postImage'),
        postPost
    );

router
    .route('/by-user/:username')
    .get(
        optionalAuthMiddleware,
        parseQueryOptions,
        getPostsByUsername
    );

router
    .route('/by-anime/:malId')
    .get(
        optionalAuthMiddleware,
        parseQueryOptions,
        getPostsByMalId
    );

router
    .route('/popular')
    .get(optionalAuthMiddleware, getPopularPosts);

router
    .route('/:postid')
    .get(optionalAuthMiddleware, parseQueryOptions, getPost)
    .delete(authMiddleware, deletePost);

router
    .route('/:postid/like')
    .post(authMiddleware, likePost)
    .delete(authMiddleware, unlikePost);

export default router;
