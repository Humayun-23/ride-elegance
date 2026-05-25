import { useParams } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { useSearchVehicles } from '@/hooks/useVehicles';
import VehicleCard from '@/components/VehicleCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function DynamicLanding() {
  const { vehicleType, city } = useParams();

  // Format params for display (e.g. 'car-hire' -> 'car hire')
  const formattedVehicle = (vehicleType || 'vehicles').replace(/-/g, ' ');
  const formattedCity = (city || 'your area').replace(/-/g, ' ');
  
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

  const params: Record<string, string> = { is_available: "true" };
  if (apiType !== 'all') params.vehicle_type = apiType;

  const { data, isLoading } = useSearchVehicles(params);
  const vehicles = Array.isArray(data) ? data : [];

  return (
    <main className="min-h-screen pt-24 pb-16 bg-slate-50">
      <SEO 
        title={`Best ${displayVehicle} in ${displayCity} | GoPanda`}
        description={`Looking for the best ${formattedVehicle} in ${formattedCity}? GoPanda offers premium ${formattedVehicle} rentals near you. Book instantly with zero deposit!`}
        keywords={`${formattedVehicle} in ${formattedCity}, rent ${formattedVehicle} ${formattedCity}, ${formattedVehicle} rental near me`}
      />
      
      <div className="container px-4 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-display uppercase tracking-[0.3em] text-primary">Instant Booking Available</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
            Rent a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">{displayVehicle}</span> in {displayCity}
          </h1>
          <p className="text-lg text-slate-600">
            Browse our top-rated selection of {formattedVehicle}s available for rent in {formattedCity}. Transparent pricing, verified local shops, and instant confirmation.
          </p>
        </div>

        {/* Vehicles Grid */}
        <div className="mt-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white h-72 animate-pulse" />
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
