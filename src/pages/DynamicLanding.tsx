import { useParams } from 'react-router-dom';
import { SEO } from '@/components/common/SEO';
import { useSearchVehicles } from '@/features/vehicles/hooks/useVehicles';
import VehicleCard from '@/features/vehicles/components/VehicleCard';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Car, Bike } from 'lucide-react';
import { TbScooter } from 'react-icons/tb';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918011401900";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi GoPanda, please help me find rental availability for this category.")}`;

export default function DynamicLanding() {
  const { vehicleType, city, seoSlug } = useParams();

  let parsedVehicle = vehicleType || 'vehicles';
  let parsedCity = city || 'your area';

  if (seoSlug) {
    // Basic heuristic to extract intent from long-tail slugs like 'cheap-car-rental-guwahati-without-driver'
    parsedVehicle = seoSlug.replace(/-/g, ' ');
    if (seoSlug.toLowerCase().includes('guwahati')) {
      parsedCity = 'Guwahati';
      parsedVehicle = seoSlug.replace(/-/g, ' ').replace(/guwahati/i, '').trim();
    }
  }

  // Format params for display (e.g. 'car-hire' -> 'car hire')
  const formattedVehicle = parsedVehicle.replace(/-/g, ' ');
  const formattedCity = parsedCity.replace(/-/g, ' ');
  
  // Capitalize every word for headings
  const titleCase = (str: string) => {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const displayVehicle = titleCase(formattedVehicle);
  const displayCity = titleCase(formattedCity);

  // We can pass a generic search query to our hook based on the vehicle type
  // If the vehicleType includes 'car', search for cars. If it includes 'scooty' or 'bike', search for those.
  let apiType = 'all';
  const vTypeLower = formattedVehicle.toLowerCase();
  if (vTypeLower.includes('car')) apiType = 'car';
  else if (vTypeLower.includes('scooty') || vTypeLower.includes('scooter')) apiType = 'scooty';
  else if (vTypeLower.includes('bike') || vTypeLower.includes('motorcycle')) apiType = 'bike';

  const exactH1 = apiType === 'car'
    ? `Self Drive Car Rental in ${displayCity}`
    : apiType === 'bike'
      ? `Bike Rental in ${displayCity}`
      : apiType === 'scooty'
        ? `Scooty Rental in ${displayCity}`
        : '';

  // Compute canonical URL for this page — normalizes synonym slugs to canonical
  const canonicalSlug = apiType === 'all' ? 'vehicles' : apiType;
  const canonicalCity = parsedCity !== 'your area' ? parsedCity.toLowerCase().replace(/\s+/g, '-') : '';
  const canonicalUrl = canonicalCity
    ? `https://www.gopanda.in/rent/${canonicalSlug}/in/${canonicalCity}`
    : `https://www.gopanda.in/rent/${canonicalSlug}`;

  const params: Record<string, string> = { is_available: "true" };
  if (apiType !== 'all') params.vehicle_type = apiType;
  if (parsedCity && parsedCity !== 'your area') {
    params.q = parsedCity;
  }

  const { data, isLoading } = useSearchVehicles(params);
  const vehicles = Array.isArray(data) ? data : [];

  // Summarize only data returned by the API for this page.
  const totalVehicles = vehicles.length;
  const validPrices = vehicles
    .map((v) => Number(v.price_per_day))
    .filter((price) => Number.isFinite(price) && price > 0);
  const startingPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const introCopy = apiType === 'car'
    ? `Find self-drive car rentals in ${displayCity} from verified local rental shops. Check available cars, daily prices, and booking details before confirming your ride.`
    : apiType === 'bike'
      ? `Looking for bike rental in ${displayCity}? Find bikes from local rental shops, check availability, and book for short trips, daily travel, or city rides.`
      : apiType === 'scooty'
        ? `Rent a scooty in ${displayCity} for easy local travel, college commutes, shopping, or short city rides. Check available scooties from local rental shops and confirm your ride easily.`
        : '';
  const faqVehicle = apiType === 'all' ? formattedVehicle : apiType;
  const faqs = [
    {
      question: `How can I book a ${faqVehicle} rental in ${displayCity}?`,
      answer: 'Choose a vehicle, check the price and availability, then follow the booking steps shown on GoPanda.',
    },
    {
      question: `What documents are needed to rent a ${faqVehicle} in ${displayCity}?`,
      answer: 'Most rental shops require a valid driving licence and an ID proof. Some shops may also ask for a refundable security deposit.',
    },
    {
      question: 'Are the prices shown daily rental prices?',
      answer: 'Most prices are shown as daily rental prices. Final pricing may depend on duration, vehicle type, availability, and shop policy.',
    },
    {
      question: 'Can I contact the rental shop before booking?',
      answer: 'Yes. You can contact the shop to confirm pickup time, documents, and other booking details.',
    },
  ];

  // Hyper-Local Context Dictionary
  const LOCAL_CONTEXT: Record<string, string> = {
    'guwahati': 'Popular pickup points include Lokpriya Gopinath Bordoloi International Airport, Kamakhya Railway Station, and routes heading toward Shillong and Kaziranga.',
    'jorhat': 'Conveniently located for trips to Majuli and Kaziranga, with easy pickups near Rowriah Airport and Jorhat Town Railway Station.',
    'dibrugarh': 'Start your Upper Assam journey here. Local shops offer quick handovers near Mohanbari Airport and Dibrugarh Railway Station.',
    'tezpur': 'The perfect starting point for your Arunachal Pradesh or Tawang expedition. Pick up near Tezpur Airport or the main transport nodes.',
  };
  const localContextText = LOCAL_CONTEXT[parsedCity.toLowerCase()] || 'Explore the local area with convenient pickups from local rental shops in your neighborhood.';

  // Generate Schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Rent ${displayVehicle} in ${displayCity}`,
    description: `Find ${formattedVehicle} rentals in ${formattedCity} from verified local shops.`,
    url: typeof window !== 'undefined' ? window.location.href : 'https://www.gopanda.in',
    mainEntity: {
      '@type': 'ItemList',
      name: `${displayVehicle} Rentals`,
      itemListElement: vehicles.map((v, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: `${v.name} ${v.model || ''}`.trim(),
          description: v.description || `Rent a ${v.name} in ${displayCity}`,
          brand: {
            '@type': 'Brand',
            name: v.name?.split(' ')[0] || 'Vehicle'
          },
          image: v.image_url ? (v.image_url.startsWith('http') ? v.image_url : `https://api.gopanda.in${v.image_url}`) : 'https://www.gopanda.in/og-image-1.png',
          offers: {
            '@type': 'Offer',
            price: v.price_per_day || 0,
            priceCurrency: 'INR',
            availability: v.is_available !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: typeof window !== 'undefined' ? `${window.location.origin}/bikes/${v.id}` : `https://www.gopanda.in/bikes/${v.id}`
          }
        }
      }))
    }
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  const schema = JSON.stringify([collectionPageSchema, faqSchema]);

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <SEO 
        title={`Rent ${displayVehicle} in ${displayCity} — from local shops | GoPanda`}
        description={`Find ${displayVehicle} rentals in ${displayCity} from verified local shops. Pay a small token and pick up your ride. Transparent local-shop pricing. No surprise charges from GoPanda.`}
        keywords={`${formattedVehicle} rental in ${formattedCity}, ${formattedCity} ${formattedVehicle} rental, ${formattedCity} ${formattedVehicle} rent, self drive ${formattedVehicle} rental in ${formattedCity}, rent ${formattedVehicle} in ${formattedCity}, ${formattedVehicle} rental near me`}
        canonical={canonicalUrl}
        url={canonicalUrl}
        schema={schema}
        noindex={!isLoading && vehicles.length === 0}
      />
      
      <div className="container px-4 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-display uppercase tracking-[0.2em] text-muted-foreground">
            Local rentals. Verified shops. Easy booking.
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            {exactH1 || <>Rent a <span className="text-primary">{displayVehicle}</span> in {displayCity}</>}
          </h1>
          <p className="text-lg text-muted-foreground">
            {introCopy || (totalVehicles > 0
              ? `${displayVehicle}s from local rental shops in ${displayCity}${startingPrice ? `, starting at ₹${startingPrice}/day` : ""}.`
              : `${displayVehicle}s from real shops in ${displayCity}. See what's available, lock it with a token, pick it up.`)}
          </p>
          <p className="text-sm text-muted-foreground">
            Built in Assam. Starting with Guwahati. Expanding across Northeast India.
          </p>
          <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border text-left max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Local pickup context for {displayCity}: </span>
              {localContextText}
            </p>
          </div>
        </div>

        {/* Vehicles Grid */}
        <div className="mt-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-white h-72 animate-pulse" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-6">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Search className="h-10 w-10 text-primary/50" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold">No exact matches found right now</h2>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  We are onboarding more {formattedVehicle} options in {formattedCity}. Need help choosing a vehicle? Chat with GoPanda on WhatsApp.
                </p>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1ebe5d]"
              >
                <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp GoPanda
              </a>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <VehicleCard vehicle={v} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <section className="mt-12 max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm md:text-base font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── ON-PAGE TEXT DEPTH FOR SEO ─── */}
        <div className="mt-20 max-w-4xl mx-auto prose prose-slate">
          <h2 className="font-display text-2xl font-bold mb-4">About {displayVehicle} Rentals in {displayCity}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Exploring {displayCity} is best done at your own pace. With GoPanda, finding a reliable {formattedVehicle} rental is simple. We work with local shops so you can compare transparent pricing, vehicle details, and pickup information before booking.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Whether you need a ride for daily commutes, a weekend getaway, or a long road trip, you can pay a small booking token to lock your dates and settle the rest directly with the shop owner. Transparent local-shop pricing. No surprise charges from GoPanda.
          </p>
        </div>

        {/* ─── CROSS-LINKS FOR SEO ─── */}
        <div className="mt-16 max-w-4xl mx-auto">
          {/* Other vehicle types in the same city */}
          {parsedCity !== 'your area' && (
            <div className="mb-8">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                Also available in {displayCity}
              </h3>
              <div className="flex flex-wrap gap-2">
                {['car', 'bike', 'scooty'].filter(t => t !== apiType).map(t => (
                  <a
                    key={t}
                    href={`/rent/${t}/in/${parsedCity.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {t === 'car' ? <Car className="w-4 h-4" /> : t === 'scooty' ? <TbScooter className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                    <span>{t.charAt(0).toUpperCase() + t.slice(1)} rental in {displayCity}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Same vehicle type in other cities */}
          <div className="mb-8">
            <h3 className="font-display text-lg font-bold text-foreground mb-3">
              {displayVehicle} rentals in other cities
            </h3>
            <div className="flex flex-wrap gap-2">
              {['guwahati', 'jorhat', 'dibrugarh', 'tezpur', 'silchar', 'shillong']
                .filter(c => c !== parsedCity.toLowerCase())
                .map(c => (
                  <a
                    key={c}
                    href={`/rent/${apiType === 'all' ? 'car' : apiType}/in/${c}`}
                    className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {displayVehicle} rental in {c.charAt(0).toUpperCase() + c.slice(1)}
                  </a>
                ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-3 text-sm">
            <a href="/search-vehicles" className="text-primary hover:underline font-medium">Search all vehicles →</a>
            <a href="/shops" className="text-primary hover:underline font-medium">Browse rental shops →</a>
          </div>
        </div>
      </div>
    </main>
  );
}
