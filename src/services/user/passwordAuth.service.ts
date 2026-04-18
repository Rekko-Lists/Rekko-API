import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/user/User.repository';
import { UserNotFoundError } from '../../domain/errors/auth.errors';
import { UserResetPassword } from '../../domain/schemas/user.schemas';
import { EmailHandler } from '../../utils/handlers/email.handler';
import { hashPassword } from '../../utils/password.util';
import { PasswordAuthRepository } from '../../domain/repositories/user/PasswordAuth.repository';
import {
    sign10MinToken,
    verifyToken
} from '../../utils/jwt.util';

export class PasswordAuthService {
    constructor(
        private readonly userRepository: UserRepository<User>,
        private readonly passwordAuthRepository: PasswordAuthRepository<User>
    ) {}

    async forgotPassoword(username: string): Promise<void> {
        const user =
            await this.userRepository.findByUsername(username);

        const token = sign10MinToken('change-password');

        await this.passwordAuthRepository.updatePasswordRequest(
            user!.getUserId(),
            token
        );

        const emailHandler = new EmailHandler();
        emailHandler.sendChangePasswordConfirmation(
            user!.getEmail(),
            user!.getUsername(),
            token
        );
    }

    async resetPassword(
        resetPassword: UserResetPassword
    ): Promise<void> {
        verifyToken(resetPassword.token, 'change-password');

        const user = await this.userRepository.findByUsername(
            resetPassword.username
        );

        if (!user) throw new UserNotFoundError('User not found');

        const id = user.getUserId();

        if (!id) throw new UserNotFoundError('User not found');

        const passwordHash = await hashPassword(
            resetPassword.password
        );

        await this.passwordAuthRepository.updatePassword(
            id,
            resetPassword.token,
            passwordHash
        );
    }
}
