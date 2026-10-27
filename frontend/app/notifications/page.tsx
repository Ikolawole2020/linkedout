"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("linkedout_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetch(`${API_URL}/notifications/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : (data.results || []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async () => {
    const token = localStorage.getItem("linkedout_token");
    if (!token) return;
    await fetch(`${API_URL}/notifications/mark_read/`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
            <ArrowLeft className="h-5 w-5" /> Back
          </Link>
          <h1 className="font-semibold">Notifications</h1>
          <button onClick={markRead} className="text-sm text-red-500">Mark all read</button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-zinc-500 py-10">No notifications yet</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`rounded-xl border p-4 ${n.is_read ? "border-zinc-200 dark:border-zinc-800" : "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"}`}>
                <p className="text-sm">
                  <strong>{n.actor.username}</strong>{" "}
                  {n.notification_type === "like" && "liked your post"}
                  {n.notification_type === "comment" && "commented on your post"}
                  {n.notification_type === "repost" && "reposted your post"}
                  {n.notification_type === "follow" && "started following you"}
                  {n.notification_type === "bookmark" && "bookmarked your post"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
