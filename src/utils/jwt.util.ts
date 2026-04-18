import jwt from 'jsonwebtoken';
import { NotFoundError } from '../domain/errors/http.errors';

export function sign10MinToken(purpose: string) {
    return jwt.sign(
        { purpose },
        process.env.JWT_SECRET as string,
        { expiresIn: '10m' }
    );
}

export function verifyToken(
    token: string,
    expectedPurpose: string
): void {
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
    ) as any;

    if (decoded.purpose !== expectedPurpose) {
        throw new NotFoundError('Invalid token purpose');
    }
}
