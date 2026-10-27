"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const reasons = [
  { value: "toxic_management", label: "Toxic Management" },
  { value: "low_pay", label: "Low Pay / Benefits" },
  { value: "no_growth", label: "No Growth / Stagnation" },
  { value: "work_life", label: "Poor Work-Life Balance" },
  { value: "harassment", label: "Harassment / Discrimination" },
  { value: "micromanagement", label: "Micromanagement" },
  { value: "burnout", label: "Burnout" },
  { value: "other", label: "Other" },
];

export default function CreatePostPage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    company_name: "",
    company_anonymous: false,
    reason_category: "other",
    is_anonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("linkedout_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/posts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/");
      } else {
        const data = await res.json();
        setError(JSON.stringify(data));
      }
    } catch {
      setError("Failed to create post");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">

      <main className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 surface p-6 sm:p-8">
          {error && <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
            <input
              type="text"
              placeholder="Why I finally left..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Company</label>
            <input
              type="text"
              placeholder="Company name"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              required
            />
            <label className="mt-2 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={form.company_anonymous}
                onChange={(e) => setForm({ ...form, company_anonymous: e.target.checked })}
                className="rounded accent-red-600"
              />
              Keep company anonymous
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Main reason</label>
            <select
              value={form.reason_category}
              onChange={(e) => setForm({ ...form, reason_category: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            >
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Your story</label>
            <textarea
              rows={8}
              placeholder="Tell the real story. What happened? What made you leave?"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.is_anonymous}
              onChange={(e) => setForm({ ...form, is_anonymous: e.target.checked })}
              className="rounded accent-red-600"
            />
            Post anonymously
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-3 font-medium text-white shadow-lg shadow-red-600/30 hover:bg-red-700 disabled:opacity-50 transition"
          >
            {loading ? "Publishing..." : "Publish story"}
          </button>
        </form>
      </main>
    </div>
  );
}
