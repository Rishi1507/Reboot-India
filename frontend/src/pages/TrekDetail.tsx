import { useTrek } from "@/hooks/use-treks";
import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { Seo } from "@/components/Seo";
import { useMemo, useState, useEffect } from "react";
import {
  Clock,
  BarChart,
  MapPin,
  Mountain,
  ShieldCheck,
  Users,
} from "lucide-react";

/* =============================
   CONSTANT CONTENT
============================= */

const inclusions = [
  "Accommodation in tents",
  "All meals during trek",
  "Certified trek leader",
  "First aid & safety equipment",
  "All permits and forest fees",
];

const exclusions = [
  "Travel to base camp",
  "Personal expenses",
  "Insurance",
  "Offloading charges",
];

const cancellationPolicy = `
30+ days: 90% refund  
15–30 days: 50% refund  
0–15 days: No refund
`;

export default function TrekDetail() {
  const [, params] = useRoute("/treks/:slug");
  const { data: trek, isLoading } = useTrek(params?.slug || "");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<any>(null);
  const [showSticky, setShowSticky] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  /* =============================
     DATA PREP
  ============================= */

  const trekData: any = trek || {};
  const departures = trekData.departures || [];
  const gallery =
    Array.isArray(trekData.gallery) && trekData.gallery.length
      ? trekData.gallery
      : [trekData.coverImage];

  /* =============================
     BATCH ANALYTICS
  ============================= */

  const batchStats = useMemo(() => {
    if (!departures.length) return null;

    const sorted = [...departures].sort(
      (a: any, b: any) =>
        (b.bookedSeats || 0) - (a.bookedSeats || 0)
    );

    return {
      mostPopular: sorted[0],
    };
  }, [departures]);

  /* =============================
     PRICE SURGE
  ============================= */

  const surgePrice = useMemo(() => {
    if (!selectedDeparture) return null;

    const total = selectedDeparture.totalSeats;
    const booked = selectedDeparture.bookedSeats || 0;
    const remaining = total - booked;

    let price = selectedDeparture.pricePerSeat;

    if (remaining <= 3) price *= 1.15;
    else if (remaining <= 5) price *= 1.1;

    return Math.round(price);
  }, [selectedDeparture]);

  /* =============================
     STICKY BAR
  ============================= */

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 700);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =============================
     SCHEMA
  ============================= */

  const schema = useMemo(() => {
    if (!trekData?.title) return null;

    return {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: trekData.title,
      description: trekData.fullDescription || "",
      offers: {
        "@type": "Offer",
        price:
          surgePrice ||
          trekData.discountedPrice ||
          trekData.price ||
          "",
        priceCurrency: "INR",
      },
    };
  }, [trekData, surgePrice]);

  /* =============================
     STATES
  ============================= */

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!trek)
    return (
      <div className="h-screen flex items-center justify-center">
        Trek not found
      </div>
    );

  const remainingSeats = selectedDeparture
    ? selectedDeparture.totalSeats -
      (selectedDeparture.bookedSeats || 0)
    : null;

  /* =============================
     UI
  ============================= */

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title={`${trekData.title} | Reboot India`}
        description={trekData.shortDescription}
        structuredData={[schema].filter(Boolean) as object[]}
      />

      <Navigation />

      {/* HERO */}
      <div className="relative h-[60vh]">
        <img
          src={gallery[galleryIndex]}
          className="w-full h-full object-cover"
        />

        {/* Gallery Controls */}
        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {gallery.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setGalleryIndex(i)}
                className={`w-3 h-3 rounded-full ${
                  galleryIndex === i ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-4xl font-bold">{trekData.title}</h1>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="flex gap-1 items-center">
              <Clock size={16} /> {trekData.duration}
            </span>
            <span className="flex gap-1 items-center">
              <BarChart size={16} /> {trekData.difficulty}
            </span>
            <span className="flex gap-1 items-center">
              <MapPin size={16} /> Himalayas
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-10">

        {/* LEFT */}
        <div className="space-y-10">

          {/* BLOG SEO CONTENT */}
          <section>
            <h2 className="text-2xl font-bold mb-3">
              About {trekData.title}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {trekData.title} is one of the most scenic Himalayan treks.
              This {trekData.duration} trek is rated {trekData.difficulty}
              and best visited during {trekData.season}.

              Experience forests, meadows, and breathtaking summit views.
              Perfect for both beginners and experienced trekkers.
            </p>
          </section>

          {/* INCLUSION */}
          <section>
            <h2 className="text-xl font-bold mb-2">Inclusions</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {inclusions.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>

          {/* EXCLUSION */}
          <section>
            <h2 className="text-xl font-bold mb-2">Exclusions</h2>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {exclusions.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </section>

          {/* CANCELLATION */}
          <section>
            <h2 className="text-xl font-bold mb-2">
              Cancellation Policy
            </h2>
            <p className="text-gray-700 whitespace-pre-line">
              {cancellationPolicy}
            </p>
          </section>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-4">

          {/* PRICE CARD */}
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="text-3xl font-bold">
              ₹
              {surgePrice ||
                trekData.discountedPrice ||
                trekData.price}
            </div>

            {remainingSeats !== null && remainingSeats <= 5 && (
              <div className="text-red-600 text-sm mt-1">
                Only {remainingSeats} seats left!
              </div>
            )}

            {batchStats?.mostPopular && (
              <div className="text-orange-600 text-sm mt-1">
                Most popular batch:{" "}
                {new Date(
                  batchStats.mostPopular.startDate
                ).toDateString()}
              </div>
            )}

            <button
              disabled={!selectedDeparture}
              onClick={() => setBookingOpen(true)}
              className="mt-4 w-full bg-maroon text-white py-3 rounded font-bold"
            >
              Book Now
            </button>

            {/* TRUST BADGES */}
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} /> Safe & Certified
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} /> 5,000+ Trekkers
              </div>
              <div className="flex items-center gap-2">
                <Mountain size={16} /> Expert Leaders
              </div>
            </div>
          </div>

          {/* CALENDAR */}
          <AvailabilityCalendar
            departures={departures}
            selectedDepartureId={selectedDeparture?.id}
            onSelect={(d) => setSelectedDeparture(d)}
          />

          {/* HEATMAP */}
          <div className="bg-white border rounded-xl p-4">
            <div className="font-semibold mb-2">
              Batch Availability
            </div>
            {departures.slice(0, 6).map((d: any) => {
              const remaining =
                d.totalSeats - (d.bookedSeats || 0);

              let color = "text-green-600";
              let label = "Available";

              if (remaining <= 3) {
                color = "text-red-600";
                label = "Almost Full";
              } else if (remaining <= 6) {
                color = "text-orange-600";
                label = "Filling Fast";
              }

              return (
                <div
                  key={d.id}
                  className="flex justify-between text-sm border-b py-1"
                >
                  <span>
                    {new Date(d.startDate).toDateString()}
                  </span>
                  <span className={color}>
                    {remaining} left · {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FLOATING CTA */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 flex justify-between items-center z-50">
          <div className="font-bold text-lg">
            ₹
            {surgePrice ||
              trekData.discountedPrice ||
              trekData.price}
          </div>
          <button
            disabled={!selectedDeparture}
            onClick={() => setBookingOpen(true)}
            className="bg-maroon text-white px-6 py-2 rounded font-bold"
          >
            Book Now
          </button>
        </div>
      )}

      <BookingModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        trekId={trekData.id}
        trekTitle={trekData.title}
        departureId={selectedDeparture?.id}
        pricePerSeat={surgePrice}
      />

      <Footer />
    </div>
  );
}
