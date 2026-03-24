import express from 'express';
import morgan from 'morgan';
import router from './infraestructure/router/routes';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

app.use('/', router);

export default app;
