import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TrekCard } from "@/components/TrekCard";
import { useTreks } from "@/hooks/use-treks";
import { useBlogs } from "@/hooks/use-blogs";
import { Link } from "wouter";
import { ArrowRight, Leaf, Shield, Compass } from "lucide-react";

export default function Home() {
  const { data: treks } = useTreks();
  const { data: blogs } = useBlogs();

  const featuredTreks = treks?.slice(0, 3);
  const featuredBlogs = blogs?.slice(0, 2);

  return (
    <div className="min-h-screen bg-offwhite">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          {/* Hero background - Himalayan Peaks */}
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
            alt="Himalayan Landscape"
            className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000"
          />
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-medium tracking-widest uppercase mb-6 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
            Adventure Awaits
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight animate-in slide-in-from-bottom-5 fade-in duration-700 delay-200">
            Reboot Your Mind. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 font-serif italic">
              Reconnect With Nature.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
            Curated trekking experiences in the untouched corners of the Indian Himalayas. 
            Escape the noise, find your silence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-400">
            <Link href="/treks">
              <button className="px-8 py-4 bg-maroon hover:bg-forest text-white rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-maroon/20 w-full sm:w-auto">
                Explore Treks
              </button>
            </Link>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold transition-all w-full sm:w-auto">
              Watch Film
            </button>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center text-forest mb-6">
                <Leaf size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-charcoal">Sustainable Travel</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">
                We believe in leaving no trace. Our treks are eco-friendly and support local communities.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-maroon/10 flex items-center justify-center text-maroon mb-6">
                <Shield size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-charcoal">Expert Safety</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">
                Your safety is our priority. Certified trek leaders, high-quality gear, and emergency protocols.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                <Compass size={32} />
              </div>
              <h3 className="font-serif text-xl font-bold mb-3 text-charcoal">Curated Routes</h3>
              <p className="text-gray-600 leading-relaxed max-w-xs">
                Offbeat trails and classic routes, carefully selected to offer you the best views and experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Treks */}
      <section className="py-24 bg-offwhite">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-maroon font-semibold tracking-widest text-sm uppercase mb-2 block">Top Rated Adventures</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal">Popular Treks</h2>
            </div>
            <Link href="/treks">
              <span className="hidden md:flex items-center gap-2 text-forest font-semibold hover:text-maroon transition-colors cursor-pointer group">
                View All Treks <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTreks?.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/treks">
              <button className="px-6 py-3 border border-charcoal text-charcoal rounded-full font-medium hover:bg-charcoal hover:text-white transition-colors">
                View All Treks
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Journal Preview */}
      <section className="py-24 bg-forest text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform origin-top-right pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
            <div className="md:w-1/3">
              <span className="text-white/60 font-semibold tracking-widest text-sm uppercase mb-4 block">The Journal</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Tales from the Trails</h2>
              <p className="text-white/80 leading-relaxed mb-8 text-lg">
                Read about high-altitude fitness, packing hacks, and inspiring stories from our community of trekkers.
              </p>
              <Link href="/blog">
                <button className="px-8 py-3 bg-white text-forest rounded-full font-semibold hover:bg-offwhite transition-colors">
                  Read Our Blog
                </button>
              </Link>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredBlogs?.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`}>
                  <div className="group cursor-pointer">
                    <div className="overflow-hidden rounded-xl mb-4 aspect-[4/3]">
                      <img 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">{blog.date}</div>
                    <h3 className="font-serif text-xl font-bold mb-2 group-hover:underline decoration-white/30 underline-offset-4">
                      {blog.title}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">{blog.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
