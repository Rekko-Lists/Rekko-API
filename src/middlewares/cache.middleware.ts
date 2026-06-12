import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Cache compartido para respuestas de GETs publicos (identicas para todos
// los usuarios). No usar en rutas con optionalAuthMiddleware o authMiddleware:
// la respuesta variaria por usuario y se serviria a quien no corresponde.
const responseCache = new NodeCache({
    useClones: false,
    checkperiod: 120
});

export const cacheMiddleware =
    (ttlSeconds: number) =>
    (req: Request, res: Response, next: NextFunction): void => {
        const key = req.originalUrl;

        const cached = responseCache.get(key);
        if (cached !== undefined) {
            res.setHeader(
                'Cache-Control',
                `public, s-maxage=${ttlSeconds}`
            );
            res.setHeader('X-Cache', 'HIT');
            res.json(cached);
            return;
        }

        const originalJson = res.json.bind(res);
        res.json = (body: unknown) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                responseCache.set(key, body, ttlSeconds);
                res.setHeader(
                    'Cache-Control',
                    `public, s-maxage=${ttlSeconds}`
                );
            }
            return originalJson(body);
        };

        next();
    };
