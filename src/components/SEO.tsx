import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  type?: string;
  name?: string;
  url?: string;
  image?: string;
  schema?: string;
  noindex?: boolean;
}

export function SEO({
  title = 'GoPanda — Best Bike Rental Platform Near You',
  description = 'Looking for the best bike rentals near you? GoPanda offers premium and affordable two-wheelers. Book your ideal ride today and explore the city with ease!',
  keywords = 'bike rental near me, car rental guwahati, scooty rental, vehicle rental in guwahati, self drive car rental guwahati',
  canonical,
  type = 'website',
  name = 'GoPanda',
  url = 'https://www.gopanda.in',
  image = 'https://www.gopanda.in/og-image.png',
  schema,
  noindex = false,
}: SEOProps) {
  // Canonical: use explicit prop if given, else derive from current path
  const canonicalUrl = canonical
    ? canonical
    : typeof window !== 'undefined'
      ? window.location.origin + window.location.pathname.replace(/\/+$/, '').toLowerCase()
      : url;

  // og:url should match canonical for consistency
  const ogUrl = canonicalUrl;

  // Default Schema for GoPanda (WebApplication & Organization)
  const defaultSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://www.gopanda.in/#application',
        'url': 'https://www.gopanda.in',
        'name': 'GoPanda',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'description': 'An online marketplace connecting customers with verified local vehicle rental shops in Assam.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'INR'
        }
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.gopanda.in/#organization',
        'name': 'GoPanda',
        'url': 'https://www.gopanda.in',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://www.gopanda.in/og-image.png'
        },
        'description': 'GoPanda is a digital marketplace platform connecting travelers and locals with rental bikes, scooties, and cars from verified local shops in Guwahati and Assam.',
        'sameAs': [
          'https://www.instagram.com/gopanda.in'
        ]
      }
    ]
  });

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* End standard metadata tags */}
      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={ogUrl} />
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
