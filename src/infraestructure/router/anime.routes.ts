import { Router } from 'express';
import {
  deleteAnime,
  getAnime,
  getAnimes,
  patchAnime,
  postAnime
} from '../../controllers/anime.controller';

const router = Router();

router.route('/').get(getAnimes).post(postAnime);

router
  .route('/:animeid')
  .get(getAnime)
  .patch(patchAnime)
  .delete(deleteAnime);

export default router;
