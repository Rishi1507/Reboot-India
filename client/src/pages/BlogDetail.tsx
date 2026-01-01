import { useBlog } from "@/hooks/use-blogs";
import { useRoute, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import ReactMarkdown from "react-markdown";

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const { data: blog, isLoading } = useBlog(params?.slug || "");

  if (isLoading || !blog) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 bg-gray-300 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Article Header */}
      <div className="pt-32 pb-12 md:pt-40 container mx-auto px-4 md:px-6 max-w-4xl text-center">
        <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
          <span>{blog.date}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{blog.author}</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-12 leading-tight">
          {blog.title}
        </h1>
      </div>

      {/* Featured Image */}
      <div className="container mx-auto px-4 md:px-6 max-w-5xl mb-16">
        <div className="aspect-[21/9] rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-24">
        <article className="prose prose-lg prose-headings:font-serif prose-headings:text-charcoal prose-p:text-gray-600 prose-p:leading-loose prose-a:text-maroon prose-img:rounded-xl prose-blockquote:border-l-maroon prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic mx-auto">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </article>

        <div className="mt-16 pt-8 border-t border-gray-100 flex justify-center">
          <Link href="/blog">
            <button className="px-8 py-3 border border-gray-200 hover:border-maroon hover:text-maroon rounded-full transition-colors font-medium">
              ← Back to Journal
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
