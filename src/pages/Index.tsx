import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, Shield, Clock, ArrowRight, MapPin, Star, ChevronRight, ShieldCheck, Wallet, Car, Store, MessageCircle } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import VehicleCard from "@/components/VehicleCard";
import { useShops } from "@/hooks/useShops";
import { useSearchVehicles } from "@/hooks/useVehicles";
import { SEO } from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

const VEHICLE_TYPES = [
  { label: "Scooty", icon: "🛵", value: "scooty", desc: "Quick city rides" },
  { label: "Bikes", icon: "🏍️", value: "bike", desc: "Thrill & power" },
  { label: "Cars", icon: "🚗", value: "car", desc: "Comfort & space" },
];

export default function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const { data: shopsData, isLoading: isLoadingShops } = useShops({ limit: 6 });
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useSearchVehicles({ is_available: "true", limit: 6 });

  const featuredShops = useMemo(() => {
    return Array.isArray(shopsData) ? shopsData.slice(0, 6) : [];
  }, [shopsData]);

  const popularBikes = useMemo(() => {
    return Array.isArray(vehiclesData) ? vehiclesData.slice(0, 6) : [];
  }, [vehiclesData]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (vehicleType) params.append("type", vehicleType);
    navigate(`/search-vehicles?${params.toString()}`);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  // Show sticky search bar when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShowStickySearch(scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-body">
      <SEO
        title="GoPanda — Rent bikes & cars from local shops in Guwahati"
        description="Find and book bikes, scooties, and cars from verified rental shops in Guwahati. Pay a small token, pick up your ride. No middlemen, no hidden fees."
      />

      {/* ─── STICKY SEARCH BAR ─── */}
      <div
        className={`fixed top-14 left-0 right-0 z-40 transition-all duration-300 ${showStickySearch
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
          <form onSubmit={handleSearch} className="container px-4 py-2.5 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg border border-border focus-within:border-primary/40 transition-colors">
              <MapPin className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <input
                type="text"
                placeholder="Location..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg border border-border focus-within:border-primary/40 transition-colors">
              <Car className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="border-0 bg-transparent text-sm outline-none text-foreground cursor-pointer"
              >
                <option value="">Any</option>
                <option value="scooty">Scooty</option>
                <option value="bike">Bike</option>
                <option value="car">Car</option>
              </select>
            </div>
            <Button type="submit" size="sm" className="rounded-lg px-4 h-9 text-xs font-semibold shrink-0">
              <Search className="h-3.5 w-3.5 mr-1.5" /> Search
            </Button>
          </form>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-24 overflow-hidden">
        {/* Warm ambient blobs - subtler than before */}
        <div className="absolute top-[-8%] left-[-5%] w-[35%] h-[35%] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-8%] w-[30%] h-[30%] rounded-full bg-amber-400/8 blur-[100px] pointer-events-none" />

        <div className="container px-4 mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-sm font-medium text-amber-800">
                ₹0 booking fee
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-display leading-[1.12]">
                Rent a vehicle{" "}
                <span className="text-highlight">from local shops</span>{" "}
                Near You
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mx-auto lg:mx-0">
                Pick a ride from verified local shops. Lock it with a small token (min ₹299), pay the rest at pick up. No middlemen, no surprises.
              </p>

              {/* Search form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onSubmit={handleSearch}
                className="bg-white p-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-border max-w-2xl mx-auto lg:mx-0 flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1 flex items-center gap-2.5 bg-muted/50 px-3.5 py-2.5 rounded-xl border border-border focus-within:border-primary/40 focus-within:bg-white transition-colors">
                  <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
                  <Input
                    type="text"
                    placeholder="Where? (e.g. Paltan Bazaar)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="flex-1 flex items-center gap-2.5 bg-muted/50 px-3.5 py-2.5 rounded-xl border border-border focus-within:border-primary/40 focus-within:bg-white transition-colors">
                  <Car className="text-muted-foreground h-4 w-4 shrink-0" />
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full border-0 bg-transparent focus:ring-0 text-sm outline-none text-foreground cursor-pointer"
                  >
                    <option value="">Any vehicle</option>
                    <option value="scooty">Scooty</option>
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                  </select>
                </div>

                <Button type="submit" size="lg" className="rounded-xl h-auto py-3 px-6 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
                  Find rides <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </motion.form>

              {/* Quick location tags */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start pt-1">
                <span className="text-xs text-muted-foreground">Popular:</span>
                {["Paltan Bazaar", "Zoo Road", "GS Road", "Beltola", "Chandmari"].map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => { setQuery(place); handleSearch(); }}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/10 hover:text-primary text-secondary-foreground transition-colors"
                  >
                    {place}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Right: Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1 max-w-lg lg:max-w-xl w-full"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-foreground/8 border border-border">
                  <img
                    src="/vignesh-rajendran-x-dyoS4EmM8-unsplash.jpg"
                    alt="A white car driving on a highway at dusk"
                    className="w-full h-auto object-cover aspect-[4/3]"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                {/* Floating price tag */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3.5 shadow-lg shadow-foreground/5 border border-border"
                >
                  <p className="text-xs text-muted-foreground font-medium">Starting from</p>
                  <p className="text-xl font-bold font-display text-foreground">₹599<span className="text-sm font-normal text-muted-foreground">/day</span></p>
                </motion.div>
                {/* Floating trust badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute -top-3 -right-3 bg-white rounded-xl px-3 py-2 shadow-lg shadow-foreground/5 border border-border flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Verified shops</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 bg-white relative">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground text-base">Four steps. No hidden fees.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            onScroll={(e) => {
              const target = e.currentTarget;
              const scrollRatio = target.scrollLeft / (target.scrollWidth - target.clientWidth || 1);
              setActiveStep(Math.round(scrollRatio * 3));
            }}
            className="flex md:grid md:grid-cols-4 gap-4 md:gap-8 relative overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-border to-transparent z-0" />

            {[
              { icon: Search, title: "Find a ride", desc: "Browse local shops, see what's available right now." },
              { icon: Zap, title: "Pay a small token", desc: "Lock your dates with ₹299 via UPI. Goes directly to the shop." },
              { icon: MessageCircle, title: "Get confirmation", desc: "The shop owner gets a WhatsApp notification. You're all set." },
              { icon: Wallet, title: "Pick up & pay rest", desc: "Head to the shop, pay the balance, and ride out." }
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="relative z-10 flex flex-col items-center text-center group shrink-0 w-[80vw] sm:w-[280px] md:w-auto snap-center bg-card md:bg-transparent p-6 md:p-0 rounded-3xl md:rounded-none border border-border md:border-transparent shadow-sm md:shadow-none"
              >
                {/* Icon Box */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-border shadow-md md:shadow-lg shadow-foreground/4 flex items-center justify-center mb-4 md:mb-5 group-hover:-translate-y-1 transition-transform duration-200">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/8 flex items-center justify-center text-primary">
                    <step.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-[10px] md:text-xs font-bold text-primary/60 font-display mb-1 md:mb-1 uppercase tracking-wider">Step {i + 1}</div>
                <h3 className="text-base md:text-lg font-bold text-foreground mb-1 md:mb-1.5">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile Swipe Indicator */}
          <div className="flex md:hidden items-center justify-center gap-4 mt-2 mb-4 text-muted-foreground">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeStep === idx ? "w-4 bg-primary" : "w-1.5 bg-border"
                    }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-display font-bold tracking-widest uppercase flex items-center gap-1 opacity-50 transition-opacity">
              {activeStep === 3 ? "Ready!" : (
                <>Swipe <ArrowRight className="w-3 h-3" /></>
              )}
            </span>
          </div>
        </div>
      </section>

      {/* ─── POPULAR VEHICLES ─── */}
      {(popularBikes.length > 0 || isLoadingVehicles) && (
        <section className="py-20 bg-white border-t border-border">
          <div className="container px-4 space-y-8">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Rides available right now</h2>
                <p className="text-muted-foreground mt-1.5 text-sm">These are actually available today — not placeholder listings.</p>
              </div>
              <Button variant="outline" className="font-display gap-1 rounded-full text-foreground text-sm" onClick={() => navigate("/search-vehicles")}>
                See all <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoadingVehicles ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`sk-vh-${i}`} className="flex flex-col space-y-3 rounded-2xl border border-border p-4">
                    <Skeleton className="h-[180px] w-full rounded-xl bg-muted" />
                    <Skeleton className="h-5 w-2/3 bg-muted mt-2" />
                    <Skeleton className="h-4 w-1/2 bg-muted" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-8 w-1/3 bg-muted" />
                      <Skeleton className="h-8 w-1/3 bg-muted" />
                    </div>
                  </div>
                ))
              ) : (
                popularBikes.map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <VehicleCard vehicle={v} priority={i < 4} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── SHOPS NEAR YOU ─── */}
      {(featuredShops.length > 0 || isLoadingShops) && (
        <section className="py-20 bg-secondary/40 border-t border-border">
          <div className="container px-4 space-y-8">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="space-y-1.5">
                <p className="text-xs font-display uppercase tracking-[0.2em] text-muted-foreground">Local partners</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Shops you can <span className="text-primary">actually trust</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/shops")}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                All shops <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingShops ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`sk-sh-${i}`} className="w-full flex flex-col rounded-2xl border border-border bg-white p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-2xl bg-muted shrink-0" />
                      <div className="min-w-0 w-full space-y-2">
                        <Skeleton className="h-5 w-3/4 bg-muted" />
                        <Skeleton className="h-4 w-1/2 bg-muted" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                featuredShops.map((shop, i) => (
                  <motion.div key={shop.id ?? i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/shops/${shop.id}`)}
                      className="w-full h-full flex flex-col text-left rounded-2xl border border-border bg-white p-5 md:p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center border border-primary/10 overflow-hidden shrink-0">
                          {shop.image_url ? (
                            <img src={shop.image_url} alt={shop.name ? `${shop.name} - Bike Rental in Guwahati` : "Bike Rental Shop in Guwahati"} className="h-full w-full object-cover" />
                          ) : (
                            <Store className="h-6 w-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-foreground truncate">{shop.name || "Partner Shop"}</h3>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {(shop.city || shop.address || shop.state) && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate">
                                  {shop.city || shop.address}{shop.state ? `, ${shop.state}` : ""}
                                </span>
                              </span>
                            )}
                            {(shop.opening_time || shop.closing_time) && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {shop.opening_time || "?"} – {shop.closing_time || "?"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY GOPANDA ─── */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-3">Fair deals, no middlemen</h2>
            <p className="text-muted-foreground">We built GoPanda so you pay the best price and local shops keep what they earn.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 auto-rows-[220px]">
            {/* Box 1 - wide */}
            <motion.div whileHover={{ y: -3 }} className="md:col-span-2 bg-white rounded-2xl p-7 border border-border shadow-sm overflow-hidden relative group">
              <div className="relative z-10 w-3/4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">If you book it, it's yours</h3>
                <p className="text-muted-foreground text-sm">Real-time inventory means no double bookings. Your ride is locked the moment you pay.</p>
              </div>
              <div className="absolute right-[-8%] bottom-[-15%] w-48 h-48 bg-gradient-to-br from-blue-50 to-transparent rounded-full opacity-60 group-hover:scale-110 transition-transform duration-500" />
            </motion.div>

            {/* Box 2 */}
            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-7 border border-border shadow-sm overflow-hidden relative group">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Star className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Real reviews only</h3>
              <p className="text-muted-foreground text-sm">Every review comes from someone who actually rented. No fake 5-stars.</p>
            </motion.div>

            {/* Box 3 */}
            <motion.div whileHover={{ y: -3 }} className="bg-white rounded-2xl p-7 border border-border shadow-sm overflow-hidden relative group">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Talk to the owner</h3>
              <p className="text-muted-foreground text-sm">Direct WhatsApp connection with the shop. No call centres, no bots.</p>
            </motion.div>

            {/* Box 4 - wide, dark */}
            <motion.div whileHover={{ y: -3 }} className="md:col-span-2 bg-foreground rounded-2xl p-7 shadow-lg overflow-hidden relative group">
              <div className="relative z-10 w-3/4">
                <div className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center mb-4">
                  <Wallet className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">We take 0% commission</h3>
                <p className="text-white/60 text-sm">Every rupee goes to the shop owner. No platform markups, no "convenience fees". You get the real price.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PARTNER CTA ─── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-8 md:p-14 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-[-15%] right-[-8%] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-15%] left-[-8%] w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
                  Run a rental shop? We'll send you customers.
                </h2>
                <p className="text-primary-foreground/80 text-base md:text-lg mb-6">
                  Get bookings on WhatsApp, receive UPI payments, manage your fleet — all for free. No commissions, ever.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" variant="secondary" className="rounded-xl px-6 py-5 text-base font-bold bg-white text-primary hover:bg-white/90 transition-transform hover:-translate-y-0.5" onClick={() => navigate("/register")}>
                    List your shop — it's free
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-xl px-6 py-5 text-base font-bold text-black border-white/30 hover:bg-white/10 transition-colors" onClick={() => navigate("/login")}>
                    Partner login
                  </Button>
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center w-48 h-48">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 border-2 border-white/15 rounded-full border-dashed animate-[spin_25s_linear_infinite]" />
                  <div className="absolute inset-4 bg-white/8 rounded-full flex items-center justify-center">
                    <Store className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white border-t border-border pt-14 pb-8 text-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="font-display font-bold text-xl text-foreground tracking-tight flex items-center gap-1.5">
                <span className="text-primary">Go</span>Panda
              </div>
              <p className="text-muted-foreground pr-4 text-sm leading-relaxed">
                We connect you with <strong>local rental shops</strong> in Guwahati. Find a ride, book it, go.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Explore</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button onClick={() => navigate("/search-vehicles")} className="hover:text-primary transition-colors">Search Vehicles</button></li>
                <li><button onClick={() => navigate("/shops")} className="hover:text-primary transition-colors">Browse Shops</button></li>
                <li><a href="/rent/car/in/jorhat" className="hover:text-primary transition-colors">Car rental in Jorhat</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Partners</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button onClick={() => navigate("/register")} className="hover:text-primary transition-colors">Register Shop</button></li>
                <li><button onClick={() => navigate("/login")} className="hover:text-primary transition-colors">Shop Login</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-foreground">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between text-muted-foreground">
            <p>© {new Date().getFullYear()} GoPanda. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Made with ❤️ in Assam for local businesses.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
