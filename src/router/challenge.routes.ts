import { Router } from 'express';
import {
  dailyChallenges,
  dateChallenges,
  historyChallenges
} from '../controllers/challenge.controller';

const router = Router();

router.route('/daily').get(dailyChallenges);

router.route('/history').get(historyChallenges);

router.route('/:date').get(dateChallenges);

export default router;
