import { Request, Response } from 'express';

import { userService } from '../infraestructure/container/user.container';

import { created, ok } from '../utils/response.handler';
import { catchAsync } from '../utils/catchAsync';
import {
    createUserSchema,
    userUpdateProfileSchema
} from '../domain/schemas/user.schemas';

export const getUser = catchAsync(
    async (req: Request, res: Response) => {
        const username =
            typeof req.params.username === 'string'
                ? req.params.username
                : undefined;

        const user =
            await userService.getUserByUsername(username);

        ok(res, 'User found.', user);
    }
);

export const getUsers = catchAsync(
    async (req: Request, res: Response) => {
        const users = await userService.getUsers();

        ok(res, 'Users founded.', users);
    }
);

export const postUser = catchAsync(
    async (req: Request, res: Response) => {
        const validatedInput = createUserSchema.parse(req.body);

        await userService.createUser(validatedInput);

        created(res, 'User created succesfully.');
    }
);

export const patchUser = catchAsync(
    async (req: Request, res: Response) => {
        const username =
            typeof req.params.username === 'string'
                ? req.params.username
                : undefined;

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

export const deleteUser = catchAsync(
    async (req: Request, res: Response) => {
        const username =
            typeof req.params.username === 'string'
                ? req.params.username
                : undefined;

        const deleted =
            await userService.deleteByUsername(username);

        ok(res, 'User deleted succesfully.', deleted);
    }
);

export const changeEmail = catchAsync(
    async (req: Request, res: Response) => {
        res.status(200).send(
            `USER EMAIL REQUEST ${req.params.username}`
        );
    }
);

export const changeEmailConfirm = catchAsync(
    async (req: Request, res: Response) => {
        res.status(200).send(
            `USER EMAIL CONFIRM ${req.params.username}`
        );
    }
);

export const changePassword = catchAsync(
    async (req: Request, res: Response) => {
        res.status(200).send(
            `USER PASSWORD ${req.params.username}`
        );
    }
);
