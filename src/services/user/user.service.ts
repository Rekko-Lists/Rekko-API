import { User } from '../../domain/entities/User';
import {
    NotFoundError,
    UserNotFoundError
} from '../../exceptions/exceptions';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import {
    CreateUserInput,
    UserUpdateUsername,
    UserUpdateProfile,
    UserUpdateSocialAccounts,
    UpdateReputation,
    reputationReasons
} from '../../domain/schemas/user/user.schemas';
import {
    FindOptions,
    PaginatedResponse
} from '../../domain/schemas/find.schemas';

/**
 * Diferencia en días-calendario UTC entre dos fechas. El "día" del Animedle
 * se define en UTC (los retos diarios usan `new Date().toISOString()`), así que
 * la racha usa la misma referencia para que ambos cuadren.
 *  0 = mismo día, 1 = ayer, >=2 = se saltó al menos un día completo.
 */
function utcDayDiff(from: Date, to: Date): number {
    const a = Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth(),
        from.getUTCDate()
    );
    const b = Date.UTC(
        to.getUTCFullYear(),
        to.getUTCMonth(),
        to.getUTCDate()
    );
    return Math.floor((b - a) / (24 * 60 * 60 * 1000));
}

/**
 * La racha se considera caducada cuando la última actualización fue antes de
 * ayer (se perdió al menos un día completo). Si fue hoy o ayer sigue viva.
 */
function isStreakStale(streakUpdatedAt: Date | null): boolean {
    if (!streakUpdatedAt) return false;
    return utcDayDiff(streakUpdatedAt, new Date()) >= 2;
}

export class UserService {
    constructor(
        private readonly userRepository: UserRepository<User>
    ) {}

    async createUser(input: CreateUserInput): Promise<User> {
        const userInput = await User.fromInput(input);

        const user = await this.userRepository.create(userInput);

        if (!user) throw new UserNotFoundError();

        return user;
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

        if (isStreakStale(user.getStreakUpdatedAt())) {
            const resetUser = await this.userRepository.resetStreak(
                user.getUserId()
            );
            if (resetUser) return resetUser;
        }

        return user;
    }

    async getUserById(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) throw new NotFoundError('User not found');

        if (isStreakStale(user.getStreakUpdatedAt())) {
            const resetUser = await this.userRepository.resetStreak(id);
            if (resetUser) return resetUser;
        }

        return user;
    }

    async getUserData(
        username: string,
        fields: string[]
    ): Promise<User> {
        const user =
            await this.userRepository.findByUsername(username);

        if (!user) throw new NotFoundError('User not found.');

        const id = user.getUserId();

        // Consultar el perfil también comprueba la racha: si caducó (se saltó
        // un día), se resetea antes de proyectar para no devolver un valor
        // obsoleto. La proyección por `fields` puede no incluir streakUpdatedAt,
        // por eso se evalúa sobre la entidad completa de findByUsername.
        if (isStreakStale(user.getStreakUpdatedAt())) {
            await this.userRepository.resetStreak(id);
        }

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

        if (!user) throw new NotFoundError('User not found.');

        const reason: number =
            reputationReasons[updateReputation.reason];

        return await this.userRepository.updateReputation(
            user!.getUserId(),
            reason
        );
    }

    /**
     * Suma un punto de racha al completar el Animedle del día. Guard
     * server-side anti-trampas: si la racha ya se actualizó hoy no vuelve a
     * sumar (idempotente, devuelve `alreadyCompleted: true`). Si el último día
     * jugado fue ayer continúa la racha; si fue antes (o nunca) empieza en 1.
     */
    async completeDailyChallenge(
        username: string
    ): Promise<{ streak: number; alreadyCompleted: boolean }> {
        const user =
            await this.userRepository.findByUsername(username);

        if (!user) throw new NotFoundError('User not found.');

        const last = user.getStreakUpdatedAt();
        const now = new Date();

        if (last && utcDayDiff(last, now) === 0) {
            return {
                streak: user.getStreak(),
                alreadyCompleted: true
            };
        }

        const continues = last !== null && utcDayDiff(last, now) === 1;
        const newStreak = continues ? user.getStreak() + 1 : 1;

        const updated = await this.userRepository.setStreak(
            user.getUserId(),
            newStreak,
            now
        );

        return {
            streak: updated?.getStreak() ?? newStreak,
            alreadyCompleted: false
        };
    }
}
