# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production with Turbopack
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # Type-check with TypeScript (runs in pre-push hook)
npm run format           # Format all TypeScript files with Prettier

# Database
npm run db:generate      # Generate Drizzle migrations from schema
npm run db:push          # Push migrations to Supabase database
npm run db:studio        # Open Drizzle Studio for database management
```

## Git Hooks (Husky)

- **pre-commit**: Runs `lint-staged` (ESLint + Prettier on staged `.ts`/`.tsx` files)
- **pre-push**: Runs `typecheck` (must pass before pushing)
- **post-merge**: Runs `npm install` (auto-installs dependencies after pulling)

## Architecture

### RPC-Style API Flow

The codebase uses Hono for end-to-end type-safe RPC communication:

1. **API Routes** (`src/app/api/[[...route]]/route.ts`): Next.js catch-all route that handles all HTTP methods (GET/POST/PUT/PATCH/DELETE) and exports the `AppType` for client type inference
2. **Hono App** (`src/lib/rpc/index.ts`): Main Hono instance with base path `/api`, includes CORS and logger middleware. New routes should be mounted here using `.route()` pattern
3. **Type-Safe Client** (`src/lib/rpc/client/hono-client.ts`): Hono client typed with `AppType` for full type safety from API to client

**Adding New API Routes:**
- Create route files in `src/lib/rpc/` (e.g., `authRoutes.ts`, `userRoutes.ts`)
- Mount in `src/lib/rpc/index.ts` using `app.route('/path', routeHandler)`
- Update the exported `AppType` if needed for client type inference
- Use `authMiddleware` from `src/lib/rpc/middleware/authMiddleware.ts` for protected routes

### Supabase Auth Integration

Three client implementations:
- **Browser** (`src/lib/supabase/client.ts`): For client components
- **Server** (`src/lib/supabase/server.ts`): For server components/API routes (async function)
- **Middleware** (`src/lib/supabase/middleware.ts`): Session refresh in Next.js middleware

**Hono Auth Middleware** (`src/lib/rpc/middleware/authMiddleware.ts`):
- Creates Supabase client with cookie handling for Hono
- Sets `user` and `supabase` in context via `c.set()`
- Returns 401 if unauthorized

### Database (Drizzle ORM)

**Schema Structure:**
- Define tables in `src/db/schema/*.ts`
- Use `baseColumns` helper from `src/db/helpers/columns.helper.ts` for standard `id`, `createdAt`, `updatedAt` fields
- Export all schemas from `src/db/schema/index.ts`

**Migration Workflow:**
1. Update schema files
2. Run `npm run db:generate` to create migrations in `supabase/migrations/`
3. Run `npm run db:push` to apply to Supabase

**Configuration** (`drizzle.config.ts`):
- Schema: `./src/db/schema/index.ts`
- Migrations output: `./supabase/migrations`
- Uses Supabase RLS via `entities.roles.provider`

### Response Handling

All API responses follow standardized format:
```typescript
{
  status: 'success' | 'fail',
  message: string,
  data: T | null
}
```

- **Create responses**: Use `createResponse` utility
- **Parse responses**: Use `parseApiResponse` from `src/utils/parseResponse.ts` which handles errors and unwraps the standardized format

### State Management

TanStack Query for server state:
- Feature hooks in `src/features/[feature]/use[Feature].ts`
- Use `parseApiResponse` with `honoClient` for type-safe API calls
- Provider configured in root layout

### Project Organization

- **Feature-based**: Group related code in `src/features/[feature]/`
- **Base columns**: All tables include `id` (uuid), `createdAt`, `updatedAt` via helper
- **Type safety chain**: Database schema → Drizzle → Hono → Client → React (fully type-safe)

## Environment Variables

Required in `.env.local`:
```env
DATABASE_URL=postgresql://...                    # Supabase database connection
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                # Supabase anon key
NEXT_PUBLIC_BASE_URL=http://localhost:3000       # App base URL for Hono client
```

## Key Patterns

- **New database table**: Create schema with `baseColumns`, export from `src/db/schema/index.ts`, generate and push migration
- **New API endpoint**: Create in `src/lib/rpc/`, mount in `index.ts`, use `authMiddleware` if protected
- **New feature hook**: Create in `src/features/[feature]/`, use `honoClient` + `parseApiResponse` with TanStack Query
- **Protected server component**: Use `createSupabaseServerClient()` (await it), check user, redirect if needed
