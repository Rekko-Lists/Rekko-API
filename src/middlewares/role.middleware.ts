import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../exceptions/exceptions';
import { UserRole } from '../domain/schemas/user/user.schemas';

export const roleMiddleware =
    (allowedRoles: UserRole[]) =>
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user) {
                throw new ForbiddenError('User not authenticated');
            }

            const currentUser = await req.container!.services.user.getUserById(
                req.user.userId
            );
            const currentRole = currentUser.getRole() as UserRole;
            req.user.role = currentRole;

            if (!allowedRoles.includes(currentRole)) {
                throw new ForbiddenError(
                    `Access denied. Required roles: ${allowedRoles.join(', ')}`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
