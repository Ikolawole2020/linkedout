"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "", first_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        // Auto login
        const loginRes = await fetch(`${API_URL}/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: form.username, password: form.password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem("linkedout_token", loginData.access);
          router.push("/");
        }
      } else {
        setError(Object.values(data).flat().join(" ") || "Registration failed");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-xl font-bold">L</div>
          <h1 className="text-2xl font-bold">Join Linkedout</h1>
          <p className="mt-1 text-sm text-zinc-400">Share your real exit story</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 outline-none focus:border-red-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 outline-none focus:border-red-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 outline-none focus:border-red-500"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm</label>
              <input
                type="password"
                value={form.password2}
                onChange={(e) => setForm({ ...form, password2: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 outline-none focus:border-red-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-2.5 font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="text-red-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
