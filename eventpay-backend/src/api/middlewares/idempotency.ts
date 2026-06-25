import { Request, Response, NextFunction } from 'express';

// For production, this MUST be Redis or a database. 
// In-memory map is only for demonstration purposes.
const idempotencyCache = new Map<string, any>();

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.header('Idempotency-Key');
  
  if (!idempotencyKey) {
    return res.status(400).json({ 
      error: 'Idempotency-Key header is required for safe retries.' 
    });
  }

  // If we have seen this request before, return the cached result
  if (idempotencyCache.has(idempotencyKey)) {
    console.log(`[Idempotency] Cache hit for key: ${idempotencyKey}`);
    const cachedResponse = idempotencyCache.get(idempotencyKey);
    return res.status(200).json({
      ...cachedResponse,
      _idempotentReplay: true
    });
  }

  // Intercept the res.json method to capture the successful response
  const originalJson = res.json;
  res.json = function (body) {
    // Only cache successful responses (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(idempotencyKey, body);
    }
    return originalJson.call(this, body);
  };

  next();
};
