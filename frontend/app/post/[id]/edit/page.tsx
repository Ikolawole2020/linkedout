"use client";

export const instant = false;

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", content: "", company_name: "", reason_category: "other" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("linkedout_token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API_URL}/posts/${params.id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setForm({
        title: data.title,
        content: data.content,
        company_name: data.company_name,
        reason_category: data.reason_category,
      }));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("linkedout_token");
    if (!token) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/posts/${params.id}/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push(`/post/${params.id}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="text-zinc-500">← Cancel</Link>
          <h1 className="font-semibold">Edit story</h1>
          <div />
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3" required />
          <input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3" required />
          <textarea rows={8} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3" required />
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-red-600 py-3 text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
