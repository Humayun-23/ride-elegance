import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Fuel } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VehicleCardProps {
  vehicle: {
    id: string;
    name: string;
    type?: string;
    price_per_hour?: number;
    price_per_day?: number;
    image_url?: string;
    rating?: number;
    location?: string;
    fuel_type?: string;
  };
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/vehicles/${vehicle.id}`} className="group block">
        <div className="overflow-hidden rounded-lg border border-border bg-card transition-all group-hover:border-glow group-hover:glow">
          <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
            {vehicle.image_url ? (
              <img src={vehicle.image_url} alt={vehicle.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground font-display text-lg">
                {vehicle.type || "Vehicle"}
              </div>
            )}
            {vehicle.type && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-display text-xs uppercase tracking-wider">
                {vehicle.type}
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-display font-bold text-foreground text-lg leading-tight">{vehicle.name}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {vehicle.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{vehicle.location}</span>
              )}
              {vehicle.rating && (
                <span className="flex items-center gap-1"><Star className="h-3 w-3 text-primary" />{vehicle.rating}</span>
              )}
              {vehicle.fuel_type && (
                <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{vehicle.fuel_type}</span>
              )}
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-primary font-display font-bold text-lg">
                ${vehicle.price_per_hour || vehicle.price_per_day || "—"}
              </span>
              <span className="text-muted-foreground text-xs ml-1">
                /{vehicle.price_per_hour ? "hr" : "day"}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
