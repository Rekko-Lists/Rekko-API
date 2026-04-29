import { Request, Response, NextFunction } from 'express';
import { userService } from '../infraestructure/container/user.container';
import { ForbiddenError } from '../domain/errors/auth.errors';

export const ownershipMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const username = req.params.username as string;
        const authenticatedUserId = req.user!.userId;

        const targetUser =
            await userService.getUserByUsername(username);

        if (targetUser.getUserId() !== authenticatedUserId) {
            throw new ForbiddenError(
                `You do not have permission to modify user ${username}`
            );
        }

        next();
    } catch (error) {
        next(error);
    }
};
