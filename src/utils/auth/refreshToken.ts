import crypto from 'crypto';
import { hashBcrypt } from './bcrypt.util';

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const encodeRefreshToken = async (data: {
    username: string;
    userAgent: string;
    ip: string;
    timestamp: number;
}) => {
    const jsonData = JSON.stringify(data);
    const base64Data = Buffer.from(jsonData).toString('base64');

    const hmac = crypto
        .createHmac('sha256', REFRESH_TOKEN_SECRET)
        .update(base64Data)
        .digest('hex');

    return await hashBcrypt(`${base64Data}.${hmac}`);
};
