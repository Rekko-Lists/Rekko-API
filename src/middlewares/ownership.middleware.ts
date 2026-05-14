import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../exceptions/exceptions';

export const ownershipMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { services } = req.container!;
        const username = req.params.username as string;
        const authenticatedUserId = req.user!.userId;

        const targetUser =
            await services.user.getUserByUsername(username);

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
