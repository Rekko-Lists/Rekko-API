import { Router } from 'express';
import { searchData } from '../../../controllers/search/search.controller';
const router = Router();

router.route('/').get(searchData);

export default router;