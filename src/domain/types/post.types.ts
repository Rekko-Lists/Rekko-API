import { Post } from '../entities/Post';
import { Comment } from '../entities/Comment';

export type PostWithComments = {
    post: Post;
    comments: Comment[];
};
