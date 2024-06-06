import express from 'express';

const startServer = async () => {
    const app = express();
    await expressLoader(app);
}

await startServer();