"use client";


import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Repeat2, Bookmark } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function ProfileContent() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const t = localStorage.getItem("linkedout_token");
    setToken(t);
    if (t) fetchCurrentUser(t);
    fetchProfile();
  }, [params.id]);

  const fetchCurrentUser = async (t: string) => {
    const res = await fetch(`${API_URL}/users/me/`, { headers: { Authorization: `Bearer ${t}` } });
    if (res.ok) setCurrentUser(await res.json());
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const headers: any = {};
      const t = localStorage.getItem("linkedout_token");
      if (t) headers.Authorization = `Bearer ${t}`;

      const userRes = await fetch(`${API_URL}/users/${params.id}/`, { headers });
      if (userRes.ok) setUser(await userRes.json());

      const postsRes = await fetch(`${API_URL}/users/${params.id}/posts/`, { headers });
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(Array.isArray(data) ? data : (data.results || []));
      }
    } catch {}
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!token || !user) return;
    const res = await fetch(`${API_URL}/users/${user.id}/follow/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUser({ ...user, is_following: data.following, followers_count: data.following ? user.followers_count + 1 : user.followers_count - 1 });
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading profile...</div>;
  if (!user) return <div className="flex min-h-screen items-center justify-center">User not found</div>;

  const isOwn = currentUser?.id === user.id;

  return (
    <div className="min-h-screen">

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-2xl font-bold text-white">
                {user.username[0].toUpperCase()}
              </div>
              <h2 className="mt-3 text-2xl font-bold">{user.username}</h2>
              {user.company && <p className="text-zinc-500">{user.company}</p>}
              {user.bio && <p className="mt-2 text-zinc-600 dark:text-zinc-300">{user.bio}</p>}
              <div className="mt-3 flex gap-4 text-sm text-zinc-500">
                <span><strong className="text-zinc-900 dark:text-zinc-100">{user.followers_count || 0}</strong> followers</span>
                <span><strong className="text-zinc-900 dark:text-zinc-100">{user.following_count || 0}</strong> following</span>
              </div>
            </div>
            {!isOwn && token && (
              <button
                onClick={handleFollow}
                className={`rounded-full px-5 py-2 text-sm font-medium ${user.is_following ? "bg-zinc-200 dark:bg-zinc-700" : "bg-red-600 text-white hover:bg-red-700"}`}
              >
                {user.is_following ? "Following" : "Follow"}
              </button>
            )}
            {isOwn && (
              <Link href="/settings" className="rounded-full border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-sm">
                Edit profile
              </Link>
            )}
          </div>
        </div>

        <h3 className="mb-4 text-lg font-semibold">Stories</h3>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-zinc-500">No stories yet.</p>
          ) : (
            posts.map((post: any) => (
              <Link key={post.id} href={`/post/${post.id}`} className="block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition">
                <h4 className="font-semibold">{post.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{post.content}</p>
                <div className="mt-3 flex gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes_count}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments_count}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
