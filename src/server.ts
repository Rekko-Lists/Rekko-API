import 'dotenv/config';
import app from './app';

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

// Railway injects PORT; SERVER_PORT used locally
const port = process.env.PORT || process.env.SERVER_PORT || 5000;

app.listen(Number(port), '0.0.0.0', () => {
    console.log(
        `Server listening on port http://localhost:${port}`
    );
});
