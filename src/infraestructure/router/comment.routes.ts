import { Router } from 'express';
import {
  deleteComment,
  getComment,
  getComments,
  patchComment,
  postComment
} from '../controllers/comment.controller';

const router = Router();

router.route('/').get(getComments).post(postComment);

router
  .route('/:commentid')
  .get(getComment)
  .patch(patchComment)
  .delete(deleteComment);

export default router;
