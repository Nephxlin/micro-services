import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const GATEWAY_SECRET = process.env.GATEWAY_SECRET;

export const validateGatewaySecret = (req: Request, res: Response, next: NextFunction): void => {
  // Skip validation for health check endpoint
  if (req.path === '/health') {
    return next();
  }

  const gatewaySecret = req.headers['x-gateway-secret'];

  if (!gatewaySecret || gatewaySecret !== GATEWAY_SECRET) {
    res.status(403).json({
      error: 'Access denied. Requests must come through the API Gateway.'
    });
    return;
  }

  next();
}; 