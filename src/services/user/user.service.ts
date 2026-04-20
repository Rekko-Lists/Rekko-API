import { User } from '../../domain/entities/User';
import { NotFoundError } from '../../domain/errors/http.errors';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import {
    CreateUserInput,
    UserUpdateUsername,
    UserUpdateProfile,
    UserUpdateSocialAccounts,
    UpdateReputation,
    reputationReasons
} from '../../domain/schemas/user.schemas';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';
import { emailAuthService } from '../../infraestructure/container/user.container';

export class UserService {
    constructor(
        private readonly userRepository: UserRepository<User>
    ) {}

    async createUser(input: CreateUserInput): Promise<void> {
        const userInput = await User.fromInput(input);
        const user = await this.userRepository.create(userInput);
        await emailAuthService.verifyEmailRequest(
            user!.getUsername()
        );
    }

    async updateUser(
        userProfile: UserUpdateProfile,
        username: string
    ): Promise<User> {
        const user = await this.userRepository.update(
            {
                username
            },
            userProfile
        );

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }

    async getUsers(
        findOptions: FindOptions
    ): Promise<PaginatedResponse<User>> {
        const result =
            await this.userRepository.find(findOptions);

        if (
            !result ||
            !result.data ||
            result.data.length === 0
        ) {
            throw new NotFoundError('No users found.');
        }

        const maxPages = Math.ceil(
            result.total / findOptions.pagination.limit
        );

        if (findOptions.pagination.page > maxPages) {
            throw new NotFoundError(
                `Page ${findOptions.pagination.page} does not exist. Max pages: ${maxPages}`
            );
        }

        return {
            data: result.data,
            pagination: {
                page: findOptions.pagination.page,
                limit: findOptions.pagination.limit,
                total: result.total,
                pages: maxPages
            }
        };
    }

    async getUserByUsername(username: string): Promise<User> {
        const user =
            await this.userRepository.findByUsername(username);

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) throw new NotFoundError('User not found');

        return user;
    }

    async getUserData(
        username: string,
        fields: string[]
    ): Promise<User> {
        const user =
            await this.userRepository.findByUsername(username);

        const id = user!.getUserId();

        const userData = await this.userRepository.findById(
            id,
            fields
        );

        if (!userData)
            throw new NotFoundError('User not found.');

        return userData;
    }

    async deleteByUsername(username: string): Promise<boolean> {
        const user = await this.userRepository.delete({
            username
        });

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }

    async updateUsername(
        username: string,
        updateUsername: UserUpdateUsername
    ): Promise<User> {
        const user =
            await this.userRepository.findByUsername(username);

        const id = user?.getUserId();

        if (!id) throw new NotFoundError('User not found');

        const newUser = await this.userRepository.updateUsername(
            id,
            updateUsername!.username
        );

        if (!newUser) throw new NotFoundError('User not found');

        return newUser;
    }

    async updateSocialAccounts(
        username: string,
        socialAccounts: UserUpdateSocialAccounts
    ): Promise<User | null> {
        const userId =
            await this.userRepository.findByUsername(username);

        if (!userId) throw new NotFoundError('User not found.');

        const id = userId?.getUserId();

        const user = await this.userRepository.socialAccounts(
            id,
            socialAccounts
        );

        return user;
    }

    async updateReputation(
        updateReputation: UpdateReputation
    ): Promise<User | null> {
        const user = await this.userRepository.findByUsername(
            updateReputation.username
        );

        const reason: number =
            reputationReasons[updateReputation.reason];

        return await this.userRepository.updateReputation(
            user!.getUserId(),
            reason
        );
    }
}
