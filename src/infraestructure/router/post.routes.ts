import { Router } from 'express';
import {
  deletePost,
  getPost,
  getPosts,
  patchPost,
  postPost
} from '../../controllers/post.controller';

const router = Router();

router.route('/').get(getPosts).post(postPost);

router
  .route('/:postid')
  .get(getPost)
  .patch(patchPost)
  .delete(deletePost);

export default router;
