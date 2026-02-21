import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { useTrek } from "@/hooks/use-treks";
import { useTrekBlog } from "@/hooks/use-trek-blogs";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanityImage";
import { useEffect, useState } from "react";

export default function TrekBlogDetail() {
  const [, params] = useRoute("/trek/:trekSlug/:blogSlug");
  const trekSlug = params?.trekSlug || "";
  const blogSlug = params?.blogSlug || "";

  const { data: trek, isLoading: trekLoading } = useTrek(trekSlug);
  const { data: blog, isLoading: blogLoading, error } = useTrekBlog(trekSlug, blogSlug);

  const [legacy, setLegacy] = useState<any>(null);
  const [legacyLoading, setLegacyLoading] = useState(false);

  useEffect(() => {
    if (!trekSlug || !blogSlug) return;
    if (blogLoading) return;
    if (blog) return;

    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    setLegacyLoading(true);
    fetch(`${API}/api/treks/${trekSlug}/blogs/${blogSlug}`)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json?.error || "Blog not found");
        setLegacy(json);
      })
      .catch(() => setLegacy(null))
      .finally(() => setLegacyLoading(false));
  }, [trekSlug, blogSlug, blogLoading, blog]);

  if (trekLoading || blogLoading || legacyLoading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!trek) return <div className="h-screen flex items-center justify-center">Trek not found</div>;
  const legacyBlog = legacy?.blog || null;
  if (!blog && !legacyBlog) {
    return (
      <div className="h-screen flex items-center justify-center">
        {String((error as any)?.message || "Blog not found")}
      </div>
    );
  }

  const activeBlog: any = blog || legacyBlog;
  const highlights = Array.isArray(activeBlog.highlights) ? activeBlog.highlights : [];
  const itinerary = Array.isArray(activeBlog.itinerary) ? activeBlog.itinerary : [];

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title={`${activeBlog.metaTitle || activeBlog.title} | Reboot India`}
        description={activeBlog.metaDescription || activeBlog.shortIntro || ""}
        canonical={`https://rebootindia.co.in/trek/${trek.slug}/${activeBlog.slug}`}
      />
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-2">{activeBlog.title}</h1>
        <div className="text-sm text-gray-600 mb-4">
          {trek.title} | {trek.location || "Himalayas"} | {trek.difficulty}
        </div>
        {activeBlog.featuredImage ? (
          <img
            src={
              typeof activeBlog.featuredImage === "string"
                ? activeBlog.featuredImage
                : urlFor(activeBlog.featuredImage).width(1400).url()
            }
            alt={activeBlog.imageAltText || activeBlog.title}
            className="w-full h-80 object-cover rounded-xl border mb-6"
          />
        ) : null}
        <p className="text-lg text-gray-700 whitespace-pre-line mb-6">{activeBlog.shortIntro}</p>
        <article className="prose max-w-none mb-6">
          {blog ? (
            <PortableText
              value={activeBlog.content || []}
              components={{
                types: {
                  image: ({ value }: any) => (
                    <img
                      src={urlFor(value).width(1400).url()}
                      alt={activeBlog.imageAltText || activeBlog.title}
                      className="rounded-xl border my-4"
                    />
                  ),
                },
              }}
            />
          ) : (
            <div className="whitespace-pre-line">{activeBlog.content}</div>
          )}
        </article>
        {highlights.length > 0 ? (
          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Key Highlights</h2>
            <ul className="list-disc pl-6">
              {highlights.map((h: string, i: number) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {itinerary.length > 0 ? (
          <section>
            <h2 className="text-2xl font-semibold mb-2">Itinerary</h2>
            <div className="space-y-2">
              {itinerary.map((d: any, i: number) => (
                <div key={i} className="border rounded p-3 bg-white">
                  <div className="font-semibold">
                    Day {d.dayNumber || i + 1}: {d.title}
                  </div>
                  <div className="text-sm text-gray-700">{d.description}</div>
                  <div className="text-xs text-gray-500">
                    Distance: {d.distanceKm || "NA"} | Altitude: {d.altitude || "NA"} | Stay:{" "}
                    {d.stayType || "NA"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
