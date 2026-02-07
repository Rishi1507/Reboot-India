import { useTrek } from "@/hooks/use-treks";
import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import {
  Clock,
  BarChart,
  MapPin,
  Mountain,
  CalendarCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BookingModal } from "@/components/BookingModal";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { Seo } from "@/components/Seo";
import { testimonials } from "@/data/testimonials";
import { trekFaqs } from "@/data/trekFaqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function TrekDetail() {
  const [, params] = useRoute("/treks/:slug");
  const { data: trek, isLoading } = useTrek(params?.slug || "");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedDeparture, setSelectedDeparture] = useState<any>(null);

  const trekData: any = trek || {};
  const itinerary = Array.isArray(trekData.itinerary)
    ? trekData.itinerary
    : [];
  const season = trekData.season || "All Seasons";
  const duration = trekData.duration || "Multi-day";
  const difficulty = trekData.difficulty || "Moderate";
  const description =
    trekData.fullDescription || trekData.description || "";

  const reviewSchema = useMemo(() => {
    if (!trekData?.title) return null;
    const reviews = testimonials.slice(0, 2).map((t) => ({
      "@type": "Review",
      author: t.name,
      reviewRating: {
        "@type": "Rating",
        ratingValue: t.rating,
      },
      reviewBody: t.quote,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: trekData.title,
      description,
      image: trekData.coverImage || undefined,
      offers: {
        "@type": "Offer",
        price: String(trekData.price || ""),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        reviewCount: "128",
      },
      review: reviews,
    };
  }, [description, trekData.coverImage, trekData.price, trekData.title]);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: trekFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    }),
    []
  );

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

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title={`${trek.title} | Reboot India`}
        description={description.slice(0, 160)}
        canonical={`https://rebootindia.co.in/treks/${trek.slug}`}
        image={trek.coverImage}
        structuredData={[reviewSchema, faqSchema].filter(Boolean) as object[]}
      />
      <Navigation />

      {/* HERO */}
      <div className="relative h-[65vh] bg-black">
        <img
          src={trek.coverImage || "/images/treks/fallback.svg"}
          alt={trek.title}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="text-white">
              <div className="text-sm uppercase tracking-widest text-white/70">
                Himalayan Treks
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold">
                {trek.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <Clock size={16} /> {duration}
                </span>
                <span className="flex items-center gap-2">
                  <BarChart size={16} /> {difficulty}
                </span>
                <span className="flex items-center gap-2">
                  <MapPin size={16} /> Himalayas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10">
          {/* MAIN */}
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <Mountain className="text-maroon" size={18} />
                <div>
                  <div className="text-xs text-gray-500">Season</div>
                  <div className="text-sm font-semibold">{season}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="text-maroon" size={18} />
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="text-sm font-semibold">{duration}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BarChart className="text-maroon" size={18} />
                <div>
                  <div className="text-xs text-gray-500">Difficulty</div>
                  <div className="text-sm font-semibold">{difficulty}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarCheck className="text-maroon" size={18} />
                <div>
                  <div className="text-xs text-gray-500">Batches</div>
                  <div className="text-sm font-semibold">
                    {(trek.departures || []).length}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-serif text-2xl font-bold">
                Trek to the high Himalayas
              </h2>
              <p className="mt-4 text-gray-700 leading-relaxed">
                {description}
              </p>
            </div>

            {itinerary.length > 0 ? (
              <div className="mt-10">
                <h3 className="font-serif text-xl font-bold">
                  Quick Itinerary
                </h3>
                <div className="mt-4 space-y-3">
                  {itinerary.map((day: any) => (
                    <div
                      key={`${day.day}-${day.title}`}
                      className="border rounded-xl p-4 bg-white"
                    >
                      <div className="text-sm text-gray-500">
                        Day {day.day}
                      </div>
                      <div className="font-semibold">{day.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {day.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-12">
              <h3 className="font-serif text-2xl font-bold">
                Trekker Reviews
              </h3>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((t) => (
                  <div
                    key={`${t.name}-${t.location}`}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <div className="text-sm text-gray-500">
                      {t.location}
                    </div>
                    <div className="font-semibold mt-1">{t.name}</div>
                    <div className="mt-3 text-gray-700 text-sm">
                      {t.quote}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12">
              <h3 className="font-serif text-2xl font-bold">
                FAQs
              </h3>
              <div className="mt-4">
                <Accordion type="single" collapsible>
                  {trekFaqs.map((faq, index) => (
                    <AccordionItem
                      key={faq.question}
                      value={`faq-${index}`}
                    >
                      <AccordionTrigger>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm text-gray-500">Trek Fee</div>
              <div className="text-3xl font-bold text-charcoal mt-1">
                {trek.discountedPrice
                  ? `₹${trek.discountedPrice}`
                  : trek.price || `₹${selectedDeparture?.pricePerSeat || ""}`}
              </div>
              {trek.originalPrice ? (
                <div className="text-sm text-gray-500 line-through">
                  ₹{trek.originalPrice}
                </div>
              ) : null}
              <div className="text-xs text-gray-500 mt-1">
                Per person
              </div>

              <div className="mt-4">
                <button
                  disabled={!selectedDeparture}
                  onClick={() => setBookingOpen(true)}
                  className="w-full bg-maroon hover:bg-forest disabled:opacity-40 text-white px-6 py-3 rounded font-bold"
                >
                  {selectedDeparture ? "Book Trek" : "Select a Date"}
                </button>
              </div>

              {selectedDeparture ? (
                <div className="mt-3 text-sm text-gray-600">
                  Selected:{" "}
                  <span className="font-semibold">
                    {new Date(
                      selectedDeparture.startDate
                    ).toDateString()}
                  </span>
                </div>
              ) : null}
            </div>

            <AvailabilityCalendar
              departures={trek.departures || []}
              selectedDepartureId={selectedDeparture?.id}
              onSelect={(d) => setSelectedDeparture(d)}
            />
          </div>
        </div>

        {/* BOOKING MODAL */}
        <BookingModal
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          trekId={trek.id}
          trekTitle={trek.title}
          departureId={selectedDeparture?.id}
          pricePerSeat={selectedDeparture?.pricePerSeat}
        />
      </div>

      <Footer />
    </div>
  );
}
