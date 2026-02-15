import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useBlogs } from "@/hooks/use-blogs";
import { useNews } from "@/hooks/use-news";
import { Link } from "wouter";
import { Seo } from "@/components/Seo";
import { PageHero } from "@/components/PageHero";

export default function BlogList() {
  const { data: blogs, isLoading } = useBlogs();
  const { data: news, isLoading: newsLoading } = useNews();

  const getBlogImage = (slug: string, index: number) => {
    const variant = (index % 4) + 1;
    return `/images/treks/blog-card-${variant}.svg`;
  };

  const getNewsImage = (index: number) => {
    const variant = (index % 2) + 1;
    return `/images/treks/news-card-${variant}.svg`;
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title="Trekking Journal | Reboot India"
        description="Guides, tips, and tales to inspire your next adventure in the Himalayas."
        canonical="https://rebootindia.co.in/blog"
      />
      <Navigation />

      <PageHero
        title="Stories from the Mountains"
        subtitle="Guides, tips, and tales to inspire your next adventure."
        eyebrow="The Journal"
        image="/images/treks/blog-hero.svg"
      />

      {/* JOURNAL LIST */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {blogs?.map((blog, index) => (
              <Link key={blog.slug} href={`/blog/${blog.slug}`}>
                <div className="group cursor-pointer flex flex-col h-full">
                  {/* IMAGE */}
                  <div className="overflow-hidden rounded-2xl aspect-[16/9] mb-6 shadow-sm">
                    <img
                      src={getBlogImage(blog.slug, index)}
                      alt={blog.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                  </div>

                  {/* META */}
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {blog.publishedAt && (
                      <span>
                        {new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>

                  {/* TITLE */}
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-4 group-hover:text-maroon transition-colors">
                    {blog.title}
                  </h2>

                  {/* EXCERPT */}
                  <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                    {blog.excerpt}
                  </p>

                  {/* CTA */}
                  <span className="mt-auto text-maroon font-semibold text-sm group-hover:translate-x-2 transition-transform inline-block">
                    Read Article →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* NEWS */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-maroon font-semibold tracking-widest text-sm uppercase mb-2 block">
                Latest Updates
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">
                News
              </h2>
            </div>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {news?.map((item, index) => (
                <div key={item.slug} className="bg-offwhite rounded-2xl p-6">
                  <img
                    src={getNewsImage(index)}
                    alt={item.title}
                    className="rounded-xl mb-4"
                    loading="lazy"
                  />
                  <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "News"}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-charcoal">
                    {item.title}
                  </h3>
                  {item.excerpt ? (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                      {item.excerpt}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
