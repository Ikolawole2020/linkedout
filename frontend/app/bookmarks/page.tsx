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
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold"><BookmarkIcon className="h-6 w-6" /> Bookmarks</h1>
        {loading ? <p>Loading...</p> : posts.length === 0 ? (
          <p className="text-center text-zinc-500 py-10">No bookmarked posts yet</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition">
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
