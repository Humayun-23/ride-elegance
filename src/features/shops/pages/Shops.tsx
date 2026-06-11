import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, Star, ChevronRight, Phone, Clock, Store, Search, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatIndianPhone } from "@/lib/phone";
import { SEO } from "@/components/common/SEO";
import { getShops } from "@/features/shops/services/shopService";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918011401900";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi GoPanda, please help me find a rental shop in Guwahati.")}`;

type ShopListItem = {
  id: string | number;
  name?: string;
  city?: string;
  address?: string;
  state?: string;
  phone_number?: string;
  opening_time?: string;
  closing_time?: string;
  description?: string;
  rating?: number;
  is_active?: boolean;
};

export default function Shops() {
  const [shops, setShops] = useState<ShopListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getShops().then((res) => setShops(res.data)).catch(() => setShops([])).finally(() => setLoading(false));
  }, []);

  const filtered = shops.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.city?.toLowerCase().includes(search.toLowerCase()) ||
      s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <SEO
        title="Verified Vehicle Rental Shops in Guwahati | GoPanda"
        description="Explore local rental shops listed on GoPanda and find vehicles near you."
        keywords="bike rental shops guwahati, car rental shops near me, vehicle rental shops assam, car rental in guwahati"
        canonical="https://www.gopanda.in/shops"
        schema={JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Verified Vehicle Rental Shops in Guwahati | GoPanda',
          description: 'Explore local rental shops listed on GoPanda and find vehicles near you.',
          url: 'https://www.gopanda.in/shops',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [{
              '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.gopanda.in'
            }, {
              '@type': 'ListItem', position: 2, name: 'Rental Shops', item: 'https://www.gopanda.in/shops'
            }]
          }
        })}
      />
      <div className="container px-4 space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-2">Browse</p>
            <h1 className="font-display text-3xl md:text-5xl font-bold">
              Verified Vehicle Rental Shops in Guwahati
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Explore local rental shops listed on GoPanda and find vehicles near you.
            </p>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search shops"
              placeholder="Search shops by name or city..."
              className="pl-11 bg-card/80 border-border rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 space-y-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Store className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold">No shops found</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                We are onboarding rental shops in this area. Chat with GoPanda on WhatsApp and we'll help you find availability.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((shop, i) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link to={`/shops/${shop.id}`} className="group block h-full">
                  <Card className="border-border/50 bg-card/60 backdrop-blur hover:border-primary/20 hover:bg-card transition-all h-full overflow-hidden flex flex-col">
                    {/* Top accent bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent shrink-0" />
                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors">
                            {shop.name}
                          </h3>
                          {shop.is_active === false && (
                            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        {(shop.address || shop.city) && (
                          <p className="flex items-start gap-2">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">
                              {shop.address}{shop.city ? `, ${shop.city}` : ""}{shop.state ? `, ${shop.state}` : ""}
                            </span>
                          </p>
                        )}
                        {shop.phone_number && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {formatIndianPhone(shop.phone_number)}
                          </p>
                        )}
                        {(shop.opening_time || shop.closing_time) && (
                          <p className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {shop.opening_time || "?"} – {shop.closing_time || "?"}
                          </p>
                        )}
                      </div>

                      {shop.description && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-2 leading-relaxed flex-1">
                          {shop.description}
                        </p>
                      )}

                      <div className="mt-auto pt-2">
                        {shop.rating ? (
                          <div className="flex items-center gap-1.5 pt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, j) => (
                                <Star
                                  key={j}
                                  className={`h-3 w-3 ${j < Math.round(shop.rating) ? "text-primary fill-primary" : "text-muted-foreground/20"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-display">{shop.rating}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 pt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className="h-3 w-3 text-muted-foreground/20" />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground font-display">New</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
