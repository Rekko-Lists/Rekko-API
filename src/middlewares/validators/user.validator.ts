import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../../exceptions/exceptions';
import { FindOptions } from '../../domain/schemas/find.schemas';
import {
    userDefaultSelect,
    userSelectableField
} from '../../domain/schemas/user/user.schemas';

const userSortableFields = new Set([
    ...userDefaultSelect,
    'userId',
    'username',
    'email',
    'reputation',
    'role',
    'emailVerified',
    'createdAt'
]);

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
    const findOptions: FindOptions = (req as any)
        .findOptions as FindOptions;

    if (findOptions.select) {
        // Strip silencioso (sin 400) de campos sensibles en rutas publicas:
        // clientes antiguos que aun pidan email siguen funcionando sin recibirlo.
        findOptions.select = findOptions.select.filter(
            (field: string) => field !== 'email'
        );

        // Si solo pedia email, cae al select por defecto.
        if (findOptions.select.length === 0) {
            findOptions.select = undefined;
        }

        findOptions.select?.forEach((field: string) => {
            userSelectableField.parse(field);
        });
    }

    if (findOptions.sort) {
        findOptions.sort.forEach(({ field }) => {
            if (!userSortableFields.has(field)) {
                throw new ValidationError(
                    'Invalid sort field.',
                    {
                        received: field
                    }
                );
            }
        });
    }

    next();
};
