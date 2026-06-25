import express from 'express';
import { Pool } from 'pg';
import { PostgresPaymentRepository } from '../infrastructure/database/PostgresPaymentRepository';
import { CreatePaymentUseCase } from '../application/use-cases/CreatePaymentUseCase';
import { AuthorizePaymentUseCase } from '../application/use-cases/AuthorizePaymentUseCase';
import { CapturePaymentUseCase } from '../application/use-cases/CapturePaymentUseCase';
import { createPaymentRoutes } from './routes/paymentRoutes';

export function createServer(pool: Pool) {
  const app = express();
  
  // Middleware
  app.use(express.json());

  // Dependency Injection
  const paymentRepo = new PostgresPaymentRepository(pool);
  const createPayment = new CreatePaymentUseCase(paymentRepo);
  const authorizePayment = new AuthorizePaymentUseCase(paymentRepo);
  const capturePayment = new CapturePaymentUseCase(paymentRepo);

  // Routes
  app.use('/payments', createPaymentRoutes(createPayment, authorizePayment, capturePayment));

  // Healthcheck
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  return app;
}
