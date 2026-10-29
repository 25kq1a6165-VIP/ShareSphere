import app from './app.js';
import { config } from './config/env.js';
import { initializeDatabase } from './config/db.js';
import { startBookingScheduler, stopBookingScheduler } from './services/bookingScheduler.js';

async function startServer() {
  try {
    // Attempt database initialization
    await initializeDatabase();

    // Start background autonomous booking scheduler
    startBookingScheduler(30000);

    const server = app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 ShareSphere Backend API running successfully!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🩺 Health: http://localhost:${config.port}/api/health`);
      console.log(`🔒 Mode: ${config.nodeEnv}`);
      console.log(`======================================================\n`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server...');
      stopBookingScheduler();
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Fatal error during server startup:', err);
    process.exit(1);
  }
}

startServer();
