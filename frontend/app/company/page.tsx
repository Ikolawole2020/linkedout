"use client";

export const instant = false;

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function CompanyPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name") || "";
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!name) { setLoading(false); return; }
    fetch(`${API_URL}/posts/by_company/?name=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : (data.results || [])); setLoading(false); })
      .catch(() => setLoading(false));
  }, [name]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">{name || "Company"}</h1>
        <p className="mb-6 text-sm text-zinc-500">{posts.length} stories</p>
        {loading ? <p>Loading...</p> : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{post.content}</p>
                <div className="mt-2 text-xs text-zinc-500">{new Date(post.created_at).toLocaleDateString()}</div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
