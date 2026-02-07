import app from './app';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';

async function startServer() {
    await connectDatabase();

    app.listen(
        PORT,
        () => {
            console.log(`Server: http://localhost:${PORT}`);
        }
    );
}

startServer();
