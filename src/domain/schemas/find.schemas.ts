import { z } from 'zod';

// Filter operators schema
export const filterOperatorSchema = z.object({
    lt: z.any().optional().describe('Less than'),
    lte: z.any().optional().describe('Less than or equal'),
    gt: z.any().optional().describe('Greater than'),
    gte: z.any().optional().describe('Greater than or equal'),
    eq: z.any().optional().describe('Equal'),
    ne: z.any().optional().describe('Not equal')
});

export type FilterOperator = z.infer<
    typeof filterOperatorSchema
>;

export const findOptionsSchema = z.object({
    select: z
        .array(z.string())
        .optional()
        .describe('Campos a retornar'),
    pagination: z
        .object({
            page: z.coerce
                .number()
                .int('Must be integer')
                .min(1, 'Page must be greater than 0')
                .default(1),
            limit: z.coerce
                .number()
                .int('Must be integer')
                .min(1, 'Limit must be at least 1')
                .max(20, 'Maximum limit is 20')
                .default(10)
        })
        .default({ page: 1, limit: 10 }),
    sort: z
        .object({
            field: z.string(),
            order: z.enum(['asc', 'desc']).default('asc')
        })
        .optional(),
    filters: z
        .record(z.string(), filterOperatorSchema)
        .optional()
});

export const findRepositorySchema = z.object({
    data: z.array(z.any()),
    total: z.number()
});

export const paginatedResponseSchema = z.object({
    data: z.array(z.any()),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        pages: z.number()
    })
});

export type FindOptions = z.infer<typeof findOptionsSchema>;
export type FindRepository<T> = {
    data: T[];
    total: number;
};
export type PaginatedResponse<T> = {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
};

export type PaginatedResponseWithMalStatus<T> =
    PaginatedResponse<T> & {
        withMalData: boolean;
    };
