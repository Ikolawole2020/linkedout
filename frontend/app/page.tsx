"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, Share2, Plus, Search, LogOut, User, Bookmark, Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "./theme-provider";
import { PostSkeleton } from "@/components/Skeleton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Post {
  id: number;
  author: { username: string; id: number };
  company_name: string;
  company_anonymous: boolean;
  reason_category: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  bookmarks_count: number;
  created_at: string;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_bookmarked?: boolean;
  image?: string;
}

const reasonLabels: Record<string, string> = {
  toxic_management: "Toxic Management",
  low_pay: "Low Pay",
  no_growth: "No Growth",
  work_life: "Work-Life Balance",
  harassment: "Harassment",
  micromanagement: "Micromanagement",
  burnout: "Burnout",
  other: "Other",
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState("newest");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("linkedout_token");
    if (stored) {
      setToken(stored);
      fetchUser(stored);
    }
    fetchPosts();
  }, [sort, filter]);

  const fetchUser = async (t: string) => {
    try {
      const res = await fetch(`${API_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) setUser(await res.json());
    } catch {}
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/posts/`;
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filter) params.append("reason", filter);
      params.append("sort", sort);
      if (params.toString()) url += `?${params.toString()}`;

      const t = localStorage.getItem("linkedout_token");
      const headers: any = {};
      if (t) headers.Authorization = `Bearer ${t}`;

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.results || data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleAction = async (postId: number, action: "like" | "repost" | "bookmark") => {
    if (!token) {
      alert("Please log in");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/${action}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: action === "repost" ? JSON.stringify({ comment: "" }) : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => prev.map((p) => {
          if (p.id !== postId) return p;
          if (action === "like") return { ...p, likes_count: data.likes_count, is_liked: data.liked };
          if (action === "repost") return { ...p, reposts_count: data.reposts_count, is_reposted: data.reposted };
          if (action === "bookmark") return { ...p, bookmarks_count: data.bookmarks_count, is_bookmarked: data.bookmarked };
          return p;
        }));
      }
    } catch {}
  };

  const logout = () => {
    localStorage.removeItem("linkedout_token");
    setToken(null);
    setUser(null);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchPosts()} placeholder="Search stories, companies, reasons..." className="w-full rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" />
          </div>
          <button onClick={fetchPosts} className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-600/30 hover:bg-red-700 transition">Search</button>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("")}
              className={`rounded-full px-4 py-1.5 text-sm ${!filter ? "bg-red-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
            >
              All
            </button>
            {Object.entries(reasonLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-4 py-1.5 text-sm ${filter === key ? "bg-red-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 text-sm">
            {["newest", "top", "discussed"].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded-full px-3 py-1 capitalize ${sort === s ? "bg-zinc-200 dark:bg-zinc-700" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4].map(i => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 py-20 text-center">
            <p className="text-zinc-500">No stories yet. Be the first to share why you left.</p>
            <Link href="/create" className="mt-4 inline-block rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700">
              Share your story
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm transition hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Link href={`/profile/${post.author.id}`} className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline">
                        {post.is_anonymous ? "Anonymous" : post.author.username}
                      </Link>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Link href={`/company?name=${encodeURIComponent(post.company_name)}`} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-medium text-red-500 hover:underline">
                        {post.company_anonymous ? "Anonymous Company" : post.company_name}
                      </Link>
                      <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs">
                        {reasonLabels[post.reason_category] || post.reason_category}
                      </span>
                    </div>
                  </div>
                </div>

                <Link href={`/post/${post.id}`}>
                  <h2 className="mb-2 text-lg font-semibold hover:text-red-500">{post.title}</h2>
                  <p className="line-clamp-3 text-zinc-600 dark:text-zinc-300">{post.content}</p>
                {post.image && <img src={post.image} alt="" className="mt-3 max-h-64 w-full rounded-xl object-cover" />}
                </Link>

                <div className="mt-4 flex items-center gap-6 text-zinc-500">
                  <button
                    onClick={() => handleAction(post.id, "like")}
                    className={`flex items-center gap-1.5 text-sm transition hover:text-red-500 ${post.is_liked ? "text-red-500" : ""}`}
                  >
                    <Heart className={`h-4 w-4 ${post.is_liked ? "fill-current" : ""}`} />
                    {post.likes_count}
                  </button>
                  <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm hover:text-blue-500">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments_count}
                  </Link>
                  <button
                    onClick={() => handleAction(post.id, "repost")}
                    className={`flex items-center gap-1.5 text-sm hover:text-green-500 ${post.is_reposted ? "text-green-500" : ""}`}
                  >
                    <Repeat2 className="h-4 w-4" />
                    {post.reposts_count}
                  </button>
                  <button
                    onClick={() => handleAction(post.id, "bookmark")}
                    className={`flex items-center gap-1.5 text-sm hover:text-yellow-500 ${post.is_bookmarked ? "text-yellow-500" : ""}`}
                  >
                    <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? "fill-current" : ""}`} />
                    {post.bookmarks_count}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
