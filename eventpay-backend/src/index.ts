import { Pool } from 'pg';
import { createServer } from './api/server';

const PORT = process.env.PORT || 3000;

// Initialize Database connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'eventpay',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'eventpay_db',
  password: process.env.POSTGRES_PASSWORD || 'eventpay_password',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

const app = createServer(pool);

app.listen(PORT, () => {
  console.log(`🚀 EventPay Server is running on http://localhost:${PORT}`);
  console.log(`healthcheck: http://localhost:${PORT}/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});
