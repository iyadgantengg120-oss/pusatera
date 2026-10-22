"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@movera.id");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email atau password salah");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(circle at 90% 10%, #0F3A4D 0%, transparent 60%), #081C27",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border p-8"
        style={{ background: "#0E2A3A", borderColor: "#1E4A5E" }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold">
            <span style={{ color: "#2A7CB7" }}>MO</span>
            <span style={{ color: "#F89C1D" }}>VERA</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9BB0BB" }}>
            Masuk ke PUSATERA
          </p>
        </div>

        <label className="block text-sm mb-1 text-white">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 rounded-lg px-3 py-2 text-white outline-none border"
          style={{ background: "#081C27", borderColor: "#1E4A5E" }}
          required
        />

        <label className="block text-sm mb-1 text-white">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded-lg px-3 py-2 text-white outline-none border"
          style={{ background: "#081C27", borderColor: "#1E4A5E" }}
          required
        />

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-2 font-semibold text-white disabled:opacity-60"
          style={{ background: "#2596B5" }}
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}