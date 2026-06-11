import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSearchVehicles } from "@/features/vehicles/hooks/useVehicles";
import VehicleCard from "@/features/vehicles/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, ArrowUpDown, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { SEO } from "@/components/common/SEO";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918011401900";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi GoPanda, please help me find an available rental vehicle.")}`;

const TYPES = [
  { value: "all", label: "All Vehicles", icon: "🔥" },
  { value: "scooty", label: "Scooty", icon: "🛵" },
  { value: "bike", label: "Bike", icon: "🏍️" },
  { value: "car", label: "Car", icon: "🚗" },
];

const SORTS = [
  { value: "default", label: "Default" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "rating", label: "Rating" },
];

const PAGE_SIZE = 12;

export default function SearchVehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const activeType = searchParams.get("type") || "all";
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(0);

  // Setup API parameters driven by the URL state (memoized to keep reference stable)
  const params = useMemo(() => {
    const p: Record<string, string> = { is_available: "true" };
    if (activeType && activeType !== "all") p.vehicle_type = activeType;
    const searchQ = searchParams.get("q");
    if (searchQ) p.q = searchQ;
    return p;
  }, [activeType, searchParams]);

  // Fetch using the globally cached hook!
  const { data, isLoading: loading } = useSearchVehicles(params);
  const vehicles = useMemo(() => Array.isArray(data) ? data : [], [data]);

  const handleSearch = () => {
    const newParams: Record<string, string> = {};
    if (query) newParams.q = query;
    setSearchParams(newParams);
    setPage(0);
  };

  const handleTypeChange = (type: string) => {
    const newParams: Record<string, string> = {};
    if (searchParams.get("q")) newParams.q = searchParams.get("q") as string;
    if (type !== "all") newParams.type = type;
    setSearchParams(newParams);
    setPage(0);
  };

  const sorted = useMemo(() => {
    const arr = [...vehicles];
    if (sort === "price_asc") arr.sort((a, b) => (a.price_per_day || 0) - (b.price_per_day || 0));
    else if (sort === "price_desc") arr.sort((a, b) => (b.price_per_day || 0) - (a.price_per_day || 0));
    else if (sort === "rating") arr.sort((a, b) => (b.avg_rating || b.rating || 0) - (a.avg_rating || a.rating || 0));
    return arr;
  }, [vehicles, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title="Search Available Rental Vehicles | GoPanda"
        description="Browse bikes, scooties, and cars from local rental shops."
        keywords="bike rental near me, car rental guwahati, scooty rental, search vehicles"
        canonical="https://www.gopanda.in/search-vehicles"
        noindex={!loading && vehicles.length === 0}
        schema={JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Search Available Rental Vehicles | GoPanda',
          description: 'Browse bikes, scooties, and cars from local rental shops.',
          url: 'https://www.gopanda.in/search-vehicles',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [{
              '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gopanda.in'
            }, {
              '@type': 'ListItem', position: 2, name: 'Search Vehicles', item: 'https://www.gopanda.in/search-vehicles'
            }]
          }
        })}
      />
      <div className="container px-4 space-y-8">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-2">Explore</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold">
              Search Available Rental Vehicles
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Browse bikes, scooties, and cars from local rental shops.
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Local rentals. Verified shops. Easy booking. Starting with Guwahati and expanding across Northeast India.
            </p>
          </div>

          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search vehicles"
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

          <div className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTypeChange(t.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display transition-all ${activeType === t.value
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

        {!loading && vehicles.length > 0 && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              Showing <span className="text-foreground font-display font-bold">{pageItems.length}</span> of <span className="text-foreground font-display font-bold">{sorted.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                aria-label="Sort vehicles"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(0); }}
                className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm font-display"
              >
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card h-72 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 space-y-6">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-primary/50" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold">No vehicles found</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                We are onboarding vehicles in this area. Need help choosing a vehicle? Chat with GoPanda on WhatsApp.
              </p>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1ebe5d]"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp GoPanda
            </a>
          </motion.div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pageItems.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <VehicleCard vehicle={v} />
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="font-display gap-1">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <span className="text-sm font-display text-muted-foreground">
                  Page <span className="text-foreground font-bold">{page + 1}</span> / {totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} className="font-display gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
