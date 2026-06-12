import { Router } from 'express';
import {
    createChallenges,
    deleteChallengesByDate,
    getChallenges,
    getChallengesByDate,
    getDailyChallenges,
    updateChallenge
} from '../../../controllers/challenge/challenge.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { roleMiddleware } from '../../../middlewares/role.middleware';
import { parseQueryOptions } from '../../../middlewares/queryOptions.middleware';
import { uploadChallengesMiddleware } from '../../../middlewares/upload.middleware';

const router = Router();

// Los GET de listado/por-fecha exponen las respuestas del Animedle:
// solo ADMIN. El juego publico consume unicamente /daily.
router
    .route('/')
    .get(
        authMiddleware,
        roleMiddleware(['ADMIN']),
        parseQueryOptions,
        getChallenges
    )
    .post(
        authMiddleware,
        roleMiddleware(['ADMIN']),
        uploadChallengesMiddleware.any(),
        createChallenges
    );

router.route('/daily').get(getDailyChallenges);

router
    .route('/:date')
    .get(
        authMiddleware,
        roleMiddleware(['ADMIN']),
        getChallengesByDate
    )
    .delete(
        authMiddleware,
        roleMiddleware(['ADMIN']),
        deleteChallengesByDate
    );

router
    .route('/:challengeId')
    .patch(
        authMiddleware,
        roleMiddleware(['ADMIN']),
        uploadChallengesMiddleware.any(),
        updateChallenge
    );

export default router;
