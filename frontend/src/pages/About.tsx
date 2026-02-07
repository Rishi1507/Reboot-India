import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <div className="min-h-screen bg-offwhite text-charcoal">
      <Helmet>
        <link rel="canonical" href="https://rebootindia.co.in/about" />
        <link rel="canonical" href="https://rebootindia.co.in/about" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Reboot India",
            url: "https://rebootindia.co.in/",
            logo: "https://rebootindia.co.in/og/logo.png",
          })}
        </script>
        <title>About Reboot India | Beyond Trails. An Experience You Feel.</title>
        <meta
          name="description"
          content="Reboot India designs and leads Himalayan trekking experiences across Uttarakhand and Himachal Pradesh — beyond trails, into connection, culture, and meaning."
        />
      </Helmet>

      <Navigation />

      {/* HERO */}
      <section className="relative pt-32 pb-28 bg-forest text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/about/hero-himalayas.jpg"
            alt="Himalayan trekking with Reboot India"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 max-w-4xl text-center">
          <span className="uppercase tracking-widest text-sm text-white/70">
            About Reboot India
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mt-4 mb-6">
            Beyond Trails. <br /> An Experience You Feel.
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed">
            Trekking is not just about reaching a summit — it’s about reconnecting.
            <br />
            With the mountains. With people. And with yourself.
          </p>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-24 container mx-auto px-6 max-w-4xl">
        <p className="text-xl leading-relaxed text-gray-700 mb-6">
          We design and lead Himalayan trekking experiences across
          <strong> Uttarakhand</strong> and <strong>Himachal Pradesh</strong>,
          focusing on depth over distance.
        </p>
        <p className="text-xl leading-relaxed text-gray-700">
          From well-known trails to remote, lesser-explored routes — name a
          Himalayan trek, and we can make it happen. Every journey is thoughtfully
          crafted to balance adventure, safety, and cultural immersion, ensuring
          the experience feels meaningful rather than rushed.
        </p>
      </section>

      {/* WHAT MAKES US DIFFERENT */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-center mb-20">
            What Makes Us Different
          </h2>

          <div className="grid md:grid-cols-2 gap-16">
            {/* Beyond Trails */}
            <div>
              <h3 className="font-serif text-2xl font-bold mb-4">
                🌿 Beyond Trails
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                For us, the Himalayas are not just to be seen — they are meant to
                be felt.
              </p>

              <ul className="space-y-4 text-lg text-gray-700">
                <li>
                  ✔ Cozy homestays, scenic camps, and authentic village stays
                  that offer comfort along with a true Himalayan camp experience
                </li>
                <li>
                  ✔ Fully equipped gear support for snow-covered and
                  high-altitude trails
                </li>
                <li>
                  ✔ Gear rental options if you don’t have specialized equipment
                </li>
                <li>
                  ✔ Certified and experienced trek leaders registered with the
                  Forest Department
                </li>
              </ul>

              <p className="text-lg text-gray-700 leading-relaxed mt-6">
                This is how we create experiences that feel immersive, supported,
                and deeply connected to the mountains.
              </p>
            </div>

            {/* Image Block */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="/images/about/village.jpg"
                alt="Himalayan village stay"
                className="rounded-2xl object-cover h-56"
              />
              <img
                src="/images/about/camp.jpg"
                alt="High altitude campsite"
                className="rounded-2xl object-cover h-56"
              />
              <img
                src="/images/about/snow.jpg"
                alt="Snow trekking experience"
                className="rounded-2xl object-cover h-56 col-span-2"
              />
            </div>
          </div>
        </div>
      </section>

      {/* EXPERTISE & GROUPS */}
      <section className="py-24 container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">
              🏔️ High-Altitude Expertise
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              We specialize in high-altitude trekking, with itineraries designed
              around proper acclimatization, gradual ascent, and realistic pacing
              — ensuring the challenge remains rewarding, not risky.
            </p>
          </div>

          <div>
            <h3 className="font-serif text-2xl font-bold mb-4">
              🧗 Small Groups. Personal Experiences.
            </h3>
            <ul className="space-y-3 text-lg text-gray-700">
              <li>✔ Enhanced safety and control</li>
              <li>✔ Personal attention from trek leaders</li>
              <li>✔ Strong group bonding</li>
              <li>✔ Minimal environmental impact</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CUSTOM TREKS */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="font-serif text-4xl font-bold mb-8 text-center">
            Customized Trek Experiences
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
            No two trekkers are the same — and neither should their journeys be.
          </p>

          <ul className="space-y-4 text-lg text-gray-700 max-w-3xl mx-auto">
            <li>✔ Fitness and experience level</li>
            <li>✔ Time availability</li>
            <li>✔ Altitude comfort</li>
            <li>✔ Trek goals — adventure, exploration, culture, or solitude</li>
          </ul>

          <p className="text-lg text-gray-700 leading-relaxed mt-8 text-center">
            Whether it’s a classic route or a completely bespoke expedition, we
            tailor every detail to suit you.
          </p>
        </div>
      </section>

      {/* PRE-REQUISITES */}
      <section className="py-24 container mx-auto px-6 max-w-4xl">
        <h2 className="font-serif text-4xl font-bold mb-10 text-center">
          Pre-Requisites Before You Trek
        </h2>

        <ul className="space-y-4 text-lg text-gray-700 leading-relaxed">
          <li>✔ Fitness benchmarks and training guidance</li>
          <li>✔ Altitude awareness and acclimatization planning</li>
          <li>✔ Detailed gear and packing lists</li>
          <li>✔ Weather and terrain expectations</li>
        </ul>

        <p className="text-lg text-gray-700 leading-relaxed mt-8">
          So you begin the journey informed, confident, and prepared.
        </p>
      </section>

      {/* SAFETY */}
      <section className="bg-forest text-white py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">
            Safety Is Non-Negotiable
          </h2>

          <ul className="space-y-4 text-lg text-white/85">
            <li>✔ Experienced mountain leaders</li>
            <li>✔ First-aid and emergency readiness</li>
            <li>✔ Quality equipment</li>
            <li>✔ Continuous on-ground assessment</li>
          </ul>

          <p className="text-lg text-white/85 leading-relaxed mt-8">
            Your safety is our highest priority — always.
          </p>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="py-24 container mx-auto px-6 max-w-4xl">
        <h2 className="font-serif text-4xl font-bold mb-8 text-center">
          Transparency. Always.
        </h2>

        <ul className="space-y-4 text-lg text-gray-700">
          <li>✔ Trek difficulty and challenges</li>
          <li>✔ Route conditions and weather realities</li>
          <li>✔ Inclusions, exclusions, and costs</li>
          <li>✔ What the experience truly involves</li>
        </ul>

        <p className="text-lg text-gray-700 leading-relaxed mt-8 text-center">
          No hidden surprises. No false promises.
        </p>
      </section>

      {/* PHILOSOPHY */}
      <section className="bg-offwhite py-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">
            Our Philosophy
          </h2>
          <p className="text-xl italic text-gray-700 mb-6">
            “The mountains don’t rush — and neither do we.”
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            We practice responsible trekking, work closely with local communities,
            and respect fragile Himalayan ecosystems — ensuring every journey
            leaves a positive impact.
          </p>
        </div>
      </section>

      {/* CLOSING */}
      <section className="py-24 container mx-auto px-6 max-w-4xl text-center">
        <h2 className="font-serif text-4xl font-bold mb-6">
          Reboot India
        </h2>
        <p className="text-xl mb-6">
          Beyond Trails. An Experience You Feel.
        </p>
        <p className="text-lg text-gray-700">
          If you can dream it in the Himalayas,
          <br />
          we’ll help you experience it.
        </p>
      </section>

      <Footer />
    </div>
  );
}
