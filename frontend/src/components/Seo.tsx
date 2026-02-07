import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  type?: "website" | "article";
  structuredData?: object[];
};

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Reboot India",
  url: "https://rebootindia.co.in/",
  logo: "https://rebootindia.co.in/og/logo.png",
  sameAs: [
    "https://www.instagram.com/",
    "https://www.facebook.com/",
    "https://twitter.com/",
  ],
};

export function Seo({
  title,
  description,
  canonical,
  image,
  type = "website",
  structuredData = [],
}: SeoProps) {
  const jsonLd = [ORG_SCHEMA, ...structuredData];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta property="og:url" content={canonical} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}

      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
}
