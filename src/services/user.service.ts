import { User } from '../domain/entities/User';
import {
    BadRequestError,
    NotFoundError
} from '../domain/errors/http.errors';
import { UserRepository } from '../domain/repositories/User.repository';
import {
    CreateUserInput,
    UserUpdateProfile
} from '../domain/schemas/user.schemas';

export class UserService {
    constructor(
        private readonly userRepository: UserRepository<User>
    ) {}

    async createUser(input: CreateUserInput): Promise<void> {
        if (!input.email || !input.password || !input.username) {
            throw new BadRequestError(
                'Email, Password and Username are required.'
            );
        }

        const user = User.fromPersistence({
            userId: 0,
            email: input.email,
            passwordHash: input.password,
            username: input.username,
            reputation: 0,
            profileImage: input.profileImage ?? '',
            bannerImage: input.bannerImage ?? '',
            backgroundImage: input.backgroundImage ?? '',
            createdAt: new Date(),
            biography: input.biography ?? ''
        });

        await this.userRepository.create(user);
    }

    async updateUser(
        userProfile: UserUpdateProfile,
        username?: string
    ): Promise<User> {
        if (!username)
            throw new BadRequestError('Username not valid.');

        const user = await this.userRepository.update(
            {
                username
            },
            userProfile
        );

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }

    async getUsers(): Promise<User[]> {
        const users = await this.userRepository.find();

        if (!users) throw new NotFoundError("There's no users.");

        return users;
    }

    async getUserByUsername(username?: string): Promise<User> {
        if (!username) {
            throw new BadRequestError('Username not valid.');
        }

        const user =
            await this.userRepository.findByUsername(username);

        if (!user) {
            throw new NotFoundError('User not found.');
        }

        return user;
    }

    async getUserById(id?: number): Promise<User> {
        if (!id) throw new BadRequestError('Id not valid.');

        const user = await this.userRepository.findById(id);

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }

    async getUserByEmail(email?: string): Promise<User> {
        if (
            !email ||
            !email?.match(
                /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
            )
        ) {
            throw new BadRequestError('Email not valid.');
        }

        const user =
            await this.userRepository.findByEmail(email);

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }

    async deleteByUsername(username?: string): Promise<boolean> {
        if (!username)
            throw new BadRequestError('Id not valid.');

        const user = await this.userRepository.delete({
            username
        });

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }
}
