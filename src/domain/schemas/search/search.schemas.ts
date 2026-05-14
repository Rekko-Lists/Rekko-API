import { FindOptions } from '../find.schemas';

export const SEARCH_LIMITS = {
    DB_LOCAL_LIMIT: 50,
    MAL_SEARCH_LIMIT: 100,
    MAL_TRENDING_LIMIT: 500,
    DEFAULT_PAGE_LIMIT: 30,
    USER_SEARCH_LIMIT: 20,
    MAX_RESULTS: 10
};

export interface SearchOptions extends FindOptions {
    query?: string | null;
}
