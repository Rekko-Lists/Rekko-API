import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './infraestructure/router/routes';
import {
    errorHandler,
    notFoundHandler
} from './middlewares/error.handler';

const app = express();

const allowedOrigins = new Set(
    [
        'http://localhost:5173',
        process.env.CLIENT_URL_DEV?.trim(),
        process.env.CLIENT_URL_PROD?.trim(),
    ]
        .filter(Boolean)
        .map((o) => o!.replace(/\/$/, ''))
);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.has(origin)) return callback(null, true);
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (_req, res) => { res.status(200).json({ status: 'ok' }); });

app.use('/', router);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
