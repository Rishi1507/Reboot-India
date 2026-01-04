import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useBlogs } from "@/hooks/use-blogs";
import { Link } from "wouter";

export default function BlogList() {
  const { data: blogs, isLoading } = useBlogs();

  return (
    <div className="min-h-screen bg-offwhite">
      <Navigation />
      
      <div className="bg-forest pt-32 pb-16 md:pt-40 md:pb-24 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <span className="inline-block py-1 px-3 rounded bg-white/10 backdrop-blur text-white/80 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            The Journal
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Stories from the Mountains
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Guides, tips, and tales to inspire your next adventure.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {blogs?.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`}>
                <div className="group cursor-pointer flex flex-col h-full">
                  <div className="overflow-hidden rounded-2xl aspect-[16/9] mb-6 shadow-sm">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    <span>{blog.date}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{blog.author}</span>
                  </div>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-4 group-hover:text-maroon transition-colors">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <span className="mt-auto text-maroon font-semibold text-sm group-hover:translate-x-2 transition-transform inline-block">
                    Read Article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
