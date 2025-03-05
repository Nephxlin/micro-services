interface RouteConfig {
  public: string[];
  protected: {
    path: string;
    roles: string[];
  }[];
}

export const routeConfig: Record<string, RouteConfig> = {
  auth: {
    public: [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/refresh-token',
    ],
    protected: [
      {
        path: '/api/auth/profile',
        roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN']
      },
      {
        path: '/api/auth/change-password',
        roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN']
      },
      {
        path: '/api/auth/logout',
        roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN']
      },
      {
        path: '/api/auth/users',
        roles: ['ADMIN']
      }
    ]
  },
  courses: {
    public: [
      '/api/courses/list',
      '/api/courses/search',
      '/api/courses/categories',
    ],
    protected: [
      {
        path: '/api/courses/enroll',
        roles: ['student']
      },
      {
        path: '/api/courses/my-courses',
        roles: ['student', 'instructor']
      },
      {
        path: '/api/courses/progress',
        roles: ['student']
      },
      {
        path: '/api/courses/create',
        roles: ['instructor', 'admin']
      },
      {
        path: '/api/courses/edit',
        roles: ['instructor', 'admin']
      },
      {
        path: '/api/courses/delete',
        roles: ['admin']
      },
      {
        path: '/api/courses/approve',
        roles: ['admin']
      },
      {
        path: '/api/courses/analytics',
        roles: ['instructor', 'admin']
      }
    ]
  },
  organizations:{
  public:[
    '/api/organizations'
  ],
  protected: []
  }
}; 