require('dotenv').config()
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import helmet from 'helmet';

import cookieParser from 'cookie-parser';
import { verifyToken, requireAuth, roleCheck, } from './middleware/api-gateway.middleware';
import { routeConfig } from './config/routes.config';

// Load environment variables

interface ServiceConfig {
  url: string;
  pathRewrite: { [key: string]: string };
  headers?: { [key: string]: string };
}

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Service routes configuration
const services: { [key: string]: ServiceConfig } = {
  auth: {
    url: process.env.AUTH_SERVICE_URL  || 'http://localhost:8001',
    pathRewrite: {
      '^/api/auth': '',
    },
    headers: {
      'x-gateway-secret': process.env.GATEWAY_SECRET || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  courses: {
    url: process.env.COURSES_SERVICE_URL || 'http://localhost:8002',
    pathRewrite: {
      '^/api/courses': ''
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  organizations: {
    url: process.env.ORGANIZATION_SERVICE_URL || 'http://localhost:8003',
    pathRewrite: {
      '^/api/organizations': ''
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
};

// Helper function to check if route is public
const isPublicRoute = (service: string, path: string): boolean => {
  const config = routeConfig[service];
  return config.public.some(route => {
    const routePattern = new RegExp('^' + route.replace(/\*/g, '.*') + '$');
    return routePattern.test(path);
  });
};

// Helper function to get required roles for a protected route
const getRequiredRoles = (service: string, path: string): string[] | null => {
  const config = routeConfig[service];
  const protectedRoute = config.protected.find(route => {
    const routePattern = new RegExp('^' + route.path.replace(/\*/g, '.*') + '$');
    return routePattern.test(path);
  });
  return protectedRoute ? protectedRoute.roles : null;
};

// Proxy middleware setup with authentication and role checking
Object.entries(services).forEach(([service, config]) => {
  app.use(`/api/${service}`, (req, res, next) => {
    const fullPath = `/api/${service}${req.path}`;
    
    // Check if route is public
    if (isPublicRoute(service, fullPath)) {
      return next();
    }

    // Get required roles for the route
    const requiredRoles = getRequiredRoles(service, fullPath);
    
    if (!requiredRoles) {
      return res.status(404).json({ error: 'Route not found' });
    }

    // First verify the token, then check authentication and roles
    verifyToken(req, res, () => {
      requireAuth(req, res, () => {
        roleCheck(requiredRoles)(req, res, next);
      });
    });

  }, createProxyMiddleware({
    target: config.url,
    changeOrigin: true,
    pathRewrite: config.pathRewrite,
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(500).json({ error: `Service ${service} is unavailable`, details: err.message });
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[${service}] Proxying ${req.method} ${req.path} -> ${config.url}${proxyReq.path}`);
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[${service}] Response from ${config.url}${req.path}: ${proxyRes.statusCode}`);
    },
    headers: {
      ...config.headers,
      'x-gateway-secret': process.env.GATEWAY_SECRET || ''
    },
    logLevel: 'debug',
    secure: false,
    ws: true,
    xfwd: true,
    proxyTimeout: 30000,
    timeout: 30000
  }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    user: req.user ? { 
      userId: req.user.userId,
      role: req.user.role 
    } : null 
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
}); 