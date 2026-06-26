import { Link } from "react-router-dom";
import { Store, ArrowRight, Bike, Car, Zap, CheckCircle, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { getShop } from "@/features/shops/services/shopService";
import { useFavorites } from "@/features/vehicles/context/FavoritesContext";

interface VehicleCardProps {
  vehicle: {
    id: string | number;
    name: string;
    model?: string;
    bike_type?: string;
    engine_cc?: number;
    //price_per_hour?: number;
    price_per_day?: number;
    image_url?: string;
    location?: string;
    shop_name?: string;
    shop_id?: number | string;
    condition?: string;
    is_available?: boolean;
    description?: string;
  };
  href?: string;
  hideTypeBadge?: boolean;
  hidePrice?: boolean;
  footerText?: string;
  compact?: boolean;
  priority?: boolean;
}

const TYPE_ICON: Record<string, LucideIcon> = {
  scooty: Bike,
  bike: Bike,
  car: Car,
  mountain: Bike,
  road: Bike,
  hybrid: Zap,
  electric: Zap,
  shop: Store,
};

const TYPE_LABEL: Record<string, string> = {
  scooty: "Scooty",
  bike: "Bike",
  car: "Car",
  mountain: "Mountain",
  road: "Road",
  hybrid: "Hybrid",
  electric: "Electric",
};

export default function VehicleCard({
  vehicle,
  href,
  hideTypeBadge = false,
  hidePrice = false,
  footerText,
  compact = false,
  priority = false,
}: VehicleCardProps) {
  // Use React Query for caching and deduping shop requests
  const { data: fetchedShopName } = useQuery({
    queryKey: ["shop", vehicle.shop_id],
    queryFn: async () => {
      const res = await getShop(vehicle.shop_id);
      return res.data?.name || "Partner Shop";
    },
    enabled: !vehicle.shop_name && !!vehicle.shop_id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const isSaved = isFavorite(vehicle.id);

  const displayShopName = vehicle.shop_name || fetchedShopName || "Partner Shop";
  const displayName = vehicle.name || "Rental Vehicle";
  const displayModel = vehicle.model || vehicle.description || "Available for rent";
  const imageAlt = `Rent ${displayName} ${vehicle.model || ""}`.trim() + ` in ${vehicle.location || "Guwahati"}`;
  const optimizedImageUrl = vehicle.image_url ? getOptimizedImageUrl(vehicle.image_url) : "";
  const TypeIcon = TYPE_ICON[vehicle.bike_type || ""] || Car;
  const typeLabel = vehicle.bike_type ? TYPE_LABEL[vehicle.bike_type] || vehicle.bike_type : "Vehicle";

  const searchParams = new URLSearchParams(window.location.search);
  const pickupDate = searchParams.get("pickup_date");
  const returnDate = searchParams.get("return_date");
  const linkParams = new URLSearchParams();
  if (pickupDate) linkParams.append("pickup_date", pickupDate);
  if (returnDate) linkParams.append("return_date", returnDate);
  
  const targetHref = href ?? `/bikes/${vehicle.id}${linkParams.toString() ? `?${linkParams.toString()}` : ""}`;

  return (
    <Link to={targetHref} className="group block h-full">
      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {optimizedImageUrl ? (
            <>
              <img
                src={optimizedImageUrl}
                alt=""
                aria-hidden="true"
                loading={priority ? "eager" : "lazy"}
                fetchpriority={priority ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-2xl"
              />
              <img
                src={optimizedImageUrl}
                alt={imageAlt}
                loading={priority ? "eager" : "lazy"}
                fetchpriority={priority ? "high" : "auto"}
                decoding="async"
                className="relative z-10 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-white">
              <TypeIcon className="h-16 w-16 text-gray-300" aria-hidden="true" />
            </div>
          )}

          {!hideTypeBadge && (
            <Badge className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-normal text-gray-700 shadow-sm backdrop-blur hover:bg-white">
              <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{typeLabel}</span>
            </Badge>
          )}

          {vehicle.is_available === false && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-950/35 backdrop-blur-sm">
              <Badge variant="destructive" className="font-display text-xs">Unavailable</Badge>
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(vehicle.id);
            }}
            className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm backdrop-blur transition hover:scale-110 hover:bg-white"
            aria-label={isSaved ? "Remove from saved" : "Save for later"}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-700"}`} aria-hidden="true" />
          </button>

          {!hidePrice && vehicle.price_per_day != null && (
            <div className="absolute bottom-4 right-4 z-20 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-orange-500 shadow-md">
              ₹{vehicle.price_per_day}
              <span className="ml-0.5 text-xs font-semibold text-gray-500">/day</span>
            </div>
          )}
        </div>

        <div className={`${compact ? "p-4" : "p-5"} flex flex-1 flex-col`}>
          <div className="min-w-0">
            <h3 className={`truncate font-display font-bold text-gray-950 ${compact ? "text-base" : "text-xl"} leading-tight transition-colors group-hover:text-primary`}>
              {displayName}
            </h3>
            <p className="mt-1 truncate text-sm text-gray-500">{displayModel}</p>
          </div>

          <div className="mt-4 flex min-w-0 items-center gap-2 text-sm text-gray-600">
            <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{displayShopName}</span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
              <CheckCircle className="h-3 w-3" aria-hidden="true" />
              Verified
            </span>
          </div>

          {footerText ? (
            <div className="mt-auto pt-5">
              <span className="font-display text-sm font-semibold text-primary">{footerText}</span>
            </div>
          ) : (
            <div className="mt-auto pt-5">
              <div className="flex items-center justify-between gap-3">
                {!hidePrice && (
                  <p className="min-w-0 text-sm text-gray-500">
                    {vehicle.price_per_day != null ? (
                      <>
                        from <strong className="font-bold text-gray-950">₹{vehicle.price_per_day}</strong>/day
                      </>
                    ) : (
                      "Contact for price"
                    )}
                  </p>
                )}
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-500 transition hover:text-emerald-600 group-hover:text-emerald-600">
                  Check Availability <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
