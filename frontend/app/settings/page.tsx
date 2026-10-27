"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function SettingsPage() {
  const [form, setForm] = useState({ bio: "", company: "", first_name: "", last_name: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("linkedout_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${API_URL}/users/me/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setForm({ bio: data.bio || "", company: data.company || "", first_name: data.first_name || "", last_name: data.last_name || "" }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("linkedout_token");
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/update_profile/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setMessage("Profile updated!");
      else setMessage("Failed to update");
    } catch {
      setMessage("Error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-4 surface p-6">
          {message && <div className="rounded-lg bg-green-500/10 px-4 py-2 text-sm text-green-600">{message}</div>}
          <div>
            <label className="mb-1 block text-sm font-medium">First name</label>
            <input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Last name</label>
            <input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company</label>
            <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <textarea rows={4} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 outline-none focus:border-red-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-red-600 py-2.5 font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>

        <hr className="my-8 border-zinc-200 dark:border-zinc-800" />

        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
        <PasswordForm />
      </main>
    </div>
  );
}

function PasswordForm() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("linkedout_token");
    if (!token) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/users/change_password/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ old_password: oldPass, new_password: newPass }),
    });
    const data = await res.json();
    setMsg(res.ok ? "Password changed!" : (data.error || "Failed"));
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {msg && <div className="text-sm text-green-600">{msg}</div>}
      <input type="password" placeholder="Current password" value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5" required />
      <input type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5" required minLength={8} />
      <button type="submit" disabled={loading} className="rounded-lg bg-zinc-800 dark:bg-zinc-700 px-5 py-2 text-sm text-white">
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
