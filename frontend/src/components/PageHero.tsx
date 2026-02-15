type PageHeroProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  image?: string;
  className?: string;
};

const DEFAULT_HERO_IMAGE = "/images/treks/home-hero.png";

export function PageHero({ title, subtitle, eyebrow, image, className = "" }: PageHeroProps) {
  return (
    <section className={`relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-24 ${className}`}>
      <div className="absolute inset-0">
        <img
          src={image || DEFAULT_HERO_IMAGE}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/75" />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center text-white">
        {eyebrow ? (
          <span className="inline-block py-1 px-3 rounded-full border border-white/30 bg-white/10 text-xs font-semibold uppercase tracking-wider mb-4">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">{title}</h1>
        {subtitle ? <p className="text-white/85 max-w-3xl mx-auto text-lg">{subtitle}</p> : null}
      </div>
    </section>
  );
}
