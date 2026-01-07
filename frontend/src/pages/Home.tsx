import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TrekCard } from "@/components/TrekCard";
import { useTreks } from "@/hooks/use-treks";
import { useBlogs } from "@/hooks/use-blogs";
import { Link } from "wouter";
import { ArrowRight, Leaf, Shield, Compass } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const { data: treks } = useTreks();
  const { data: blogs } = useBlogs();

  const featuredTreks = treks?.slice(0, 3);
  const featuredBlogs = blogs?.slice(0, 2);

  return (
    <div className="min-h-screen bg-offwhite">
      {/* ================= SEO META ================= */}
      <Helmet>
        <title>Himalayan Treks & Nature Retreats | Reboot Your Mind</title>

        <meta
          name="description"
          content="Discover curated trekking experiences in the Indian Himalayas. Sustainable travel, expert safety, and offbeat trails designed to help you reconnect with nature."
        />

        <meta
          name="keywords"
          content="Himalayan treks, trekking in India, adventure travel, mountain trekking, nature retreats"
        />

        <meta name="robots" content="index, follow" />

        <link rel="canonical" href="https://rebootindia.co.in/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Himalayan Treks & Nature Retreats" />
        <meta
          property="og:description"
          content="Escape the noise and reconnect with nature through curated Himalayan trekking experiences."
        />
        <meta property="og:image" content="https://rebootindia.co.in//og/home.jpg" />
        <meta property="og:url" content="https://rebootindia.co.in//" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Himalayan Treks & Nature Retreats" />
        <meta
          name="twitter:description"
          content="Curated trekking adventures in the Indian Himalayas."
        />
        <meta name="twitter:image" content="https://rebootindia.co.in/og/home.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "TravelAgency",
            "name": "Reboot India",
            "url": "https://rebootindia.co.in/",
            "description": "Curated Himalayan trekking experiences focused on sustainability and safety.",
            "image": "https://rebootindia.co.in//og/home.jpg"
          }
        `}
        </script>
      </Helmet>
      {/* ================= END SEO ================= */}

      <Navigation />

      {/* ================= HERO ================= */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
            alt="Himalayan Landscape"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-medium tracking-widest uppercase mb-6">
            Adventure Awaits
          </span>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
            Reboot Your Mind. <br />
            <span className="italic text-gray-200">Reconnect With Nature.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Curated trekking experiences in the untouched corners of the Indian Himalayas.
            Escape the noise, find your silence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/treks">
              <button className="px-8 py-4 bg-maroon hover:bg-forest text-white rounded-full font-semibold transition-all hover:scale-105">
                Explore Treks
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center text-forest mb-6">
                <Leaf size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-charcoal">
                Sustainable Travel
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">
                We believe in leaving no trace. Our treks are eco-friendly and support local communities.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-maroon/10 flex items-center justify-center text-maroon mb-6">
                <Shield size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-charcoal">
                Expert Safety
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">
                Certified trek leaders, high-quality gear, and emergency protocols.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <Compass size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-charcoal">
                Curated Routes
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">
                Offbeat trails and classic routes selected for unforgettable experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURED TREKS ================= */}
      <section className="py-24 bg-offwhite">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-maroon font-semibold tracking-widest text-sm uppercase mb-2 block">
                Top Rated Adventures
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal">
                Popular Treks
              </h2>
            </div>

            <Link href="/treks">
              <span className="hidden md:flex items-center gap-2 text-forest font-semibold cursor-pointer">
                View All Treks <ArrowRight size={20} />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTreks?.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= JOURNAL ================= */}
      <section className="py-24 bg-forest text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredBlogs?.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <div className="cursor-pointer">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="rounded-xl mb-4"
                  />
                  <h3 className="font-serif text-xl font-bold">{blog.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
