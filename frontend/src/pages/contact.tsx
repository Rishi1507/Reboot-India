import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/PageHero";
import { useState, type FormEvent } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to submit");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Failed to submit");
    }
  }

  return (
    <div className="min-h-screen bg-offwhite text-charcoal">
      <Helmet>
        <link rel="canonical" href="https://rebootindia.co.in/contact" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Reboot India",
            url: "https://rebootindia.co.in/",
            logo: "https://rebootindia.co.in/og/logo.png",
          })}
        </script>
        <title>Contact Us | Reboot India</title>
        <meta
          name="description"
          content="Get in touch with Reboot India for questions about treks, bookings, partnerships, and support."
        />
      </Helmet>

      <Navigation />

      <PageHero
        title="Contact Us"
        subtitle="We're here to help - let's talk."
        eyebrow="Get In Touch"
      />

      <section className="container mx-auto px-6 py-20 max-w-2xl">
        <form className="space-y-6" onSubmit={submit}>
          <div>
            <label className="block font-semibold text-sm mb-2">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-forest"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-forest"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-2">Message</label>
            <textarea
              rows={6}
              placeholder="Write your message here..."
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-forest"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {status === "success" ? (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
              Message sent. We’ll get back to you soon.
            </div>
          ) : null}
          {error ? (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full bg-maroon text-white font-semibold py-3 rounded-full hover:bg-forest transition disabled:opacity-60"
          >
            {status === "submitting" ? "Sending..." : "Send Message"}
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
}
