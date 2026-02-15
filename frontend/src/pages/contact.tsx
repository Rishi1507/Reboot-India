import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/PageHero";

export default function Contact() {
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
        <form className="space-y-6">
          <div>
            <label className="block font-semibold text-sm mb-2">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block font-semibold text-sm mb-2">Message</label>
            <textarea
              rows={6}
              placeholder="Write your message here..."
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:border-forest"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-maroon text-white font-semibold py-3 rounded-full hover:bg-forest transition"
          >
            Send Message
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
}
