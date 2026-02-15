import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { PageHero } from "@/components/PageHero";
import { Seo } from "@/components/Seo";
import { BadgeCheck, Mountain, ShieldCheck, Users, HeartHandshake, Compass } from "lucide-react";

const differentiators = [
  "We focus on experience, not volume",
  "Small group sizes for better safety and personal attention",
  "Carefully curated treks including unexplored routes",
  "Safety-first approach on every expedition",
  "Authentic Himalayan experience instead of commercial crowd-based trekking",
  "Strong focus on local culture and environment",
];

const chooseUs = [
  "Small and manageable group sizes",
  "Certified and experienced trek leaders",
  "Well-planned itineraries for safety and comfort",
  "Curated treks designed for real mountain experiences",
  "Local village partnerships and support",
  "Personalized attention and support before and during the trek",
];

const trustCards = [
  { icon: Users, title: "Small Groups", text: "Personal attention, stronger safety, better trek quality." },
  { icon: ShieldCheck, title: "Safety First", text: "High-altitude protocols, first aid readiness, risk checks." },
  { icon: HeartHandshake, title: "Local Support", text: "Village partnerships that create real local impact." },
  { icon: BadgeCheck, title: "Experienced Leaders", text: "Mountain professionals with years of trail exposure." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-charcoal text-white scroll-smooth">
      <Seo
        title="About Reboot India | Meaningful Himalayan Trekking"
        description="Learn how Reboot India started, what we stand for, and why trekkers trust us for safe and meaningful Himalayan experiences."
        canonical="https://rebootindia.co.in/about"
      />
      <Navigation />

      <PageHero
        title="About Reboot India"
        subtitle="Reboot India is built for those who want to disconnect from noise and reconnect with nature through meaningful trekking experiences."
        eyebrow="Our Story"
        image="/images/treks/home-hero.png"
      />

      <section className="py-4 border-b border-white/10 bg-black/30">
        <div className="container mx-auto px-4 md:px-6 flex flex-wrap gap-2">
          {[
            ["Story", "#story"],
            ["Mission", "#mission"],
            ["Difference", "#difference"],
            ["Why Us", "#why-us"],
            ["Safety", "#safety"],
            ["Impact", "#impact"],
            ["Vision", "#vision"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-sm text-white/85 hover:bg-white/10 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      <section id="story" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">How It Started</h2>
          <p className="text-white/85 text-lg leading-relaxed mb-5">
            Reboot India began with a vision from our co-founder Neeraj, an experienced mountain
            guide with over 7 years of leading treks across the Himalayas. His dream was to create
            a platform where trekkers could go beyond commercial routes and experience the raw,
            untouched beauty of the mountains.
          </p>
          <p className="text-white/80 text-lg leading-relaxed mb-5">
            This vision came together with the operational and technology expertise of Pratibha and
            Rishi, who believed in building a platform that makes discovering and choosing authentic
            trekking experiences simple, safe, and meaningful.
          </p>
          <p className="text-white/80 text-lg leading-relaxed">
            Together, they built Reboot India to combine mountain expertise with smart planning and
            seamless experience.
          </p>
        </div>
      </section>

      <section className="py-16 border-y border-white/10 bg-black/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
              <div className="text-4xl font-serif">7+</div>
              <div className="text-white/75 mt-1">Years of Mountain Experience</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
              <div className="text-4xl font-serif">150+</div>
              <div className="text-white/75 mt-1">Treks Conducted</div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
              <div className="text-4xl font-serif">1000+</div>
              <div className="text-white/75 mt-1">Happy Trekkers</div>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">Our Mission</h2>
          <p className="text-white/85 text-lg leading-relaxed">
            To help people disconnect from the chaos of everyday life and reconnect with nature
            through safe, responsible, and meaningful trekking experiences.
          </p>
        </div>
      </section>

      <section id="difference" className="py-16 md:py-24 bg-black/20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <h2 className="font-serif text-3xl md:text-5xl mb-8">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {differentiators.map((item) => (
              <div key={item} className="rounded-xl border border-white/15 bg-white/5 p-4 text-white/85">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why-us" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <h2 className="font-serif text-3xl md:text-5xl mb-8">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chooseUs.map((item) => (
              <div key={item} className="rounded-xl border border-white/15 bg-white/5 p-4 text-white/85">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-black/20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                <card.icon size={28} className="text-white mb-3" />
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p className="text-sm text-white/75 mt-1">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="safety" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">Safety First, Always</h2>
          <p className="text-white/85 text-lg leading-relaxed">
            At Reboot India, safety is non-negotiable. Our trek leaders are trained in high-altitude
            safety, first aid, and emergency response. Every trek is planned with proper
            acclimatization, weather monitoring, and risk assessment to ensure a safe mountain
            experience.
          </p>
        </div>
      </section>

      <section id="impact" className="py-16 md:py-24 bg-black/20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">Supporting the Mountains</h2>
          <p className="text-white/85 text-lg leading-relaxed">
            We work closely with local communities, guides, and village partners to create livelihood
            opportunities and promote responsible tourism. Our goal is to explore the mountains while
            preserving their beauty for future generations.
          </p>
        </div>
      </section>

      <section id="vision" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <h2 className="font-serif text-3xl md:text-5xl mb-6">Our Vision</h2>
          <p className="text-white/85 text-lg leading-relaxed">
            To become a trusted platform for mindful adventure travel where people don’t just visit
            the mountains — they experience, respect, and reconnect with them.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-black/30 border-y border-white/10">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <img src="/images/treks/team-1.png" alt="Neeraj" className="w-full h-52 object-cover rounded-xl" />
              <h3 className="font-semibold mt-3">Neeraj</h3>
              <p className="text-sm text-white/75">Co-founder | Mountain guide</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <img src="/images/treks/team-2.png" alt="Pratibha" className="w-full h-52 object-cover rounded-xl" />
              <h3 className="font-semibold mt-3">Pratibha</h3>
              <p className="text-sm text-white/75">Co-founder | Operations</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <img src="/images/treks/team-3.svg" alt="Rishi" className="w-full h-52 object-cover rounded-xl" />
              <h3 className="font-semibold mt-3">Rishi</h3>
              <p className="text-sm text-white/75">Co-founder | Technology & growth</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <div className="text-sm uppercase tracking-wider text-white/60 mb-2">Call To Action</div>
          <h2 className="font-serif text-3xl md:text-5xl mb-4">Ready to reboot your mind?</h2>
          <Link href="/treks">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-maroon hover:bg-forest transition-colors cursor-pointer">
              <Compass size={18} />
              Explore Treks
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
