import { Router } from 'express';
import {
  getMalAnime,
  getMalAnimes
} from './../controllers/mal.controller';

const router = Router();

router.route('/').get(getMalAnimes);

router.route('/:malid').get(getMalAnime);

export default router;
