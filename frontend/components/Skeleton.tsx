export function PostSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="mb-2 h-5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="mb-4 space-y-2">
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="flex gap-6">
        <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}