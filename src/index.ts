import app from './app';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';

async function startServer() {
    await connectDatabase();

    app.listen(
        PORT,
        '0.0.0.0',
        () => {
            console.log(`Server: http://0.0.0.0:${PORT}`);
        }
    );
}

startServer();
