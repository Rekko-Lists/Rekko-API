import { Request, Response } from 'express';

import { User } from '../domain/entities/User';
import { CreateUserInput } from '../domain/types/user.types';
import {
    BadRequestError,
    HttpError,
    NotFoundError
} from '../domain/errors/http.errors';

import { UserPrismaRepository } from '../infraestructure/persistence/prisma/User.prisma.repository';
import { prisma } from './../infraestructure/database/prisma.client';

import { created, ok } from '../utils/response.handler';
import { handlePrismaError } from '../domain/errors/prisma.errors';

const userRepository = new UserPrismaRepository(prisma);

export async function getUser(req: Request, res: Response) {
    try {
        const username =
            typeof req.params.username === 'string'
                ? req.params.username
                : undefined;

        if (!username) {
            throw new BadRequestError(
                undefined,
                'Username not valid.'
            );
        }

        const user =
            await userRepository.findByUsername(username);

        if (!user) {
            throw new NotFoundError(
                undefined,
                'User not found.'
            );
        }

        ok(res, 'Usuario encontrado', user);
    } catch (error) {
        if (error instanceof HttpError) throw error;
        handlePrismaError(error);
    }
}

export function getUsers(req: Request, res: Response) {
    res.status(200).send(`USER GET USER LIST`);
}

export async function postUser(req: Request, res: Response) {
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
            undefined,
            'Email, Password and Username are required.'
        );
    }

    try {
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
    } catch (error) {
        if (error instanceof HttpError) throw error;
        handlePrismaError(error);
    }
}

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
