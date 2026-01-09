import { useBlog } from "@/hooks/use-blogs";
import { useRoute, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanityImage";
import { Helmet } from "react-helmet-async";

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

  const faqSchema =
    blog.faqs && blog.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: blog.faqs.map((faq: any) => ({
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
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{blog.seoTitle || blog.title}</title>
        <meta
          name="description"
          content={blog.seoDescription || blog.excerpt}
        />

        <meta property="og:title" content={blog.seoTitle || blog.title} />
        <meta
          property="og:description"
          content={blog.seoDescription || blog.excerpt}
        />
        {blog.coverImage && (
          <meta
            property="og:image"
            content={urlFor(blog.coverImage).width(1200).url()}
          />
        )}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />

        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>

      <Navigation />

      {/* HEADER */}
      <div className="pt-32 pb-12 md:pt-40 container mx-auto px-4 md:px-6 max-w-4xl text-center">
        {blog.publishedAt && (
          <div className="text-sm text-gray-500 uppercase tracking-wider mb-6">
            {new Date(blog.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        )}

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-12">
          {blog.title}
        </h1>
      </div>

      {/* IMAGE */}
      {blog.coverImage && (
        <div className="container mx-auto px-4 md:px-6 max-w-5xl mb-16">
          <img
            src={urlFor(blog.coverImage).width(1600).url()}
            alt={blog.title}
            className="rounded-2xl shadow-lg w-full"
          />
        </div>
      )}

      {/* CONTENT */}
      <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-24">
        <article className="prose prose-lg mx-auto">
          <PortableText value={blog.content} />
        </article>

        {blog.faqs && blog.faqs.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-3xl mb-6">
              Frequently Asked Questions
            </h2>
            {blog.faqs.map((faq: any, i: number) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 pt-8 border-t flex justify-center">
          <Link href="/blog">
            <button className="px-8 py-3 border rounded-full">
              ← Back to Journal
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
