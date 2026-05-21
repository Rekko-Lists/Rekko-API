import { Request, Response } from 'express';
import { catchAsync } from '../../utils/http/catchAsync';
import { ok } from '../../utils/http/response';
import { ValidationError } from '../../exceptions/exceptions';
import { SEARCH_LIMITS } from '../../domain/schemas/search/search.schemas';
import { AnimeMapper } from '../../domain/entities/mappers/AnimeMapper';

export const searchData = catchAsync(
    async (req: Request, res: Response) => {
        const { q } = req.query;

        if (!q || typeof q !== 'string' || q.length < 3) {
            throw new ValidationError(
                'Query parameter "q" is required and must be 3 or more characters',
                {
                    received: q,
                    minLength: 3
                }
            );
        }

        const { services } = req.container!;
        const userId = req.user?.userId;

        const [animeResult, users, posts] = await Promise.all([
            services.search.searchAnimesWithMalPaginated(
                q,
                1,
                SEARCH_LIMITS.DEFAULT_PAGE_LIMIT
            ),
            services.search.searchUsers(q),
            services.search.searchPosts(q)
        ]);

        const mappedAnimes = AnimeMapper.toDTOs(
            animeResult.data
        );

        const mappedUsers = users.map((user: any) => ({
            userId: user.getUserId?.() || user.userId || null,
            username:
                user.getUsername?.() || user.username || '',
            profileImage:
                user.getProfileImage?.() ||
                user.profileImage ||
                ''
        }));

        const mappedPosts =
            await services.post.enrichPostsWithLikesStatus(
                posts,
                userId
            );

        ok(res, 'Search results', {
            animes: mappedAnimes,
            users: mappedUsers,
            posts: mappedPosts,
            withMalData: animeResult.withMalData
        });
    }
);
