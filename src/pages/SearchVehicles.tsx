import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import VehicleCard from "@/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Bike, Car } from "lucide-react";
import { motion } from "framer-motion";

const TYPES = [
  { value: "all", label: "All Vehicles", icon: "🔥" },
  { value: "scooty", label: "Scooty", icon: "🛵" },
  { value: "bike", label: "Bike", icon: "🏍️" },
  { value: "car", label: "Car", icon: "🚗" },
];

export default function SearchVehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeType, setActiveType] = useState(searchParams.get("type") || "all");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let data: any[];
      if (activeType && activeType !== "all") {
        data = await api.searchVehiclesByType(activeType, { is_available: "true" });
      } else {
        const params: Record<string, string> = { is_available: "true" };
        if (query) params.vehicle_type = query;
        data = await api.searchVehicles(params);
      }
      setVehicles(Array.isArray(data) ? data : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [activeType]);

  const handleSearch = () => {
    setSearchParams(query ? { q: query } : {});
    setActiveType("all");
    fetchVehicles();
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-2">Explore</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold">
              Find Your <span className="text-gradient">Ride</span>
            </h1>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                className="pl-11 bg-card/80 border-border h-12 rounded-xl text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="font-display h-12 px-6 rounded-xl gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Search
            </Button>
          </div>

          {/* Type filters */}
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setActiveType(t.value);
                  setSearchParams(t.value !== "all" ? { type: t.value } : {});
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display transition-all ${
                  activeType === t.value
                    ? "bg-primary text-primary-foreground glow"
                    : "bg-card/60 text-muted-foreground hover:text-foreground hover:bg-card border border-border"
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!loading && vehicles.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-display font-bold">{vehicles.length}</span> vehicles
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card h-72 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 space-y-6"
          >
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-primary/50" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold">No vehicles found</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Try adjusting your search or browse a different category.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <VehicleCard vehicle={v} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
