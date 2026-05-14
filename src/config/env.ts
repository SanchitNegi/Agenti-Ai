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
  PORT: Number(process.env['PORT'] ?? 3000),
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  API_KEY: requireEnv('API_KEY'),
  AWS_REGION: requireEnv('AWS_REGION'),
  S3_BUCKET: requireEnv('S3_BUCKET'),
};
