#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function findNextAvailablePort() {
  const basePort = 8000;
  const servicesDir = path.join(__dirname, 'services');
  
  if (!fs.existsSync(servicesDir)) {
    return basePort;
  }

  const services = fs.readdirSync(servicesDir).filter(item => {
    const stat = fs.statSync(path.join(servicesDir, item));
    return stat.isDirectory() && !item.startsWith('.');
  });

  const usedPorts = new Set();
  
  services.forEach(service => {
    const envPath = path.join(servicesDir, service, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const portMatch = envContent.match(/PORT=(\d+)/);
      if (portMatch) {
        usedPorts.add(parseInt(portMatch[1]));
      }
    }
  });

  let port = basePort;
  while (usedPorts.has(port)) {
    port++;
  }
  
  return port;
}

async function createService() {
  try {
    // Get service name from user
    const serviceName = await askQuestion('Enter the name of the microservice (e.g., user-service): ');
    const servicesDir = path.join(__dirname, 'services');
    const serviceDir = path.join(servicesDir, serviceName);

    // Create services directory if it doesn't exist
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir);
    }

    // Extract base name without -service suffix for file naming
    const baseName = serviceName.replace('-service', '');

    // Create service directory
    if (fs.existsSync(serviceDir)) {
      console.error(`Service directory ${serviceName} already exists!`);
      process.exit(1);
    }
    fs.mkdirSync(serviceDir);

    // Find next available port
    const servicePort = findNextAvailablePort();

    // Create necessary directories
    const directories = [
      'src',
      'src/controllers',
      'src/routes',
      'src/middleware',
      'src/services',
      'src/models',
      'src/config',
      'src/utils',
      'src/types'
    ];
    directories.forEach(dir => fs.mkdirSync(path.join(serviceDir, dir), { recursive: true }));

    // Create package.json
    const packageJson = {
      name: serviceName,
      version: '1.0.0',
      description: `${serviceName} microservice for LMS system`,
      main: 'dist/index.js',
      scripts: {
        build: 'tsc',
        start: 'node dist/index.js',
        dev: 'ts-node-dev --respawn --transpile-only src/index.ts'
      },
      keywords: [
        'microservice',
        'typescript',
        'prisma',
        serviceName.replace('-service', '')
      ],
      author: '',
      license: 'ISC'
    };

    fs.writeFileSync(
      path.join(serviceDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'es2020',
        module: 'commonjs',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', '**/*.test.ts']
    };

    fs.writeFileSync(
      path.join(serviceDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // Create service-specific middleware
    const serviceMiddlewareCode = `import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const validate${baseName.charAt(0).toUpperCase() + baseName.slice(1)} = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Add validation logic specific to ${baseName}
    const data = req.body;
    
    // Example validation
    if (!data) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // Add more specific validation rules here
    // Example:
    // if (!data.name) {
    //   return res.status(400).json({ error: '${baseName} name is required' });
    // }

    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const check${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Exists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ${baseName} = await prisma.${baseName}.findUnique({
      where: { id: req.params.id }
    });

    if (!${baseName}) {
      return res.status(404).json({ error: '${baseName} not found' });
    }

    // Attach the ${baseName} to the request object for use in subsequent middleware or route handlers
    req.${baseName} = ${baseName};
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Add more middleware functions specific to ${baseName} here`;

    fs.writeFileSync(
      path.join(serviceDir, 'src/middleware', `${baseName}.middleware.ts`),
      serviceMiddlewareCode
    );

    // Create service-specific controller
    const controllerCode = `import { Request, Response } from 'express';
import * as ${baseName}Service from '../services/${baseName}.service';

export const getAll = async (req: Request, res: Response) => {
  try {
    const ${baseName}s = await ${baseName}Service.getAll();
    res.json(${baseName}s);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const ${baseName} = await ${baseName}Service.getById(req.params.id);
    if (!${baseName}) {
      return res.status(404).json({ error: '${baseName} not found' });
    }
    res.json(${baseName});
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const new${baseName.charAt(0).toUpperCase() + baseName.slice(1)} = await ${baseName}Service.create(req.body);
    res.status(201).json(new${baseName.charAt(0).toUpperCase() + baseName.slice(1)});
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const updated${baseName.charAt(0).toUpperCase() + baseName.slice(1)} = await ${baseName}Service.update(req.params.id, req.body);
    if (!updated${baseName.charAt(0).toUpperCase() + baseName.slice(1)}) {
      return res.status(404).json({ error: '${baseName} not found' });
    }
    res.json(updated${baseName.charAt(0).toUpperCase() + baseName.slice(1)});
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await ${baseName}Service.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};`;

    fs.writeFileSync(
      path.join(serviceDir, 'src/controllers', `${baseName}.controller.ts`),
      controllerCode
    );

    // Create service-specific service
    const serviceCode = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async () => {
  // Implement your getAll logic here
  return await prisma.${baseName}.findMany();
};

export const getById = async (id: string) => {
  // Implement your getById logic here
  return await prisma.${baseName}.findUnique({
    where: { id }
  });
};

export const create = async (data: any) => {
  // Implement your create logic here
  return await prisma.${baseName}.create({
    data
  });
};

export const update = async (id: string, data: any) => {
  // Implement your update logic here
  return await prisma.${baseName}.update({
    where: { id },
    data
  });
};

export const remove = async (id: string) => {
  // Implement your remove logic here
  await prisma.${baseName}.delete({
    where: { id }
  });
  return true;
};`;

    fs.writeFileSync(
      path.join(serviceDir, 'src/services', `${baseName}.service.ts`),
      serviceCode
    );

    // Create service-specific route with auth service import and Swagger docs
    const routeCode = `import express from 'express';
import { authenticate, authorize } from '@auth-service/middleware/auth.middleware';
import { validate${baseName.charAt(0).toUpperCase() + baseName.slice(1)}, check${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Exists } from '../middleware/${baseName}.middleware';
import * as ${baseName}Controller from '../controllers/${baseName}.controller';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ${baseName}
 *   description: ${baseName} management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ${baseName.charAt(0).toUpperCase() + baseName.slice(1)}:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the ${baseName}
 *       example:
 *         id: d290f1ee-6c54-4b01-90e6-d701748f0851
 */

/**
 * @swagger
 * /${baseName}s:
 *   get:
 *     summary: Get all ${baseName}s
 *     tags: [${baseName}]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ${baseName}s
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/${baseName.charAt(0).toUpperCase() + baseName.slice(1)}'
 */
router.get('/', authenticate, ${baseName}Controller.getAll);

/**
 * @swagger
 * /${baseName}s/{id}:
 *   get:
 *     summary: Get ${baseName} by id
 *     tags: [${baseName}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ${baseName} id
 *     responses:
 *       200:
 *         description: ${baseName} found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/${baseName.charAt(0).toUpperCase() + baseName.slice(1)}'
 *       404:
 *         description: ${baseName} not found
 */
router.get('/:id', authenticate, check${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Exists, ${baseName}Controller.getById);

/**
 * @swagger
 * /${baseName}s:
 *   post:
 *     summary: Create a new ${baseName}
 *     tags: [${baseName}]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${baseName.charAt(0).toUpperCase() + baseName.slice(1)}'
 *     responses:
 *       201:
 *         description: ${baseName} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/${baseName.charAt(0).toUpperCase() + baseName.slice(1)}'
 */
router.post('/', authenticate, authorize(['admin']), validate${baseName.charAt(0).toUpperCase() + baseName.slice(1)}, ${baseName}Controller.create);

/**
 * @swagger
 * /${baseName}s/{id}:
 *   put:
 *     summary: Update ${baseName} by id
 *     tags: [${baseName}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ${baseName} id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/${baseName.charAt(0).toUpperCase() + baseName.slice(1)}'
 *     responses:
 *       200:
 *         description: ${baseName} updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/${baseName.charAt(0).toUpperCase() + baseName.slice(1)}'
 *       404:
 *         description: ${baseName} not found
 */
router.put('/:id', authenticate, authorize(['admin']), check${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Exists, validate${baseName.charAt(0).toUpperCase() + baseName.slice(1)}, ${baseName}Controller.update);

/**
 * @swagger
 * /${baseName}s/{id}:
 *   delete:
 *     summary: Delete ${baseName} by id
 *     tags: [${baseName}]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ${baseName} id
 *     responses:
 *       204:
 *         description: ${baseName} deleted successfully
 *       404:
 *         description: ${baseName} not found
 */
router.delete('/:id', authenticate, authorize(['admin']), check${baseName.charAt(0).toUpperCase() + baseName.slice(1)}Exists, ${baseName}Controller.remove);

export default router;`;

    fs.writeFileSync(
      path.join(serviceDir, 'src/routes', `${baseName}.route.ts`),
      routeCode
    );

    // Create basic Express server setup with service-specific routes
    const serverCode = `import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import ${baseName}Routes from './routes/${baseName}.route';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || ${servicePort};

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/v1/${baseName}s', ${baseName}Routes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(\`🚀 \${process.env.SERVICE_NAME || '${serviceName}'} is running on port \${port}\`);
});

export default app;`;

    fs.writeFileSync(path.join(serviceDir, 'src', 'index.ts'), serverCode);

    // Create .env file with incremental port
    const envContent = `PORT=${servicePort}
SERVICE_NAME=${serviceName}
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"`;

    fs.writeFileSync(path.join(serviceDir, '.env'), envContent);

    // Create .gitignore
    const gitignore = `node_modules
dist
.env
`;

    fs.writeFileSync(path.join(serviceDir, '.gitignore'), gitignore);

    // Create Dockerfile with the correct port
    const dockerfileContent = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./
COPY src ./src

RUN npm install
RUN npm run build

EXPOSE ${servicePort}

CMD ["npm", "start"]`;

    fs.writeFileSync(path.join(serviceDir, 'Dockerfile'), dockerfileContent);

    // Add the new service to root package.json workspaces
    const rootPackageJsonPath = path.join(__dirname, 'package.json');
    const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
    rootPackageJson.workspaces = [...new Set([...rootPackageJson.workspaces, `services/${serviceName}`])];
    fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));

    console.log(`\n✅ Successfully created ${serviceName}!`);
    console.log('\nCreated with the following structure:');
    console.log(`- ${baseName}.controller.ts with CRUD operations`);
    console.log(`- ${baseName}.service.ts with Prisma integration`);
    console.log(`- ${baseName}.route.ts with authenticated routes`);
    console.log(`- ${baseName}.middleware.ts with validation and checks`);
    console.log('- TypeScript configuration');
    console.log('- Docker configuration');
    console.log(`- Assigned port: ${servicePort}`);
    console.log('\nTo start developing:');
    console.log(`1. cd services/${serviceName}`);
    console.log('2. Update .env with your configuration');
    console.log('3. npm install');
    console.log('4. npm run dev');

  } catch (error) {
    console.error('Error creating service:', error);
  } finally {
    rl.close();
  }
}

createService(); 