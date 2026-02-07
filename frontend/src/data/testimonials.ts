export type Testimonial = {
  name: string;
  location: string;
  quote: string;
  rating: number;
  trek?: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Aarav Mehta",
    location: "Mumbai",
    rating: 5,
    trek: "Brahmatal Trek",
    quote:
      "The team was incredibly professional and warm. The trail, the camps, and the views were unforgettable.",
  },
  {
    name: "Riya Sharma",
    location: "Delhi",
    rating: 5,
    trek: "Kuari Pass",
    quote:
      "Felt safe and cared for throughout. The trek leader was knowledgeable and the itinerary was perfect.",
  },
  {
    name: "Kunal Verma",
    location: "Bengaluru",
    rating: 4,
    trek: "Kedarkantha Trek",
    quote:
      "Great organization and clear communication. The summit day was challenging but worth every step.",
  },
];
