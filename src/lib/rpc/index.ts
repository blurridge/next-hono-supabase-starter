import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono().basePath('/api');

// Add global middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    credentials: true,
  }),
);

// Mount your routes here
// Example:
// const routes = app.route('/auth', authRoutes).route('/users', userRoutes);
// export type AppType = typeof routes;

export default app;
