import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "@/features/vehicles/context/FavoritesContext";
import { useSearchVehicles } from "@/features/vehicles/hooks/useVehicles";
import VehicleCard from "@/features/vehicles/components/VehicleCard";
import { SEO } from "@/components/common/SEO";
import { Heart, ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/common/LoadingState";

export default function SavedVehicles() {
  const { favorites } = useFavorites();
  const { data: allVehicles, isLoading } = useSearchVehicles({ limit: 500 });
  
  const savedVehicles = useMemo(() => {
    if (!allVehicles || !Array.isArray(allVehicles)) return [];
    return allVehicles.filter(v => favorites.includes(String(v.id)));
  }, [allVehicles, favorites]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background font-body">
      <SEO title="Saved Vehicles | GoPanda" noindex={true} />
      
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/search-vehicles" className="p-2 -ml-2 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-3">
            Saved Vehicles
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          </h1>
        </div>

        {savedVehicles.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-border/50 max-w-2xl mx-auto mt-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">No saved vehicles yet</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Tap the heart icon on any vehicle card to save it here for later comparison.
            </p>
            <Button asChild className="rounded-xl font-display font-semibold">
              <Link to="/search-vehicles">
                <Car className="mr-2 h-4 w-4" /> Browse Vehicles
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {savedVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
