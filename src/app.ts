import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './infraestructure/router/routes';
import {
    errorHandler,
    notFoundHandler
} from './middlewares/error.handler';

const app = express();

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' } // allow Cloudinary images
}));

// Global rate limit — generous ceiling to catch abuse, not normal use
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' } }
});
app.use(globalLimiter);

// Strict limit on auth endpoints (login, register, password reset)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, please try again in 15 minutes.' } }
});
app.use('/auth/login', authLimiter);
app.use('/user', (req, res, next) => {
    if (req.method === 'POST' && req.path === '/') return authLimiter(req, res, next);
    if (/^\/[^/]+\/forgot-password$/.test(req.path) || /^\/[^/]+\/reset-password$/.test(req.path)) return authLimiter(req, res, next);
    next();
});

const configuredOrigins = [
    process.env.CLIENT_URL_DEV?.trim(),
    process.env.CLIENT_URL_PROD?.trim()
];

if (process.env.NODE_ENV !== 'production') {
    configuredOrigins.push('http://localhost:5173');
}

const allowedOrigins = new Set(
    configuredOrigins
        .filter(Boolean)
        .map((o) => o!.replace(/\/$/, ''))
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.has(origin))
                return callback(null, true);
            callback(
                new Error(`Origin ${origin} not allowed by CORS`)
            );
        },
        credentials: true
    })
);

app.use(
    morgan(
        process.env.NODE_ENV === 'production'
            ? 'combined'
            : 'dev'
    )
);
app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/', router);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
