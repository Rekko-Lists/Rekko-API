import { PaginatedResponse } from '../../domain/schemas/find.schemas';

export class Paginator {
    paginate<T>(
        items: T[],
        page: number = 1,
        limit: number = 30
    ): PaginatedResponse<T> {
        const total = items.length;
        const pages = Math.ceil(total / limit);

        const validPage = Math.max(
            1,
            Math.min(page, pages || 1)
        );

        const skip = (validPage - 1) * limit;
        const data = items.slice(skip, skip + limit);

        return {
            data,
            pagination: {
                page: validPage,
                limit,
                total,
                pages
            }
        };
    }
}
