import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import courseRoutes from './routes/course.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8002;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/v1/courses', courseRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 ${process.env.SERVICE_NAME || 'course-service'} is running on port ${port}`);
});

export default app;