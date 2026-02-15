import { Mountain, Instagram, Twitter, Facebook } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getPageKey(pathname: string) {
  if (pathname.startsWith("/treks/")) return "/treks/:slug";
  if (pathname.startsWith("/blog/")) return "/blog/:slug";
  if (pathname.startsWith("/trek/")) return "/trek/:trekSlug/:blogSlug";
  if (pathname.startsWith("/admin")) return "/admin";
  return pathname || "/";
}

export function Footer() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [email, setEmail] = useState("");
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    const pageKey = getPageKey(location);
    fetch(`${API}/api/faqs?page=${encodeURIComponent(pageKey)}`)
      .then((res) => res.json())
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => setFaqs([]));
  }, [location]);

  const handleSubscribe = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Enter a valid email",
        description: "Please provide a valid email address to subscribe.",
      });
      return;
    }
    toast({
      title: "Subscribed",
      description: "Thanks for subscribing to Reboot India updates.",
    });
    setEmail("");
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return (
    <footer className="bg-charcoal text-offwhite py-16 md:py-24">
      {faqSchema ? (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        </Helmet>
      ) : null}

      {faqs.length > 0 ? (
        <section className="container mx-auto px-4 md:px-6 mb-14">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6 md:p-8">
            <h2 className="font-serif text-2xl md:text-3xl mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="rounded-xl border border-white/15 bg-black/10 p-4">
                  <h3 className="font-semibold text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm text-gray-200">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-maroon rounded-lg text-white">
                <Mountain size={24} strokeWidth={1.5} />
              </div>
              <span className="font-serif text-2xl font-bold">Reboot India</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Curating exceptional trekking experiences in the Indian Himalayas.
              Reconnect with nature, reboot your soul.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <Link href="/treks">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    All Treks
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Trekking Journal
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/treks?season=summer">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Summer Treks
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/treks?season=winter">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Winter Treks
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li>
                <Link href="/about">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    About Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/team">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Our Team
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Sustainability
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/refund-policy">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Refund Policy
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-6">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest trekking stories and offers.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-maroon transition-colors"
              />
              <button
                onClick={handleSubscribe}
                className="bg-maroon hover:bg-forest text-white px-4 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 text-sm">
            © 2024 Reboot India. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <Instagram size={20} className="text-gray-400 hover:text-white transition-colors" />
            </a>
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              <Twitter size={20} className="text-gray-400 hover:text-white transition-colors" />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <Facebook size={20} className="text-gray-400 hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
