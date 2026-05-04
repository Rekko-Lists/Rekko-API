import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './infraestructure/router/routes';
import {
    errorHandler,
    notFoundHandler
} from './middlewares/error.handler';

const app = express();

const clientPort = process.env.CLIENT_PORT ? `:${process.env.CLIENT_PORT}` : '';
const allowedOrigins = [
    process.env.CLIENT_URL_DEV
        ? `${process.env.CLIENT_URL_DEV}${clientPort}`
        : 'http://localhost:5173',
    process.env.CLIENT_URL_PROD,
].filter(Boolean) as string[];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());

app.use('/', router);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
