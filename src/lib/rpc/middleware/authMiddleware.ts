import { createMiddleware } from 'hono/factory';
import { createServerClient } from '@supabase/ssr';
import { getCookie, setCookie } from 'hono/cookie';

export const authMiddleware = createMiddleware(async (c, next) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(c.req.raw.headers.get('cookie') || '')
            .map(([name, value]) => ({ name, value }))
            .filter((cookie) => cookie.name);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(c, name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Set user in context for downstream handlers
  c.set('user', user);
  c.set('supabase', supabase);

  await next();
});
