#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

async function createService() {
  try {
    // Get service name from user
    const serviceName = await askQuestion('Enter the name of the microservice (e.g., user-service): ');
    const serviceDir = path.join(__dirname, serviceName);

    // Create service directory
    if (fs.existsSync(serviceDir)) {
      console.error(`Service directory ${serviceName} already exists!`);
      process.exit(1);
    }
    fs.mkdirSync(serviceDir);

    // Create necessary directories
    const directories = ['src', 'src/controllers', 'src/routes', 'src/middleware', 'src/config', 'src/utils'];
    directories.forEach(dir => fs.mkdirSync(path.join(serviceDir, dir), { recursive: true }));

    // Create package.json
    const packageJson = {
      name: serviceName,
      version: '1.0.0',
      main: 'dist/index.js',
      scripts: {
        dev: 'ts-node-dev --respawn --transpile-only src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'jest'
      },
      dependencies: {
        'express': '^4.18.2',
        'cors': '^2.8.5',
        'dotenv': '^16.0.3',
        'helmet': '^7.0.0'
      },
      devDependencies: {
        '@types/express': '^4.17.17',
        '@types/cors': '^2.8.13',
        '@types/node': '^18.15.11',
        'typescript': '^5.0.4',
        'ts-node-dev': '^2.0.0',
        '@types/jest': '^29.5.0',
        'jest': '^29.5.0',
        'ts-jest': '^29.1.0'
      }
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

    // Create basic Express server setup
    const serverCode = `import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(\`🚀 \${process.env.SERVICE_NAME || '${serviceName}'} is running on port \${port}\`);
});

export default app;
`;

    fs.writeFileSync(path.join(serviceDir, 'src', 'index.ts'), serverCode);

    // Create .env file
    const envContent = `PORT=3000
SERVICE_NAME=${serviceName}
NODE_ENV=development
`;

    fs.writeFileSync(path.join(serviceDir, '.env'), envContent);

    // Create .gitignore
    const gitignore = `node_modules
dist
.env
`;

    fs.writeFileSync(path.join(serviceDir, '.gitignore'), gitignore);

    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { cwd: serviceDir, stdio: 'inherit' });

    // Add the new service to root package.json workspaces
    const rootPackageJsonPath = path.join(__dirname, 'package.json');
    const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
    rootPackageJson.workspaces = [...new Set([...rootPackageJson.workspaces, serviceName])];
    fs.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));

    console.log(`\n✅ Successfully created ${serviceName}!`);
    console.log(`\nTo start developing:`);
    console.log(`cd ${serviceName}`);
    console.log('npm run dev');

  } catch (error) {
    console.error('Error creating service:', error);
  } finally {
    rl.close();
  }
}

createService(); 