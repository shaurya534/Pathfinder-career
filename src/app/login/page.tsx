"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    params.get("mode") === "register" ? "register" : "login"
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    targetRole: "",
    targetCompany: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl text-ink mb-1">Pathfinder</p>
        <p className="text-sm text-ink/50 mb-6">
          {mode === "login" ? "Welcome back." : "Let's build your roadmap."}
        </p>
        <form onSubmit={submit} className="space-y-3">
          {mode === "register" && (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-md border border-line text-sm"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2.5 rounded-md border border-line text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2.5 rounded-md border border-line text-sm"
            required
            minLength={6}
          />
          {mode === "register" && (
            <>
              <input
                placeholder="Target role (e.g. Software Engineer)"
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-line text-sm"
              />
              <input
                placeholder="Target company (e.g. TCS)"
                value={form.targetCompany}
                onChange={(e) => setForm({ ...form, targetCompany: e.target.value })}
                className="w-full px-3 py-2.5 rounded-md border border-line text-sm"
              />
            </>
          )}
          {error && <p className="text-xs text-rose">{error}</p>}
          <button
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-ink text-white text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-xs text-ink/50 mt-4 hover:text-ink"
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
