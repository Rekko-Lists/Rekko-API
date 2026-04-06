import { prisma } from '../database/prisma.client';
import { UserPrismaRepository } from '../persistence/prisma/User.prisma.repository';
import { UserService } from '../../services/user.service';

const userRepository = new UserPrismaRepository(prisma);

export const userService = new UserService(userRepository);
