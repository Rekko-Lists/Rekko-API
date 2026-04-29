import { User } from '../../domain/entities/User';
import { NotFoundError } from '../../domain/errors/http.errors';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import {
    TokenExpiredError,
    UserNotFoundError,
    InvalidTokenError
} from '../../domain/errors/auth.errors';
import {
    UserUpdateEmail,
    UserUsernameToken
} from '../../domain/schemas/user.schemas';
import { EmailHandler } from '../../infraestructure/services/mailer/nodemailer.service';
import { EmailAuthRepository } from '../../domain/repositories/user/EmailAuth.repository';
import {
    sign10MinToken,
    verifyToken
} from '../../utils/auth/jwt';
import { comparePassword } from '../../utils/auth/bcrypt.util';

export class EmailAuthService {
    constructor(
        private readonly userRepository: UserRepository<User>,
        private readonly emailAuthRepository: EmailAuthRepository<User>,
        private readonly emailHandler: EmailHandler
    ) {}

    async getUserByEmail(email: string): Promise<User> {
        const user =
            await this.emailAuthRepository.findByEmail(email);

        if (!user) throw new NotFoundError('User not found.');

        return user;
    }

    async authenticateByEmailAndPassword(
        email: string,
        password: string
    ): Promise<User> {
        const user =
            await this.emailAuthRepository.findByEmail(email);

        if (!user) throw new NotFoundError('User not found');

        const passwordHash = user.getPasswordHash();
        if (!passwordHash) {
            throw new InvalidTokenError(
                'Invalid email or password'
            );
        }

        const passwordMatch = await comparePassword(
            password,
            passwordHash
        );

        if (!passwordMatch) {
            throw new InvalidTokenError(
                'Invalid email or password'
            );
        }

        return user;
    }

    async verifyEmailRequest(username: string): Promise<void> {
        const user =
            await this.userRepository.findByUsername(username);

        if (user!.getEmailVerified()) {
            throw new NotFoundError('Email already verified');
        }

        const token = sign10MinToken('verify-email');

        await this.emailAuthRepository.verifyEmailRequest(
            user!.getUserId(),
            token
        );

        await this.emailHandler.sendVerifyEmail(
            user!.getEmail(),
            user!.getUsername(),
            token
        );
    }

    async verifyEmail(
        verifyEmail: UserUsernameToken
    ): Promise<User> {
        verifyToken(verifyEmail.token, 'verify-email');

        const user = await this.userRepository.findByUsername(
            verifyEmail.username
        );

        if (!user) throw new UserNotFoundError('User not found');

        if (user.getEmailVerified()) {
            throw new TokenExpiredError(
                'Email already verified'
            );
        }

        await this.emailAuthRepository.verifyEmail(
            user.getUserId(),
            verifyEmail.token
        );

        return user;
    }

    async updateEmailRequest(
        updateEmail: UserUpdateEmail
    ): Promise<void> {
        const user = await this.userRepository.findByUsername(
            updateEmail.username
        );

        if (!user) throw new NotFoundError('User not found');

        const email = user.getEmail();

        const token = sign10MinToken('change-email');

        await this.emailAuthRepository.updateEmailRequest(
            user.getUserId(),
            updateEmail.newEmail,
            token
        );

        await this.emailHandler.sendChangeEmailConfirmation(
            email,
            updateEmail.username,
            token
        );
    }

    async updateEmail(
        updateEmail: UserUsernameToken
    ): Promise<User> {
        verifyToken(updateEmail.token, 'change-email');

        const user = await this.userRepository.findByUsername(
            updateEmail.username
        );

        if (!user) throw new UserNotFoundError('User not found');

        const id = user.getUserId();

        if (!id) throw new NotFoundError('User not found');

        const newUser =
            await this.emailAuthRepository.updateEmail(
                id,
                updateEmail.token
            );

        if (!newUser) throw new NotFoundError('User not found');

        return newUser;
    }
}
