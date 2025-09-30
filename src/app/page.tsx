export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Next.js + Hono + Supabase
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          A modern full-stack starter template with Next.js 15, Hono RPC,
          Supabase Auth, Drizzle ORM, and TanStack Query.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/api"
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            View API Routes
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
