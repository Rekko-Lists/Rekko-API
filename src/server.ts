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

const server = app.listen(Number(port), '0.0.0.0', () => {
    const addr = server.address();
    console.log(`Server bound to: ${JSON.stringify(addr)}`);
    console.log(`Server listening on http://0.0.0.0:${port}`);
});
