"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark as BookmarkIcon } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("linkedout_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${API_URL}/posts/bookmarks/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setPosts(Array.isArray(data) ? data : (data.results || [])); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
          <h1 className="font-semibold flex items-center gap-2"><BookmarkIcon className="h-5 w-5" /> Bookmarks</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {loading ? <p>Loading...</p> : posts.length === 0 ? (
          <p className="text-center text-zinc-500 py-10">No bookmarked posts yet</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 hover:border-zinc-300 dark:hover:border-zinc-700">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{post.content}</p>
                <p className="mt-2 text-xs text-zinc-500">{post.company_name}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
