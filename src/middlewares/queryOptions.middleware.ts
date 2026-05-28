import { Request, Response, NextFunction } from 'express';
import { findOptionsSchema } from '../domain/schemas/find.schemas';
import { parseFilters } from '../utils/query/filter';

export const parseQueryOptions = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const filters = parseFilters(
            req.query as Record<string, any>
        );

        const findOptions = findOptionsSchema.parse({
            select: req.query.fields
                ? (req.query.fields as string)
                      .split(',')
                      .map((f) => f.trim())
                : undefined,
            pagination: {
                page: req.query.page
                    ? req.query.page
                    : undefined,
                limit: req.query.limit
                    ? req.query.limit
                    : undefined
            },
            sort: req.query.sortField
                ? (req.query.sortField as string)
                      .split(',')
                      .map((field, i) => {
                          const orders = req.query.sortOrder
                              ? (req.query.sortOrder as string).split(',')
                              : [];
                          return {
                              field: field.trim(),
                              order: orders[i]?.trim() === 'desc' ? 'desc' : 'asc'
                          };
                      })
                : undefined,
            filters
        });

        req.findOptions = findOptions;
        next();
    } catch (error) {
        next(error);
    }
};
