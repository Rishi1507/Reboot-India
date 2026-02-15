import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";
import { PageHero } from "@/components/PageHero";

const teamMembers = [
  {
    name: "Neeraj Kohli",
    role: "Founder & Lead Guide",
    img: "/images/treks/team-1.png",
    bio: "Mountain leader who’s walked every major trail in the Indian Himalayas.",
  },
  {
    name: "Pratibha Nayak",
    role: "Operations Head",
    img: "/images/treks/team-2.png",
    bio: "Keeps the logistics tight and the experiences smooth.",
  },
  {
    name: "Rishi Raj",
    role: "Marketing & Tech Head",
    img: "/images/treks/team-3.png",
    bio: "Bridges tech with local partners and storytellers.",
  },
];

export default function Team() {
  return (
    <div className="min-h-screen bg-offwhite text-charcoal">
      <Helmet>
        <link rel="canonical" href="https://rebootindia.co.in/team" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Reboot India",
            url: "https://rebootindia.co.in/",
            logo: "https://rebootindia.co.in/og/logo.png",
          })}
        </script>
        <title>Our Team | Reboot India</title>
        <meta
          name="description"
          content="Meet the passionate team behind Reboot India who craft unforgettable trekking experiences."
        />
      </Helmet>

      <Navigation />

      <PageHero
        title="Meet Our Team"
        subtitle="Dedicated leaders, planners, and trailblazers."
        eyebrow="Reboot India"
      />

      {/* Team Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {teamMembers.map((m) => (
            <div
              key={m.name}
              className="bg-white rounded-3xl shadow-md overflow-hidden transition-transform hover:scale-105"
            >
              <div className="overflow-hidden h-72">
                <img
                  src={m.img}
                  alt={m.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-serif text-2xl font-bold mb-2">
                  {m.name}
                </h3>
                <p className="text-maroon font-semibold mb-4">{m.role}</p>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {m.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
