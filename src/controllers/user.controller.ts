import { Request, Response } from 'express';

import { User } from '../domain/entities/User';
import { CreateUserInput } from '../domain/types/user.types';
import {
    BadRequestError,
    NotFoundError
} from '../domain/errors/http.errors';

import { UserPrismaRepository } from '../infraestructure/persistence/prisma/User.prisma.repository';
import { prisma } from './../infraestructure/database/prisma.client';

import { created, ok } from '../utils/response.handler';
import { catchAsync } from '../utils/catchAsync';

const userRepository = new UserPrismaRepository(prisma);

export const getUser = catchAsync(
    async (req: Request, res: Response) => {
        const username =
            typeof req.params.username === 'string'
                ? req.params.username
                : undefined;

        if (!username) {
            throw new BadRequestError('Username not valid.');
        }

        const user =
            await userRepository.findByUsername(username);

        if (!user) {
            throw new NotFoundError('User not found.');
        }

        ok(res, 'Usuario encontrado', user);
    }
);

export function getUsers(req: Request, res: Response) {
    res.status(200).send(`USER GET USER LIST`);
}

export const postUser = catchAsync(
    async (req: Request, res: Response) => {
        const {
            email,
            password,
            username,
            profileImage,
            bannerImage,
            backgroundImage
        } = req.body as CreateUserInput;

        if (!email || !password || !username) {
            throw new BadRequestError(
                'Email, Password and Username are required.'
            );
        }

        const user = User.fromPersistence({
            userId: 0,
            email,
            passwordHash: password,
            username,
            reputation: 0,
            profileImage: profileImage ?? '',
            bannerImage: bannerImage ?? '',
            backgroundImage: backgroundImage ?? '',
            createdAt: new Date()
        });

        await userRepository.create(user);

        created(res, 'User created succesfully.');
    }
);

export function patchUser(req: Request, res: Response) {
    res.status(200).send(`USER PATCH ${req.params.username}`);
}

export function deleteUser(req: Request, res: Response) {
    res.status(200).send(`USER DELETE ${req.params.username}`);
}

export function changeEmail(req: Request, res: Response) {
    res.status(200).send(
        `USER EMAIL REQUEST ${req.params.username}`
    );
}

export function changeEmailConfirm(req: Request, res: Response) {
    res.status(200).send(
        `USER EMAIL CONFIRM ${req.params.username}`
    );
}

export function changePassword(req: Request, res: Response) {
    res.status(200).send(`USER PASSWORD ${req.params.username}`);
}
