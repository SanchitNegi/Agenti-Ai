# CLAUDE.md — Project Rules

## Language requirement

**This project uses TypeScript only.**

- All code must be written in TypeScript (`.ts` or `.tsx`)
- Do NOT write plain JavaScript (`.js` or `.jsx`) under any circumstances
- Do NOT suggest converting files to JavaScript
- If you are unsure whether something requires JavaScript, ask before proceeding

---

## Node.js + Express project structure

**Every Node.js Express application must follow this exact folder structure — no exceptions:**

```
project-root/
├── src/
│   ├── config/
│   │   └── env.ts               ← all environment variables
│   ├── controllers/
│   │   └── *.controller.ts      ← business logic, one file per resource
│   ├── middleware/
│   │   ├── auth.middleware.ts   ← API key / JWT validation
│   │   ├── error.middleware.ts  ← global error handler
│   │   └── logger.middleware.ts ← request logging
│   ├── routes/
│   │   ├── index.ts             ← combines all routers
│   │   └── *.routes.ts          ← one file per resource
│   ├── services/
│   │   └── *.service.ts         ← external calls (DB, AWS, APIs)
│   ├── types/
│   │   └── index.ts             ← all shared interfaces and types
│   ├── utils/
│   │   ├── asyncWrapper.ts      ← wraps async route handlers
│   │   ├── AppError.ts          ← custom error class
│   │   └── logger.ts            ← winston / pino logger
│   ├── app.ts                   ← express app setup, middleware registration
│   └── server.ts                ← http server, port binding, startup
├── tests/
│   └── *.test.ts                ← mirror src/ structure
├── .env                         ← local secrets (never commit)
├── .env.example                 ← template with keys but no values
├── .gitignore
├── tsconfig.json
├── package.json
└── CLAUDE.md
```

---

## File responsibilities — never mix these

| File | Responsibility | Must NOT contain |
|---|---|---|
| `*.routes.ts` | Route definitions only, calls controller | Business logic |
| `*.controller.ts` | Handle req/res, call service | Direct DB/AWS calls |
| `*.service.ts` | External calls (DB, AWS, API) | Express req/res objects |
| `*.middleware.ts` | Intercept and process requests | Business logic |
| `config/env.ts` | Read and validate env vars | Any logic |
| `types/index.ts` | Interfaces and types only | Any logic |
| `app.ts` | Register middleware and routes | Business logic |
| `server.ts` | Start HTTP server only | Business logic |

---

## Required files — always create these

### `src/app.ts`
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from '@/middleware/error.middleware';
import { notFoundMiddleware } from '@/middleware/error.middleware';
import routes from '@/routes/index';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
```

### `src/server.ts`
```typescript
import app from './app';
import { env } from '@/config/env';

const PORT = env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});
```

### `src/config/env.ts`
```typescript
import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  API_KEY: string;
  AWS_REGION: string;
  S3_BUCKET: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  API_KEY: requireEnv('API_KEY'),
  AWS_REGION: requireEnv('AWS_REGION'),
  S3_BUCKET: requireEnv('S3_BUCKET'),
};
```

### `src/utils/AppError.ts`
```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### `src/utils/asyncWrapper.ts`
```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncWrapper = (fn: AsyncHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
```

### `src/middleware/error.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}
```

### `src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { env } from '@/config/env';
import { AppError } from '@/utils/AppError';

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== env.API_KEY) {
    return next(new AppError('Unauthorized — invalid or missing API key', 401));
  }
  next();
}
```

### `src/routes/index.ts`
```typescript
import { Router } from 'express';
import customerRoutes from './customer.routes';

const router = Router();

router.use('/customers', customerRoutes);

export default router;
```

---

## Route file pattern — always follow this

```typescript
// src/routes/customer.routes.ts
import { Router } from 'express';
import { getCustomers, getCustomerById } from '@/controllers/customer.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { asyncWrapper } from '@/utils/asyncWrapper';

const router = Router();

router.use(authMiddleware);

router.get('/',     asyncWrapper(getCustomers));
router.get('/:id',  asyncWrapper(getCustomerById));

export default router;
```

## Controller pattern — always follow this

```typescript
// src/controllers/customer.controller.ts
import { Request, Response } from 'express';
import { CustomerService } from '@/services/customer.service';
import { AppError } from '@/utils/AppError';

const customerService = new CustomerService();

export async function getCustomers(_req: Request, res: Response): Promise<void> {
  const customers = await customerService.findAll();
  res.status(200).json({ status: 'success', data: customers });
}

export async function getCustomerById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const customer = await customerService.findById(id);
  if (!customer) throw new AppError(`Customer ${id} not found`, 404);
  res.status(200).json({ status: 'success', data: customer });
}
```

## Service pattern — always follow this

```typescript
// src/services/customer.service.ts
import type { Customer } from '@/types/index';

export class CustomerService {
  async findAll(): Promise<Customer[]> {
    return [];
  }

  async findById(id: string): Promise<Customer | null> {
    return null;
  }
}
```

---

## Required packages — always install these

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.21",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.0.0",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Required scripts — always add these

```json
{
  "scripts": {
    "dev":       "ts-node-dev --respawn --transpile-only src/server.ts",
    "build":     "tsc",
    "start":     "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "test":      "jest"
  }
}
```

---

## tsconfig.json — always use this exact config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Response format — always use this exact shape

```typescript
// Success
res.status(200).json({ status: 'success', data: result });

// Created
res.status(201).json({ status: 'success', data: created });

// Error — always throw AppError, never res.json() directly
throw new AppError('Message here', 400);
```

---

## .env.example — always create this

```
PORT=3000
NODE_ENV=development
API_KEY=your-api-key-here
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

---

## .gitignore — always create this

```
node_modules/
dist/
.env
*.log
```

---

## TypeScript rules

- `strict: true` always enabled
- Never use `any` — use `unknown` and narrow it
- Never use `@ts-ignore` or `@ts-nocheck`
- Always type function parameters and return values explicitly
- Use `import type` for type-only imports
- Use path alias `@/` mapped to `src/`

---

## What Claude must ALWAYS do

- Follow the folder structure above exactly for every new Express project
- Create ALL required files listed above — never skip any
- Wrap every async route handler with `asyncWrapper`
- Use `AppError` for all errors — never throw plain strings
- Validate all env vars in `config/env.ts` on startup — fail fast
- Apply `authMiddleware` to all routes except `/health`
- Return all responses in the standard `{ status, data }` shape
- Export named `router` from every routes file
- Export named functions from every controller file
- Export a class from every service file

## What Claude must NEVER do

- Put business logic in route files
- Put Express `req/res` in service files
- Use `any` type anywhere
- Write `.js` files
- Use `require()` — always use `import`
- Skip `asyncWrapper` on async routes
- Hardcode secrets — always read from `config/env.ts`
- Skip creating `.env.example`
- Create files outside `src/` (except root config files)
