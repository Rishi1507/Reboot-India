import { useTrek } from "@/hooks/use-treks";
import { useRoute } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Calendar, Clock, BarChart, MapPin, Check, ChevronDown, Mountain } from "lucide-react";
import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { clsx } from "clsx";
import { BookingModal } from "@/components/BookingModal";

export default function TrekDetail() {
  const [, params] = useRoute("/treks/:slug");
  const { data: trek, isLoading } = useTrek(params?.slug || "");
  const [activeImage, setActiveImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  if (isLoading || !trek) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full" />
          <div className="h-4 w-32 bg-gray-300 rounded" />
        </div>
      </div>
    );
  }

  // Cast itinerary to expected type since it's jsonb in schema
  const itinerary = trek.itinerary as { day: number; title: string; desc: string }[];
  const gallery = trek.gallery as string[];

  return (
    <div className="min-h-screen bg-offwhite">
      <Navigation />

      {/* Hero */}
      <div className="relative h-[80vh] min-h-[600px]">
        <div className="absolute inset-0">
          <img 
            src={trek.coverImage} 
            alt={trek.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-16 md:pb-24">
          <div className="container mx-auto px-4 md:px-6">
            <span className="inline-block py-1 px-3 rounded bg-white/20 backdrop-blur text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              {trek.season}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6">
              {trek.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="text-maroon" /> {trek.duration}
              </div>
              <div className="flex items-center gap-2">
                <BarChart className="text-maroon" /> {trek.difficulty}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-maroon" /> Himalayan Range
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 relative">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content */}
          <div className="lg:w-2/3 space-y-16">
            {/* Overview */}
            <section>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-6">Overview</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {trek.fullDescription}
              </p>
            </section>

            {/* Gallery */}
            <section>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-6">Photo Gallery</h2>
              <div className="grid grid-cols-3 gap-4">
                {gallery.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setActiveImage(idx)}
                  >
                    <img 
                      src={img} 
                      alt={`Gallery ${idx + 1}`} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <section>
              <h2 className="font-serif text-3xl font-bold text-charcoal mb-6">Day by Day Itinerary</h2>
              <Accordion.Root type="single" collapsible className="space-y-4">
                {itinerary.map((day) => (
                  <Accordion.Item 
                    key={day.day} 
                    value={`day-${day.day}`}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-maroon/30 transition-colors"
                  >
                    <Accordion.Header>
                      <Accordion.Trigger className="w-full flex items-center justify-between p-5 text-left group">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-maroon/10 text-maroon flex items-center justify-center font-bold text-sm">
                            {day.day}
                          </span>
                          <span className="font-serif text-lg font-semibold text-charcoal group-hover:text-maroon transition-colors">
                            {day.title}
                          </span>
                        </div>
                        <ChevronDown className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                      <div className="p-5 pt-0 pl-[4.5rem] text-gray-600 leading-relaxed pb-6">
                        {day.desc}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-8">
              <div className="text-center mb-8">
                <span className="text-gray-500 text-sm uppercase tracking-wide font-medium">Starting From</span>
                <div className="text-4xl font-serif font-bold text-maroon mt-2">{trek.price}</div>
                <div className="text-xs text-gray-400 mt-1">per person including GST</div>
              </div>

              <button 
                onClick={() => setBookingOpen(true)}
                className="w-full py-4 bg-maroon hover:bg-forest text-white rounded-xl font-bold text-lg shadow-lg shadow-maroon/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 mb-6"
                data-testid="button-book-trek"
              >
                Book This Trek
              </button>

              <BookingModal
                open={bookingOpen}
                onOpenChange={setBookingOpen}
                trekSlug={trek.slug}
                trekTitle={trek.title}
                pricePerPerson={trek.price}
              />

              <div className="space-y-4 text-sm text-gray-600 border-t border-gray-100 pt-6">
                <div className="flex items-start gap-3">
                  <Check size={18} className="text-forest mt-0.5" />
                  <span>Expert Trek Leaders & Guides</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={18} className="text-forest mt-0.5" />
                  <span>All meals during the trek</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={18} className="text-forest mt-0.5" />
                  <span>Camping Equipment (Tents, Sleeping bags)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check size={18} className="text-forest mt-0.5" />
                  <span>Forest Permits & Camping Charges</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="font-serif font-bold text-charcoal mb-4">Upcoming Batches</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-maroon/30 cursor-pointer transition-colors">
                    <span className="font-medium text-gray-700">Dec 15 - Dec 20</span>
                    <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Available</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-maroon/30 cursor-pointer transition-colors">
                    <span className="font-medium text-gray-700">Dec 22 - Dec 27</span>
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">Fast Filling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
