import { Router } from 'express';
import {
  oauth,
  callback
} from '../controllers/oauth.controller';

const router = Router();

router.route('/:provider').get(oauth);

router.route('/:provider/callback').get(callback);

export default router;
