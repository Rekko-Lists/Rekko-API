import { Request, Response, NextFunction } from 'express';
import { findOptionsSchema } from '../domain/schemas/find.schemas';

export const parseQueryOptions = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
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
                ? {
                      field: req.query.sortField as string,
                      order:
                          (req.query.sortOrder as string) ===
                          'desc'
                              ? 'desc'
                              : 'asc'
                  }
                : undefined
        });

        (req as any).findOptions = findOptions;

        next();
    } catch (error) {
        next(error);
    }
};
