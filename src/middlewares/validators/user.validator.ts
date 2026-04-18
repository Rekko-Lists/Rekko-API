import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../../domain/errors/http.errors';
import { FindOptions } from '../../domain/schemas/find.schemas';
import { userSelectableField } from '../../domain/schemas/user.schemas';

export const validateUsername = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const username =
        typeof req.params.username === 'string'
            ? req.params.username
            : undefined;

    if (!username)
        throw new BadRequestError('Username not valid.');

    next();
};

export const validateUserQuery = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const findOptions: FindOptions = (req as any)
        .findOptions as FindOptions;

    if (findOptions.select) {
        findOptions.select.forEach((field: string) => {
            userSelectableField.parse(field);
        });
    }
    next();
};
