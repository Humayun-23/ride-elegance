import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Gauge, Fuel } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VehicleCardProps {
  vehicle: {
    id: string | number;
    name: string;
    model?: string;
    bike_type?: string;
    engine_cc?: number;
    price_per_hour?: number;
    price_per_day?: number;
    image_url?: string;
    rating?: number;
    location?: string;
    shop_name?: string;
    condition?: string;
    is_available?: boolean;
    description?: string;
  };
}

const TYPE_EMOJI: Record<string, string> = {
  scooty: "🛵",
  bike: "🏍️",
  car: "🚗",
  mountain: "🚵",
  road: "🚴",
  hybrid: "⚡",
  electric: "🔋",
};

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link to={`/vehicles/${vehicle.id}`} className="group block h-full">
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur transition-all group-hover:border-primary/20 group-hover:bg-card group-hover:shadow-[0_8px_30px_hsl(45_100%_51%/0.08)] h-full flex flex-col">
        {/* Image */}
        <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
          {vehicle.image_url ? (
            <img
              src={vehicle.image_url}
              alt={vehicle.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-background">
              <span className="text-5xl opacity-30">
                {TYPE_EMOJI[vehicle.bike_type || ""] || "🚗"}
              </span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Type badge */}
          {vehicle.bike_type && (
            <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-foreground font-display text-[10px] uppercase tracking-wider border border-border/50">
              {TYPE_EMOJI[vehicle.bike_type] || ""} {vehicle.bike_type}
            </Badge>
          )}

          {/* Availability */}
          {vehicle.is_available === false && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="font-display text-xs">Unavailable</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
              {vehicle.name}
            </h3>
            {vehicle.model && (
              <p className="text-xs text-muted-foreground mt-0.5">{vehicle.model}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {vehicle.engine_cc && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                <Gauge className="h-3 w-3" />{vehicle.engine_cc}cc
              </span>
            )}
            {vehicle.condition && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md capitalize">
                {vehicle.condition}
              </span>
            )}
            {vehicle.shop_name && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                <MapPin className="h-3 w-3" />{vehicle.shop_name}
              </span>
            )}
            {vehicle.rating && (
              <span className="inline-flex items-center gap-1 text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                <Star className="h-3 w-3 fill-current" />{vehicle.rating}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-border/50 flex items-baseline gap-3">
            {vehicle.price_per_hour != null && (
              <span>
                <span className="text-primary font-display font-bold text-lg">₹{vehicle.price_per_hour}</span>
                <span className="text-muted-foreground text-[10px] ml-0.5">/hr</span>
              </span>
            )}
            {vehicle.price_per_day != null && (
              <span>
                <span className="text-foreground font-display font-bold text-sm">₹{vehicle.price_per_day}</span>
                <span className="text-muted-foreground text-[10px] ml-0.5">/day</span>
              </span>
            )}
            {vehicle.price_per_hour == null && vehicle.price_per_day == null && (
              <span className="text-muted-foreground font-display">Contact for price</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
