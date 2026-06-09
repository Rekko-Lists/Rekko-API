import { Router } from 'express';
import { searchData } from '../../../controllers/search/search.controller';
import { optionalAuthMiddleware } from '../../../middlewares/auth.middleware';
const router = Router();

router.route('/').get(optionalAuthMiddleware, searchData);

export default router;
