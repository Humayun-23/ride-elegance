import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  type?: string;
  name?: string;
  url?: string;
  image?: string;
  schema?: string;
}

export function SEO({
  title = 'GoPanda — Best Bike Rental Platform Near You',
  description = 'Looking for the best bike rentals near you? GoPanda offers premium and affordable two-wheelers. Book your ideal ride today and explore the city with ease!',
  type = 'website',
  name = 'GoPanda',
  url = 'https://www.gopanda.in',
  image = 'https://www.gopanda.in/og-image.png',
  schema,
}: SEOProps) {
  // Default Schema for GoPanda (LocalBusiness)
  const defaultSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'GoPanda Bike and Car Rental Marketplace',
    image: image,
    description: description,
    '@id': url,
    url: url,
    telephone: '+918638578854',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guwahati',
      addressRegion: 'Assam',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 26.1445,
      longitude: 91.7362,
    },
    sameAs: [
      "https://www.instagram.com/gopanda.in",
    ],
  });

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="bike rentals near me, car rentals near me, bike rental near me, scooty rental, vehicle rental near me" />

      {/* End standard metadata tags */}
      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={name} />
      <meta property="og:image" content={image} />
      {/* End Facebook tags */}

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {/* End Twitter tags */}

      {/* Structured Data */}
      <script type="application/ld+json">
        {schema || defaultSchema}
      </script>
    </Helmet>
  );
}
