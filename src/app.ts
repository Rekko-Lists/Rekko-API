import express from 'express';
import morgan from 'morgan';
import router from './infraestructure/router/routes';
import {
    errorHandler,
    notFoundHandler
} from './middlewares/error.handler';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/', router);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
