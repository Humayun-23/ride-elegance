import { Link } from "react-router-dom";
import { MapPin, Store, ArrowRight, Bike, Car, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { getShop } from "@/features/shops/services/shopService";

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

const TYPE_ICON: Record<string, any> = {
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

  const displayShopName = vehicle.shop_name || fetchedShopName || "Partner Shop";

  return (
    <Link to={href ?? `/bikes/${vehicle.id}`} className="group block h-full">
      <div className="overflow-hidden rounded-3xl card-elevated h-full flex flex-col relative z-10">
        {/* Image — bigger, cleaner */}
        <div className={`${compact ? "aspect-[16/9]" : "aspect-[3/2]"} bg-muted relative overflow-hidden`}>
          {vehicle.image_url ? (
            <img
              src={getOptimizedImageUrl(vehicle.image_url)}
              alt={`Rent ${vehicle.name} ${vehicle.model || ''}`.trim() + ` in ${vehicle.location || 'Guwahati'}`}
              loading={priority ? "eager" : "lazy"}
              fetchpriority={priority ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-background">
              {(() => {
                const Icon = TYPE_ICON[vehicle.bike_type || ""] || Car;
                return <Icon className="h-16 w-16 opacity-25" />;
              })()}
            </div>
          )}

          {/* Type badge — top left */}
          {!hideTypeBadge && vehicle.bike_type && (
            <Badge className="absolute top-2.5 left-2.5 bg-white/80 backdrop-blur-md text-foreground font-display text-[10px] uppercase tracking-wider border border-white/40 shadow-sm transition-transform group-hover:scale-105 flex items-center gap-1.5 px-2 py-1">
              {(() => {
                const Icon = TYPE_ICON[vehicle.bike_type];
                return Icon ? <Icon className="h-3.5 w-3.5" /> : null;
              })()}
              <span>{TYPE_LABEL[vehicle.bike_type] || vehicle.bike_type}</span>
            </Badge>
          )}

          {/* Unavailable overlay */}
          {vehicle.is_available === false && (
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="font-display text-xs">Unavailable</Badge>
            </div>
          )}

          {/* Price overlay — bottom right of image */}
          {!hidePrice && vehicle.price_per_day != null && (
            <div className="absolute bottom-2.5 right-2.5 bg-background/90 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1 shadow-glow transition-transform group-hover:scale-105">
              <span className="text-foreground font-display font-extrabold text-sm text-gradient-warm">₹{vehicle.price_per_day}</span>
              <span className="text-muted-foreground text-[10px] ml-0.5 font-bold">/day</span>
            </div>
          )}
        </div>

        {/* Content — streamlined */}
        <div className={`${compact ? "px-3 py-2.5" : "p-4"} flex-1 flex flex-col gap-2`}>
          {/* Title */}
          <div className="min-w-0">
            <h3 className={`font-display font-bold text-foreground ${compact ? "text-sm" : "text-lg"} leading-tight group-hover:text-primary transition-colors truncate`}>
              {vehicle.name}
            </h3>
            {vehicle.model && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{vehicle.model}</p>
            )}
          </div>

          {/* Shop name — simple and clean */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="h-3 w-3 shrink-0" />
            <span className="truncate">{displayShopName}</span>
          </div>

          {vehicle.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{vehicle.location}</span>
            </div>
          )}

          {/* Footer: custom text or CTA */}
          {footerText ? (
            <div className="pt-2 border-t border-border mt-auto">
              <span className="text-primary font-display text-sm">{footerText}</span>
            </div>
          ) : (
            <div className="pt-2 mt-auto">
              <div className="flex items-center justify-between">
                {!hidePrice && (
                  <div>
                    {vehicle.price_per_day != null ? (
                      <span className="text-xs text-muted-foreground">from <strong className="text-foreground">₹{vehicle.price_per_day}</strong>/day</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Contact for price</span>
                    )}
                  </div>
                )}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Check Availability <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
