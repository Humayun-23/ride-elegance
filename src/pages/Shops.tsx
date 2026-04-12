import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { MapPin, Star, ChevronRight } from "lucide-react";

export default function Shops() {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getShops().then(setShops).catch(() => setShops([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 space-y-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Rental <span className="text-gradient">Shops</span>
        </h1>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-lg border border-border bg-card h-40 animate-pulse" />)}
          </div>
        ) : shops.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No shops found.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {shops.map((shop, i) => (
              <motion.div key={shop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/shops/${shop.id}`} className="group block rounded-lg border border-border bg-card p-6 hover:border-glow hover:glow transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold">{shop.name}</h3>
                      {shop.location && <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{shop.location}</p>}
                      {shop.rating && <p className="text-sm text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 text-primary" />{shop.rating}</p>}
                      {shop.description && <p className="text-sm text-muted-foreground line-clamp-2">{shop.description}</p>}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
