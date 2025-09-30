# Next.js + Hono + Supabase Starter

A modern, type-safe full-stack starter template featuring Next.js 15, Hono RPC, Supabase Auth, Drizzle ORM, and TanStack Query.

## Features

- ⚡ **Next.js 15** - App Router, Server Components, and TypeScript
- 🔥 **Hono** - RPC-style API with end-to-end type safety
- 🔐 **Supabase** - Authentication and PostgreSQL database
- 🗄️ **Drizzle ORM** - Type-safe database queries and migrations
- 🔄 **TanStack Query** - Powerful server state management
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- ✅ **Zod** - Runtime type validation
- 📝 **TypeScript** - Full type safety from database to UI

## Project Structure

```
.
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   └── [[...route]]/    # Hono catch-all API route
│   │   ├── layout.tsx           # Root layout with QueryProvider
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   ├── db/                      # Database configuration
│   │   ├── helpers/             # Reusable column definitions
│   │   ├── schema/              # Drizzle schemas
│   │   └── index.ts             # Database client
│   ├── features/                # Feature-based organization
│   ├── hooks/                   # Custom React hooks
│   ├── lib/
│   │   ├── rpc/                 # Hono API routes
│   │   │   ├── client/          # Type-safe Hono client
│   │   │   ├── middleware/      # API middleware
│   │   │   └── index.ts         # Main Hono app
│   │   └── supabase/            # Supabase clients
│   │       ├── client.ts        # Browser client
│   │       ├── server.ts        # Server client
│   │       └── middleware.ts    # Auth middleware
│   ├── providers/               # React context providers
│   ├── types/                   # TypeScript types and Zod schemas
│   ├── utils/                   # Utility functions
│   └── middleware.ts            # Next.js middleware
├── supabase/
│   └── migrations/              # Drizzle-generated migrations
├── drizzle.config.ts            # Drizzle configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up here](https://supabase.com))
- PostgreSQL database (provided by Supabase)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd next-hono-supabase-starter
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:

```env
# Database - Get from Supabase Dashboard > Project Settings > Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Supabase - Get from Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture Overview

### RPC-Style API with Hono

This starter uses Hono's RPC pattern for end-to-end type safety between your API and client:

**API Route** (`src/app/api/[[...route]]/route.ts`):
```typescript
import { handle } from 'hono/vercel';
import app from '@/lib/rpc';

export const GET = handle(app);
export const POST = handle(app);
// Export the app type for RPC client type inference
export type AppType = typeof app;
```

**Hono App** (`src/lib/rpc/index.ts`):
```typescript
import { Hono } from 'hono';

const app = new Hono().basePath('/api');

// Mount your routes
const routes = app
  .route('/auth', authRoutes)
  .route('/users', userRoutes);

export default app;
```

**Type-Safe Client** (`src/lib/rpc/client/hono-client.ts`):
```typescript
import { hc } from 'hono/client';
import type { AppType } from '@/app/api/[[...route]]/route';

export const honoClient = hc<AppType>(process.env.NEXT_PUBLIC_BASE_URL!);
```

**Using in React Components**:
```typescript
import { honoClient } from '@/lib/rpc/client/hono-client';
import { parseApiResponse } from '@/utils/parseResponse';

const response = await parseApiResponse(
  honoClient.api.users.$get()
);
```

### Database with Drizzle ORM

**Define Schemas** (`src/db/schema/users.ts`):
```typescript
import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseColumns } from '../helpers/columns.helper';

export const users = pgTable('users', {
  ...baseColumns,
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
});
```

**Export Schemas** (`src/db/schema/index.ts`):
```typescript
export * from './users';
```

**Generate Migrations**:
```bash
npm run db:generate
```

**Run Migrations**:
```bash
npm run db:push
```

**Query Database**:
```typescript
import { db } from '@/db';
import { users } from '@/db/schema';

const allUsers = await db.select().from(users);
```

### Authentication with Supabase

The starter includes three Supabase client implementations:

1. **Browser Client** - For client components
2. **Server Client** - For server components and API routes
3. **Middleware Client** - For session refresh in Next.js middleware

**Example: Protected Route**:
```typescript
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Protected content for {user.email}</div>;
}
```

**Example: API Middleware**:
```typescript
import { authMiddleware } from '@/lib/rpc/middleware/authMiddleware';

app.use('/protected/*', authMiddleware);

app.get('/protected/data', (c) => {
  const user = c.get('user');
  return c.json({ user });
});
```

### State Management with TanStack Query

**Create Feature Hooks** (`src/features/users/useUsers.ts`):
```typescript
import { useQuery } from '@tanstack/react-query';
import { honoClient } from '@/lib/rpc/client/hono-client';
import { parseApiResponse } from '@/utils/parseResponse';

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await parseApiResponse(
        honoClient.api.users.$get()
      );
      return response.data || [];
    },
  });
};
```

**Use in Components**:
```typescript
'use client';

import { useGetUsers } from '@/features/users/useUsers';

export function UserList() {
  const { data: users, isLoading } = useGetUsers();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push migrations to database
- `npm run db:studio` - Open Drizzle Studio

## Key Patterns

### 1. Response Handling

All API responses follow a standardized format:

```typescript
{
  status: 'success' | 'fail',
  message: string,
  data: T | null
}
```

Use `createResponse` to create responses and `parseApiResponse` to handle them.

### 2. Base Columns Helper

Reusable column definitions for all tables:

```typescript
{
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date())
}
```

### 3. Feature-Based Organization

Group related code by feature:

```
src/features/
  ├── auth/
  │   ├── index.ts
  │   └── useAuth.ts
  └── users/
      ├── index.ts
      └── useUsers.ts
```

### 4. Type Safety Chain

Database → Drizzle → Hono → Client → React

Types are inferred automatically throughout the entire stack.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

This template works with any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Hono Documentation](https://hono.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [TanStack Query Documentation](https://tanstack.com/query)

## License

MIT
