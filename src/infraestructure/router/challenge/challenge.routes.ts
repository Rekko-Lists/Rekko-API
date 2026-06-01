import { Router } from 'express';
import {
    createChallenges,
    deleteChallengesByDate,
    getChallenges,
    getChallengesByDate,
    getDailyChallenges
} from '../../../controllers/challenge/challenge.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';
import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';
import { uploadChallengesMiddleware } from '../../../middlewares/upload.middleware';

const router = Router();

router
    .route('/')
    .get(parseQueryOptions, getChallenges)
    .post(
        authMiddleware,
        roleMiddleware(['ADMIN']),
        uploadChallengesMiddleware.any(),
        createChallenges
    );

router.route('/daily').get(getDailyChallenges);

router
    .route('/:date')
    .get(getChallengesByDate)
    .delete(
        authMiddleware,
        roleMiddleware(['ADMIN']),
        deleteChallengesByDate
    );

export default router;
