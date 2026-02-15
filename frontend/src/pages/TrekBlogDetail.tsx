import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function TrekBlogDetail() {
  const [, params] = useRoute("/trek/:trekSlug/:blogSlug");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API}/api/treks/${params?.trekSlug}/blogs/${params?.blogSlug}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Blog not found");
        setData(json);
      } catch (err: any) {
        setError(err?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    if (params?.trekSlug && params?.blogSlug) run();
  }, [params?.trekSlug, params?.blogSlug]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="h-screen flex items-center justify-center">{error}</div>;

  const trek = data?.trek || {};
  const blog = data?.blog || {};
  const highlights = Array.isArray(blog.highlights) ? blog.highlights : [];
  const itinerary = Array.isArray(blog.itinerary) ? blog.itinerary : [];

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title={`${blog.metaTitle || blog.title} | Reboot India`}
        description={blog.metaDescription || blog.shortIntro || ""}
        canonical={`https://rebootindia.co.in/trek/${trek.slug}/${blog.slug}`}
      />
      <Navigation />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-2">{blog.title}</h1>
        <div className="text-sm text-gray-600 mb-4">
          {trek.title} | {trek.location || "Himalayas"} | {trek.difficulty}
        </div>
        {blog.featuredImage ? (
          <img
            src={blog.featuredImage}
            alt={blog.imageAltText || blog.title}
            className="w-full h-80 object-cover rounded-xl border mb-6"
          />
        ) : null}
        <p className="text-lg text-gray-700 whitespace-pre-line mb-6">{blog.shortIntro}</p>
        <article className="prose max-w-none whitespace-pre-line mb-6">{blog.content}</article>
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
