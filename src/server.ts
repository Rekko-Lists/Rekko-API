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

// Hosted servers inject PORT; SERVER_PORT is used locally.
const port = process.env.PORT || process.env.SERVER_PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(Number(port), '0.0.0.0', () => {
        console.log(`Server listening on port ${port}`);
    });
}

export default app;
