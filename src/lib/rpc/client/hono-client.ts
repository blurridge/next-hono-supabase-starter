import { hc } from 'hono/client';
import type { AppType } from '@/app/api/[[...route]]/route';

export const honoClient = hc<AppType>(
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
);
