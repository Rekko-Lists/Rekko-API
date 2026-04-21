import { Request, Response } from 'express';

import { userService } from '../../infraestructure/container/user.container';

import {
    created,
    ok
} from '../../utils/handlers/response.handler';
import { catchAsync } from '../../utils/catchAsync';

import {
    createUserSchema,
    userUpdateUsername,
    userUpdateProfileSchema,
    userUpdateSocialAccounts,
    updateReputation
} from '../../domain/schemas/user.schemas';
import { FindOptions } from '../../domain/schemas/find.schemas';

export const postUser = catchAsync(
    async (req: Request, res: Response) => {
        const validatedInput = createUserSchema.parse(req.body);

        await userService.createUser(validatedInput);

        created(
            res,
            'User created succesfully. Check your email and verify'
        );
    }
);

export const patchUser = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;

        const validatedProfile = userUpdateProfileSchema.parse(
            req.body
        );

        const updated = await userService.updateUser(
            validatedProfile,
            username
        );

        ok(res, 'User profile updated succesfully.', updated);
    }
);

export const getUsers = catchAsync(
    async (req: Request, res: Response) => {
        const users = await userService.getUsers(
            (req as any).findOptions as FindOptions
        );

        ok(res, 'Users found.', users);
    }
);

export const getUser = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;
        const fields = (req as any).findOptions?.select;

        const user = await userService.getUserData(
            username,
            fields
        );

        ok(res, 'User found.', user);
    }
);

export const deleteUser = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;

        const deleted =
            await userService.deleteByUsername(username);

        ok(res, 'User deleted succesfully.', deleted);
    }
);

export const changeUsername = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;

        const validatedInput = userUpdateUsername.parse(
            req.body
        );

        const result = await userService.updateUsername(
            username,
            validatedInput
        );

        ok(res, 'Email changed succesfully.', result);
    }
);

export const socialAccounts = catchAsync(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;

        const validateSocialAccounts =
            userUpdateSocialAccounts.parse(req.body);

        const user = await userService.updateSocialAccounts(
            username,
            validateSocialAccounts
        );

        ok(res, 'Social Accounts updated succesfully.', user);
    }
);

export const patchReputation = catchAsync(
    async (req: Request, res: Response) => {
        const data = {
            username: req.params.username,
            reason: req.body.reason
        };

        const validatedInput = updateReputation.parse(data);

        await userService.updateReputation(validatedInput);

        ok(res, 'Reputation updated succesfully.');
    }
);

export const getUserById = catchAsync(
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        const user = await userService.getUserById(id);

        ok(res, 'User found', user);
    }
);
