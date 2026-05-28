import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../exceptions/exceptions';
import { FindOptions } from '../../domain/schemas/find.schemas';
import { userSelectableField } from '../../domain/schemas/user/user.schemas';

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
        throw new ValidationError('Username not valid.', {
            received: username,
            pattern: '/^[a-zA-Z0-9_-]*$/'
        });

    next();
};

export const validateUserQuery = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const findOptions = req.findOptions as FindOptions;

    if (findOptions?.select) {
        findOptions.select.forEach((field: string) => {
            userSelectableField.parse(field);
        });
    }
    next();
};
