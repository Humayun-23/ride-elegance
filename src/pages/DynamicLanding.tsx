import { useParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { useSearchVehicles } from '@/hooks/useVehicles';
import VehicleCard from '@/components/VehicleCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

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

  // Calculate Live Inventory and Pricing
  const totalVehicles = vehicles.length;
  const avgPrice = totalVehicles > 0 
    ? Math.round(vehicles.reduce((sum, v) => sum + (Number(v.price_per_day) || 0), 0) / totalVehicles) 
    : 0;
  const startingPrice = totalVehicles > 0 
    ? Math.min(...vehicles.map(v => Number(v.price_per_day) || Infinity)) 
    : 0;

  // Hyper-Local Context Dictionary
  const LOCAL_CONTEXT: Record<string, string> = {
    'guwahati': 'Popular pickup points include Lokpriya Gopinath Bordoloi International Airport, Kamakhya Railway Station, and routes heading toward Shillong and Kaziranga.',
    'jorhat': 'Conveniently located for trips to Majuli and Kaziranga, with easy pickups near Rowriah Airport and Jorhat Town Railway Station.',
    'dibrugarh': 'Start your Upper Assam journey here. Local shops offer quick handovers near Mohanbari Airport and Dibrugarh Railway Station.',
    'tezpur': 'The perfect starting point for your Arunachal Pradesh or Tawang expedition. Pick up near Tezpur Airport or the main transport nodes.',
  };
  const localContextText = LOCAL_CONTEXT[parsedCity.toLowerCase()] || 'Explore the local area with convenient pickups from top-rated shops right in your neighborhood.';

  // Generate Schema
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Rent ${displayVehicle} in ${displayCity}`,
    description: `Find ${formattedVehicle} rentals in ${formattedCity} from verified local shops.`,
    url: typeof window !== 'undefined' ? window.location.href : 'https://www.gopanda.in',
    mainEntity: {
      '@type': 'OfferCatalog',
      name: `${displayVehicle} Rentals`,
      itemListElement: vehicles.map((v, index) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Product',
          name: `${v.year || ''} ${v.make} ${v.model}`.trim(),
          image: (v.images && v.images.length > 0) ? v.images[0] : 'https://www.gopanda.in/og-image.png'
        },
        price: v.price_per_day,
        priceCurrency: 'INR',
        url: typeof window !== 'undefined' ? `${window.location.origin}/bikes/${v.id}` : `https://www.gopanda.in/bikes/${v.id}`,
        position: index + 1
      }))
    }
  });

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <SEO 
        title={`Rent ${displayVehicle} in ${displayCity} — from local shops | GoPanda`}
        description={`Find ${formattedVehicle} rentals in ${formattedCity} from verified local shops. Pay a small token, pick up your ride. No middlemen, no hidden fees.`}
        keywords={`${formattedVehicle} in ${formattedCity}, rent ${formattedVehicle} ${formattedCity}, ${formattedVehicle} rental near me`}
        canonical={canonicalUrl}
        url={canonicalUrl}
        schema={schema}
      />
      
      <div className="container px-4 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-display uppercase tracking-[0.2em] text-muted-foreground">Available now</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Rent a <span className="text-primary">{displayVehicle}</span> in {displayCity}
          </h1>
          <p className="text-lg text-muted-foreground">
            {totalVehicles > 0 
              ? `${totalVehicles} ${formattedVehicle}s available right now in ${formattedCity}. Prices starting at ₹${startingPrice}/day, averaging ₹${avgPrice}/day.`
              : `${formattedVehicle}s from real shops in ${formattedCity}. See what's available, lock it with a token, pick it up.`}
          </p>
          <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border text-left max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">📍 Local Tip for {displayCity}: </span>
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
                <p className="text-muted-foreground text-sm max-w-md mx-auto">We might be sold out of {formattedVehicle}s in {formattedCity}. Check out our other vehicles available for rent!</p>
              </div>
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
      </div>
    </main>
  );
}
