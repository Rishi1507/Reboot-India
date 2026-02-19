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
  const [otpId, setOtpId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const step: "credentials" | "otp" = otpId ? "otp" : "credentials";

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
      if (data?.token) {
        setAdminToken(data.token);
        setLocation("/admin");
        return;
      }
      if (data?.otpRequired && data?.otpId) {
        setOtpId(String(data.otpId));
        return;
      }
      throw new Error("Unexpected login response");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    try {
      if (!otpId) return;
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/api/admin/login/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "OTP verification failed");
      if (!data?.token) throw new Error("Token missing");
      setAdminToken(data.token);
      setLocation("/admin");
    } catch (err: any) {
      setError(err?.message || "OTP verification failed");
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
          {step === "credentials" ? (
            <>
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
            </>
          ) : (
            <>
              <div className="text-sm text-gray-700">
                OTP sent to <span className="font-medium">{email}</span>. Enter it below to continue.
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\s+/g, ""))}
                className="w-full border rounded px-3 py-2 tracking-widest text-center text-lg"
              />
              <button
                type="button"
                className="text-sm underline"
                onClick={() => {
                  setOtpId(null);
                  setOtp("");
                  setError(null);
                }}
              >
                Back
              </button>
            </>
          )}
          {error ? <div className="text-red-600 text-sm">{error}</div> : null}
          <LoadingButton
            onClick={step === "credentials" ? handleLogin : handleVerifyOtp}
            loading={loading}
            className="w-full bg-maroon text-white py-2 rounded"
          >
            {step === "credentials" ? "Send OTP" : "Verify OTP"}
          </LoadingButton>
        </div>
      </div>
      <Footer />
    </div>
  );
}
