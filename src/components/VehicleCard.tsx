import { Link } from "react-router-dom";
import { Star, Store, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

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
    rating?: number;
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

const TYPE_EMOJI: Record<string, string> = {
  scooty: "🛵",
  bike: "🏍️",
  car: "🚗",
  mountain: "🚵",
  road: "🚴",
  hybrid: "⚡",
  electric: "🔋",
  shop: "🏪",
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
      const res = await api.get(`/shops/${vehicle.shop_id}`);
      return res.data?.name || "Partner Shop";
    },
    enabled: !vehicle.shop_name && !!vehicle.shop_id,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const displayShopName = vehicle.shop_name || fetchedShopName || "Partner Shop";

  return (
    <Link to={href ?? `/bikes/${vehicle.id}`} className="group block h-full">
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 h-full flex flex-col">
        {/* Image — bigger, cleaner */}
        <div className={`${compact ? "aspect-[16/9]" : "aspect-[3/2]"} bg-muted relative overflow-hidden`}>
          {vehicle.image_url ? (
            <img
              src={getOptimizedImageUrl(vehicle.image_url)}
              alt={vehicle.name}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-background">
              <span className="text-5xl opacity-25">
                {TYPE_EMOJI[vehicle.bike_type || ""] || "🚗"}
              </span>
            </div>
          )}

          {/* Type badge — top left */}
          {!hideTypeBadge && vehicle.bike_type && (
            <Badge className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-foreground font-display text-[10px] uppercase tracking-wider border-0 shadow-sm">
              {TYPE_EMOJI[vehicle.bike_type] || ""} {TYPE_LABEL[vehicle.bike_type] || vehicle.bike_type}
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
            <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
              <span className="text-foreground font-display font-bold text-sm">₹{vehicle.price_per_day}</span>
              <span className="text-muted-foreground text-[10px] ml-0.5">/day</span>
            </div>
          )}
        </div>

        {/* Content — streamlined */}
        <div className={`${compact ? "px-3 py-2.5" : "p-4"} flex-1 flex flex-col gap-2`}>
          {/* Title + rating row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className={`font-display font-bold text-foreground ${compact ? "text-sm" : "text-base"} leading-tight group-hover:text-primary transition-colors truncate`}>
                {vehicle.name}
              </h3>
              {vehicle.model && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{vehicle.model}</p>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-foreground">{vehicle.rating || "New"}</span>
            </div>
          </div>

          {/* Shop name — simple and clean */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Store className="h-3 w-3 shrink-0" />
            <span className="truncate">{displayShopName}</span>
            {vehicle.engine_cc && (
              <>
                <span className="text-border">·</span>
                <span>{vehicle.engine_cc}cc</span>
              </>
            )}
          </div>

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
                  View details <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
