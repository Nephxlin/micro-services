import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const COOKIE_NAME = 'auth_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(COOKIE_NAME);
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in cookies first, then in Authorization header
    const cookieToken = req.cookies?.[COOKIE_NAME];
    const bearerToken = req.headers.authorization?.split(' ')[1];
    const token = cookieToken || bearerToken;

    // Debug logging
    console.log('Auth Debug:', {
      hasCookieToken: !!cookieToken,
      hasAuthHeader: !!req.headers.authorization,
      hasBearerToken: !!bearerToken,
      finalToken: token ? 'present' : 'missing'
    });

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Debug logging
      console.log('Token verified successfully:', {
        userId: decoded.userId,
        role: decoded.role,
        tokenExpiry: new Date(decoded.exp * 1000).toISOString()
      });

      req.user = decoded;
      return next();
    } catch (jwtError) {
      console.error('JWT verification failed:', {
        error: jwtError instanceof Error ? jwtError.message : 'Unknown JWT error',
        token: token.substring(0, 10) + '...'
      });
      clearAuthCookie(res);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Unexpected error in verifyToken:', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    clearAuthCookie(res);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Debug logging
  console.log('requireAuth Debug:', {
    hasUser: !!req.user,
    userId: req.user?.userId,
    userRole: req.user?.role
  });

  if (!req.user || !req.user.userId || !req.user.role) {
    return res.status(401).json({ error: 'User not authenticated - require auth check fail' });
  }
  next();
};

export const publicRoute = (_req: Request, _res: Response, next: NextFunction) => {
  next();
};

export const roleCheck = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Debug logging
    console.log('roleCheck Debug:', {
      hasUser: !!req.user,
      userRole: req.user?.role,
      requiredRoles: roles,
      path: req.path
    });


    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated - role check fail' });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      console.log('Role check failed:', {
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      return res.status(403).json({ error: 'Insufficient permissions - role check fail' });
    }

    next();
  };
};