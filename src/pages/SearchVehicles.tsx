import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import VehicleCard from "@/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

const TYPES = ["all", "car", "bike", "scooter", "bicycle"];

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
        data = await api.searchVehiclesByType(activeType);
      } else {
        const params: Record<string, string> = {};
        if (query) params.q = query;
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
        <div className="space-y-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Explore <span className="text-gradient">Vehicles</span>
          </h1>
          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 bg-card"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} className="font-display">
              <Filter className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <Button
                key={t}
                variant={activeType === t ? "default" : "outline"}
                size="sm"
                className="font-display capitalize"
                onClick={() => { setActiveType(t); setSearchParams(t !== "all" ? { type: t } : {}); }}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card h-64 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-muted-foreground">
            No vehicles found. Try adjusting your search.
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
