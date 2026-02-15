import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { TrekCard } from "@/components/TrekCard";

import { useTreks } from "@/hooks/use-treks";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Seo } from "@/components/Seo";

export default function TreksList() {
  const { data: treks, isLoading } = useTreks();
  const [location] = useLocation();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");

  const parsePrice = (price: string) =>
    Number(String(price || "").replace(/[^0-9]/g, "")) || 0;
  const parseDays = (duration: string) => {
    const match = String(duration || "").match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seasonParam = params.get("season");
    if (seasonParam) {
      setSearch(seasonParam);
    }
  }, [location]);

  const filteredTreks = treks?.filter((trek) => {
    const difficulty = (trek?.difficulty || "").toLowerCase();
    const title = (trek?.title || "").toLowerCase();
    const season = (trek?.season || "").toLowerCase();
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch =
      !searchTerm ||
      title.includes(searchTerm) ||
      season.includes(searchTerm);
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "easy") return difficulty.includes("easy");
    if (filter === "moderate")
      return difficulty.includes("moderate") && !difficulty.includes("easy");
    if (filter === "difficult") return difficulty.includes("difficult");
    return matchesSearch;
  });

  const sortedTreks = filteredTreks?.slice().sort((a: any, b: any) => {
    if (sort === "price-low") return parsePrice(a.price) - parsePrice(b.price);
    if (sort === "price-high") return parsePrice(b.price) - parsePrice(a.price);
    if (sort === "duration") return parseDays(a.duration) - parseDays(b.duration);
    return 0;
  });

  return (
    <div className="min-h-screen bg-offwhite">
      <Seo
        title="All Treks | Reboot India"
        description="Explore curated Himalayan treks with dates, difficulty levels, and seasonal highlights."
        canonical="https://rebootindia.co.in/treks"
      />
      <Navigation />
      
      {/* Header */}
      <div className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="absolute inset-0">
          <img
            src="/images/treks/home-hero.png"
            alt="Mountain landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/75" />
        </div>
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6 animate-in slide-in-from-bottom-5 fade-in duration-700">
            Our Treks
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg animate-in slide-in-from-bottom-5 fade-in duration-700 delay-100">
            Choose from our handpicked selection of treks. From easy weekend hikes to challenging expeditions, find your perfect mountain escape.
          </p>
        </div>
      </div>

      {/* Filters & Grid */}
      <div className="container mx-auto px-4 md:px-6 py-12 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {["all", "easy", "moderate", "difficult"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                  filter === f 
                    ? "bg-maroon text-white shadow-md" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f} Treks
              </button>
            ))}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all"
            />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-48 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon transition-all"
            >
              <option value="popular">Sort: Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[450px] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTreks?.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
