import 'dotenv/config';
import app from './app';

// Railway injects PORT; SERVER_PORT used locally
const port = process.env.PORT || process.env.SERVER_PORT || 5000;

app.listen(port, () => {
    console.log(
        `Server listening on port http://localhost:${port}`
    );
});
