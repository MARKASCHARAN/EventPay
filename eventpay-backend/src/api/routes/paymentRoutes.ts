import { Router, Request, Response } from 'express';
import { CreatePaymentUseCase } from '../../application/use-cases/CreatePaymentUseCase';
import { AuthorizePaymentUseCase } from '../../application/use-cases/AuthorizePaymentUseCase';
import { CapturePaymentUseCase } from '../../application/use-cases/CapturePaymentUseCase';
import { idempotencyMiddleware } from '../middlewares/idempotency';

export function createPaymentRoutes(
  createPayment: CreatePaymentUseCase,
  authorizePayment: AuthorizePaymentUseCase,
  capturePayment: CapturePaymentUseCase
): Router {
  const router = Router();

  // Route: Create a new Payment
  router.post('/', idempotencyMiddleware, async (req: Request, res: Response) => {
    try {
      const { amount, currency } = req.body;
      const paymentId = await createPayment.execute({ amount, currency });
      return res.status(201).json({ paymentId, status: 'CREATED' });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  });

  // Route: Authorize a Payment
  router.post('/:id/authorize', idempotencyMiddleware, async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.id;
      await authorizePayment.execute({ paymentId });
      return res.status(200).json({ paymentId, status: 'AUTHORIZED' });
    } catch (error: any) {
      // 409 Conflict is often used for state machine / concurrency errors
      return res.status(409).json({ error: error.message });
    }
  });

  // Route: Capture a Payment
  router.post('/:id/capture', idempotencyMiddleware, async (req: Request, res: Response) => {
    try {
      const paymentId = req.params.id;
      await capturePayment.execute({ paymentId });
      return res.status(200).json({ paymentId, status: 'CAPTURED' });
    } catch (error: any) {
      return res.status(409).json({ error: error.message });
    }
  });

  return router;
}
