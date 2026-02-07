import { Trek } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, Clock, BarChart } from "lucide-react";

export function TrekCard({ trek }: { trek: Trek }) {
  return (
    <Link href={`/treks/${trek.slug}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-maroon/20 transition-all duration-500 cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
          <img
            src={trek.coverImage}
            alt={trek.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-maroon shadow-sm">
            {trek.discountedPrice ? `?${trek.discountedPrice}` : trek.price}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-serif text-xl font-bold text-charcoal mb-2 group-hover:text-maroon transition-colors">
            {trek.title}
          </h3>
          
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 font-medium uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-maroon" />
              {trek.duration}
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart size={14} className="text-maroon" />
              {trek.difficulty}
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
            {trek.shortDescription}
          </p>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-forest font-medium">
              <Calendar size={14} />
              {trek.season}
            </div>
            <span className="text-sm font-semibold text-maroon group-hover:translate-x-1 transition-transform inline-flex items-center">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
