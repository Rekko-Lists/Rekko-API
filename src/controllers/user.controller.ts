import { Request, Response } from 'express';
import { User } from '../domain/entities/User';
import { CreateUserInput } from '../domain/types/user.types';
import { UserPrismaRepository } from '../infraestructure/persistence/prisma/User.prisma.repository';
import { prisma } from './../infraestructure/database/prisma.client';

const userRepository = new UserPrismaRepository(prisma);

export function getUser(req: Request, res: Response) {
    res.status(200).send(`USER GET ${req.params.username}`);
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
        res.status(400).json({
            message:
                'email, password y username son obligatorios'
        });
        return;
    }

    try {
        const user = User.fromPersistence({
            userId: 0,
            email,
            passwordHash: password,
            username,
            profileImage: profileImage ?? '',
            bannerImage: bannerImage ?? '',
            backgroundImage: backgroundImage ?? '',
            createdAt: new Date()
        });

        await userRepository.create(user);

        res.status(201).json({
            message: 'Usuario creado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error al crear el usuario',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error'
        });
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
