import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { validateGatewaySecret } from './middleware/gateway.middleware';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());  // Allow all origins in development
app.use(express.json());

// Validate that requests come from the API Gateway
app.use(validateGatewaySecret);

// Routes
app.use('/', authRoutes);

// Health check endpoint (accessible without gateway secret for monitoring)
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = Number(process.env.PORT)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Auth service is running on port ${PORT}`);
});