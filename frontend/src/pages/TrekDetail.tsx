import { useTrek } from "@/hooks/use-treks";
import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { Seo } from "@/components/Seo";
import { useEffect, useMemo, useState } from "react";
import { Clock, BarChart, MapPin } from "lucide-react";
import { useTrekBlogs } from "@/hooks/use-trek-blogs";

type ContentBlock = {
  type: "h1" | "h2" | "h3" | "p" | "ul";
  text?: string;
  items?: string[];
};

function renderContentBlock(block: ContentBlock, index: number) {
  if (block.type === "h1") {
    return (
      <h2 key={index} className="text-3xl font-bold text-charcoal">
        {block.text}
      </h2>
    );
  }
  if (block.type === "h2") {
    return (
      <h3 key={index} className="text-2xl font-semibold text-charcoal">
        {block.text}
      </h3>
    );
  }
  if (block.type === "h3") {
    return (
      <h4 key={index} className="text-xl font-semibold text-charcoal">
        {block.text}
      </h4>
    );
  }
  if (block.type === "ul") {
    return (
      <ul key={index} className="list-disc pl-5 text-gray-700 space-y-1">
        {(block.items || []).map((item, i) => (
          <li key={`${index}-${i}`}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <p key={index} className="text-gray-700 leading-relaxed whitespace-pre-line">
      {block.text}
    </p>
  );
}

export default function TrekDetail() {
  const [, params] = useRoute("/treks/:slug");
  const { data: trek, isLoading } = useTrek(params?.slug || "");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<any>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [reviewData, setReviewData] = useState<{
    totalReviews: number;
    avgRating: number;
    reviews: any[];
  }>({
    totalReviews: 0,
    avgRating: 0,
    reviews: [],
  });
  const { data: trekBlogs, isLoading: trekBlogsLoading } = useTrekBlogs(params?.slug || "");
  const [legacyTrekBlogs, setLegacyTrekBlogs] = useState<any[]>([]);

  const trekData: any = trek || {};
  const departures = (trekData.departures || []).slice().sort(
    (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );

  const headerPhotos =
    Array.isArray(trekData.headerPhotos) && trekData.headerPhotos.length
      ? trekData.headerPhotos
      : Array.isArray(trekData.gallery) && trekData.gallery.length
        ? trekData.gallery
        : [trekData.coverImage];

  const morePhotos =
    Array.isArray(trekData.morePhotos) && trekData.morePhotos.length
      ? trekData.morePhotos
      : Array.isArray(trekData.gallery)
        ? trekData.gallery
        : [];

  const contentBlocks: ContentBlock[] = Array.isArray(trekData.contentBlocks)
    ? trekData.contentBlocks
    : [];

  const selectedPrice = useMemo(() => {
    if (!selectedDeparture) return trekData.discountedPrice || trekData.price;
    return selectedDeparture.pricePerSeat;
  }, [selectedDeparture, trekData]);

  useEffect(() => {
    if (!params?.slug) return;
    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    fetch(`${API}/api/treks/${params.slug}/reviews`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.reviews) setReviewData(d);
      })
      .catch(() => undefined);
  }, [params?.slug]);

  // Backward-compatible fallback: if no Sanity trek blogs exist yet, fetch legacy Prisma trek blogs.
  useEffect(() => {
    if (!params?.slug) return;
    if (trekBlogsLoading) return;
    if ((trekBlogs || []).length > 0) return;

    const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
    fetch(`${API}/api/treks/${params.slug}/blogs`)
      .then((r) => r.json())
      .then((d) => setLegacyTrekBlogs(Array.isArray(d?.blogs) ? d.blogs : []))
      .catch(() => setLegacyTrekBlogs([]));
  }, [params?.slug, trekBlogsLoading, (trekBlogs || []).length]);

  const blogsToShow = (trekBlogs || []).length > 0 ? trekBlogs : legacyTrekBlogs;

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!trek) return <div className="h-screen flex items-center justify-center">Trek not found</div>;

  const remainingSeats = selectedDeparture
    ? selectedDeparture.totalSeats - (selectedDeparture.bookedSeats || 0)
    : null;

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title={`${trekData.title} | Reboot India`}
        description={trekData.shortDescription}
        canonical={`https://rebootindia.co.in/treks/${trekData.slug}`}
      />
      <Navigation />

      <div className="relative h-[62vh]">
        <img src={headerPhotos[galleryIndex]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {headerPhotos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {headerPhotos.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className={`w-2.5 h-2.5 rounded-full ${galleryIndex === i ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-4xl font-bold">{trekData.title}</h1>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="flex gap-1 items-center"><Clock size={16} />{trekData.duration}</span>
            <span className="flex gap-1 items-center"><BarChart size={16} />{trekData.difficulty}</span>
            <span className="flex gap-1 items-center"><MapPin size={16} />{trekData.season}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold mb-3">About {trekData.title}</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {trekData.fullDescription || trekData.description}
            </p>
          </section>

          {contentBlocks.length > 0 && (
            <section className="space-y-4">
              {contentBlocks.map((block, index) => renderContentBlock(block, index))}
            </section>
          )}

          {(blogsToShow || []).length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-3">Trek Blogs</h2>
              <p className="text-gray-600 mb-4">
                Read detailed trek-specific blogs before booking this trek.
              </p>
              <div className="space-y-3">
                {(blogsToShow || []).map((blog: any) => (
                  <a
                    key={blog.slug}
                    href={`/trek/${trekData.slug}/${blog.slug}`}
                    className="block bg-white border rounded-xl p-4 hover:border-maroon transition-colors"
                  >
                    <div className="font-semibold text-charcoal">{blog.title}</div>
                    {blog.shortIntro ? (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{blog.shortIntro}</p>
                    ) : null}
                    <div className="text-xs text-maroon mt-2">Read full blog</div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {morePhotos.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-3">More Photos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {morePhotos.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${trekData.title} photo ${idx + 1}`}
                    className="w-full h-36 object-cover rounded-xl border"
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-3">Reviews</h2>
            <div className="text-sm text-gray-600 mb-3">
              Average Rating: {reviewData.avgRating} / 5 ({reviewData.totalReviews} reviews)
            </div>
            <div className="space-y-3">
              {(reviewData.reviews || []).slice(0, 6).map((r: any) => (
                <div key={r.id} className="bg-white border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    {r.reviewerPhotoUrl ? (
                      <img
                        src={r.reviewerPhotoUrl}
                        alt={r.reviewerName}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full border" />
                    )}
                    <div>
                      <div className="font-semibold">{r.reviewerName}</div>
                      <div className="text-xs text-gray-600">
                        {"★".repeat(Number(r.rating || 0))}
                        {"☆".repeat(5 - Number(r.rating || 0))}
                      </div>
                    </div>
                  </div>
                  {r.reviewTitle ? <div className="mt-2 font-medium">{r.reviewTitle}</div> : null}
                  <p className="text-gray-700 text-sm mt-1">{r.reviewText}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-600">Step 1: Select Batch</div>
              <AvailabilityCalendar
                departures={departures}
                selectedDepartureId={selectedDeparture?.id}
                onSelect={(d) => setSelectedDeparture(d)}
              />
            </div>

            {selectedDeparture && (
              <div className="rounded border p-3 bg-gray-50 text-sm space-y-1">
                <div><strong>Batch:</strong> {new Date(selectedDeparture.startDate).toDateString()} - {new Date(selectedDeparture.endDate).toDateString()}</div>
                <div><strong>Price:</strong> ₹{selectedPrice}</div>
                <div><strong>Seats Left:</strong> {remainingSeats}</div>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="text-sm font-medium text-gray-600">Step 2: Book with Advance</div>
              <div className="text-3xl font-bold">₹{selectedPrice}</div>
              <div className="text-xs text-gray-600">Pay only ₹500 now. Balance at trek.</div>
              <button
                disabled={!selectedDeparture}
                onClick={() => setBookingOpen(true)}
                className="mt-3 w-full bg-maroon text-white py-3 rounded font-bold disabled:bg-gray-300"
              >
                {selectedDeparture ? "Proceed to Booking" : "Select Batch First"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        trekId={trekData.id}
        trekTitle={trekData.title}
        departureId={selectedDeparture?.id}
        pricePerSeat={selectedPrice}
      />

      <Footer />
    </div>
  );
}
