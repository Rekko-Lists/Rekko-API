import { Request, Response } from 'express';

import { created, ok } from '../../utils/http/response';
import { catchAsync } from '../../utils/http/catchAsync';

import {
    createUserSchema,
    userUpdateUsername,
    userUpdateProfileSchema,
    userUpdateSocialAccounts,
    updateReputation
} from '../../domain/schemas/user/user.schemas';
import { FindOptions } from '../../domain/schemas/find.schemas';

export const postUser = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const validatedInput = createUserSchema.parse(req.body);

        const user =
            await services.user.createUser(validatedInput);

        await services.emailAuth.verifyEmailRequest(
            user!.getUsername()
        );

        created(
            res,
            'User created succesfully. Check your email and verify'
        );
    }
);

export const patchUser = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;

        const validatedProfile = userUpdateProfileSchema.parse(
            req.body
        );

        const updated = await services.user.updateUser(
            validatedProfile,
            username
        );

        ok(res, 'User profile updated succesfully.', updated);
    }
);

export const getUsers = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const users = await services.user.getUsers(
            (req as any).findOptions as FindOptions
        );

        ok(res, 'Users found.', users);
    }
);

export const getUser = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;
        const fields = (req as any).findOptions?.select;

        const user = await services.user.getUserData(
            username,
            fields
        );

        ok(res, 'User found.', user);
    }
);

export const deleteUser = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;

        const deleted =
            await services.user.deleteByUsername(username);

        ok(res, 'User deleted succesfully.', deleted);
    }
);

export const changeUsername = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;

        const validatedInput = userUpdateUsername.parse(
            req.body
        );

        const result = await services.user.updateUsername(
            username,
            validatedInput
        );

        ok(res, 'Email changed succesfully.', result);
    }
);

export const socialAccounts = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;

        const validateSocialAccounts =
            userUpdateSocialAccounts.parse(req.body);

        const user = await services.user.updateSocialAccounts(
            username,
            validateSocialAccounts
        );

        ok(res, 'Social Accounts updated succesfully.', user);
    }
);

export const patchReputation = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const data = {
            username: req.params.username,
            reason: req.body.reason
        };

        const validatedInput = updateReputation.parse(data);

        await services.user.updateReputation(validatedInput);

        ok(res, 'Reputation updated succesfully.');
    }
);

export const getUserById = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;

        const id = Number(req.params.id);

        const user = await services.user.getUserById(id);

        ok(res, 'User found', user);
    }
);

export const completeDaily = catchAsync(
    async (req: Request, res: Response) => {
        const { services } = req.container!;
        const username = req.params.username as string;

        const result =
            await services.user.completeDailyChallenge(username);

        ok(
            res,
            result.alreadyCompleted
                ? 'Daily already completed today'
                : 'Daily completed, streak updated',
            result
        );
    }
);
