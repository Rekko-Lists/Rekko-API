import { z } from 'zod';

export const paginationSchema = z
    .object({
        page: z.number().positive().optional(),
        limit: z.number().positive().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
        cursor: z.string().optional()
    })
    .strict();

export type Pagination = z.infer<typeof paginationSchema>;
