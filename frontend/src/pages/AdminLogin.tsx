import { useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { setAdminToken } from "@/lib/adminApi";
import { LoadingButton } from "@/components/LoadingButton";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }
      setAdminToken(data.token);
      setLocation("/admin");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title="Admin Login | Reboot India"
        description="Secure admin access for Reboot India."
        canonical="https://rebootindia.co.in/admin/login"
      />
      <Navigation />
      <div className="container mx-auto px-4 md:px-6 pt-32 pb-16 max-w-md">
        <h1 className="font-serif text-3xl font-bold text-charcoal">
          Admin Login
        </h1>
        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {error ? <div className="text-red-600 text-sm">{error}</div> : null}
          <LoadingButton
            onClick={handleLogin}
            loading={loading}
            className="w-full bg-maroon text-white py-2 rounded"
          >
            Sign In
          </LoadingButton>
        </div>
      </div>
      <Footer />
    </div>
  );
}
