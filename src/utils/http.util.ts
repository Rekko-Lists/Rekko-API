import { Request } from 'express';

export function getClientInfo(req: Request) {
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip =
        (req.headers['x-forwarded-for'] as string)?.split(
            ','
        )[0] ||
        req.socket.remoteAddress ||
        'Unknown';

    return { userAgent, ip };
}
