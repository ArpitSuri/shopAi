import 'dotenv/config'; // must stay the first import: loads .env into process.env
import app from './app.js';
import { connectDB } from './config/db.js';

const missing = ['MONGO_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing in backend/.env: ${missing.join(', ')}`);
  console.error('Create the file with: cp .env.example .env');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () =>
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`)
  );

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
    server.close(() => process.exit(1));
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
