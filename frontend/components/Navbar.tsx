"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, Menu, X, LogOut, User, Bell, Bookmark, Plus, Home as HomeIcon } from "lucide-react";
import { useTheme } from "../app/theme-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function Navbar() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("linkedout_token");
    setToken(t);
    if (t) {
      fetch(`${API_URL}/users/me/`, { headers: { Authorization: `Bearer ${t}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setUser(d))
        .catch(() => {});
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("linkedout_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const navLink = (href: string, label: string, icon?: React.ReactNode) => {
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white shadow-lg shadow-red-600/30">
            L
          </div>
          <span className="text-lg font-bold tracking-tight">Linkedout</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLink("/", "Home", <HomeIcon className="h-4 w-4" />)}
          {token && navLink("/create", "Create", <Plus className="h-4 w-4" />)}
          {token && navLink("/notifications", "Alerts", <Bell className="h-4 w-4" />)}
          {token && navLink("/bookmarks", "Saved", <Bookmark className="h-4 w-4" />)}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {token ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href={user ? `/profile/${user.id}` : "#"}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">{user?.username || "Profile"}</span>
              </Link>
              <Link
                href="/settings"
                className="rounded-full px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Settings
              </Link>
              <button
                onClick={logout}
                className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Log in
              </Link>
              <Link href="/register" className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-600/30 hover:bg-red-700">
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {navLink("/", "Home", <HomeIcon className="h-4 w-4" />)}
              {token && navLink("/create", "Create", <Plus className="h-4 w-4" />)}
              {token && navLink("/notifications", "Notifications", <Bell className="h-4 w-4" />)}
              {token && navLink("/bookmarks", "Bookmarks", <Bookmark className="h-4 w-4" />)}
              {token && (
                <>
                  <Link href={user ? `/profile/${user.id}` : "#"} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                  <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    Settings
                  </Link>
                  <button onClick={logout} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </>
              )}
              {!token && (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="rounded-full px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">
                    Log in
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="rounded-full bg-red-600 px-3 py-2 text-sm font-medium text-white">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
