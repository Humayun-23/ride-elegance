import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Zap, ArrowRight, MapPin, ChevronRight, ShieldCheck, Wallet, Car, Store, MessageCircle, CalendarDays, CheckCircle2, Star } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import VehicleCard from "@/features/vehicles/components/VehicleCard";
import { useSearchVehicles } from "@/features/vehicles/hooks/useVehicles";
import { useShops } from "@/features/shops/hooks/useShops";
import { SEO } from "@/components/common/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import { Link } from "react-router-dom";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918011401900";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi GoPanda, I need help finding a rental vehicle in Guwahati.")}`;

const POPULAR_AREAS = [
  "Paltan Bazaar",
  "Zoo Road",
  "GS Road",
  "Beltola",
  "Chandmari",
  "Guwahati Airport",
  "Six Mile",
  "Khanapara",
  "Ganeshguri",
  "Maligaon",
];

const HERO_VEHICLE_TYPES = [
  { label: "Bike", value: "bike", icon: "🏍️" },
  { label: "Scooty", value: "scooty", icon: "🛵" },
  { label: "Car", value: "car", icon: "🚗" },
];

const VEHICLE_TYPES = [
  { label: "Bike Rental", icon: "🏍️", value: "bike", desc: "Manual bikes for city rides and weekend routes" },
  { label: "Scooty Rental", icon: "🛵", value: "scooty", desc: "Easy daily rides around Guwahati" },
  { label: "Self-Drive Car Rental", icon: "🚗", value: "car", desc: "Cars for family trips and longer drives" },
];

const TRUST_CARDS = [
  { icon: ShieldCheck, title: "Verified Local Shops", copy: "We list rental partners after basic verification." },
  { icon: Wallet, title: "Small Token Booking", copy: "Pay a small advance to lock your vehicle." },
  { icon: MessageCircle, title: "WhatsApp Confirmation", copy: "Get booking details directly on WhatsApp." },
  { icon: CheckCircle2, title: "Transparent Pricing", copy: "See rent and pickup details before booking." },
];

export default function Index() {
  const navigate = useNavigate();
  const [city, setCity] = useState("Guwahati");
  const [vehicleType, setVehicleType] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const { data: vehiclesData, isLoading: isLoadingVehicles } = useSearchVehicles({ is_available: "true", limit: 6 });
  const { data: shopsData, isLoading: isLoadingShops } = useShops({ is_active: true, limit: 3 });

  const popularShops = useMemo(() => {
    return Array.isArray(shopsData) ? shopsData.slice(0, 3) : [];
  }, [shopsData]);

  const popularBikes = useMemo(() => {
    return Array.isArray(vehiclesData) ? vehiclesData.slice(0, 6) : [];
  }, [vehiclesData]);

  const heroVehicleSlots = useMemo(() => {
    return HERO_VEHICLE_TYPES.map((type) => ({
      ...type,
      vehicle: popularBikes.find((vehicle) => {
        const vehicleType = String(vehicle.bike_type || "").toLowerCase();
        return vehicle.image_url && vehicleType.includes(type.value);
      }),
    }));
  }, [popularBikes]);

  const primaryHeroVehicle =
    heroVehicleSlots.find((slot) => slot.value !== "car" && slot.vehicle)?.vehicle ||
    heroVehicleSlots.find((slot) => slot.vehicle)?.vehicle ||
    popularBikes.find((vehicle) => vehicle.image_url);

  const primaryHeroImage = getOptimizedImageUrl(primaryHeroVehicle?.image_url, {
    width: 760,
    height: 540,
    crop: "fill",
  });
  const primaryHeroImageSrcSet = primaryHeroVehicle?.image_url
    ? [
        `${getOptimizedImageUrl(primaryHeroVehicle.image_url, { width: 420, height: 300, crop: "fill" })} 420w`,
        `${getOptimizedImageUrl(primaryHeroVehicle.image_url, { width: 640, height: 455, crop: "fill" })} 640w`,
        `${primaryHeroImage} 760w`,
      ].join(", ")
    : "";

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.append("q", city);
    if (vehicleType) params.append("type", vehicleType);
    if (pickupDate) params.append("pickup_date", pickupDate);
    if (returnDate) params.append("return_date", returnDate);
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

  useEffect(() => {
    // Defer below-the-fold rendering to prioritize the Hero paint (LCP)
    const timer = setTimeout(() => setIsMounted(true), 10);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-body pb-24 md:pb-0">
      <SEO
        title="Rent Bikes, Scooties & Self-Drive Cars in Guwahati | GoPanda"
        description="Compare verified local rental shops in Guwahati, book with a small token, and get bike, scooty, or self-drive car confirmation on WhatsApp."
        canonical="https://www.gopanda.in"
      />



      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-12 lg:pt-28 lg:pb-16 overflow-x-hidden">
        <div className="container px-4 mx-auto relative z-10 overflow-hidden">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(420px,0.9fr)] lg:gap-12 xl:gap-16">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-5 text-center lg:text-left min-w-0"
            >
              <div className="inline-block max-w-full px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/60 text-sm font-semibold text-amber-800">
                Local rentals. Verified shops. Easy booking.
              </div>

              <h1 className="text-[1.6rem] sm:text-4xl md:text-5xl lg:text-[3.35rem] font-bold tracking-tight font-display leading-[1.12] sm:leading-[1.08] mx-auto lg:mx-0">
                Rent Bikes, Scooties & Self-Drive Cars in Guwahati
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Compare verified local rental shops, book with a small token, and get confirmation on WhatsApp.
              </p>

              {/* Search form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onSubmit={handleSearch}
                className="w-full max-w-[760px] bg-white/95 dark:bg-black/40 backdrop-blur-2xl p-3 rounded-3xl shadow-elevated border border-border/70 mx-auto lg:mx-0 grid grid-cols-1 md:grid-cols-2 items-end gap-2 relative z-10"
              >
                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/80 dark:bg-white/5 border border-border/70 text-left">
                  <Car className="text-primary h-5 w-5 shrink-0" />
                  <div className="flex flex-col w-full text-left">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Vehicle type</span>
                    <select
                      aria-label="Vehicle type"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full border-0 bg-transparent shadow-none focus:outline-none p-0 text-sm md:text-base font-semibold text-foreground cursor-pointer"
                    >
                      <option value="">Bike, Scooty or Car</option>
                      <option value="bike">Bike</option>
                      <option value="scooty">Scooty</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                </label>

                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/80 dark:bg-white/5 border border-border/70 text-left">
                  <MapPin className="text-primary h-5 w-5 shrink-0" />
                  <div className="flex flex-col w-full text-left">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">City</span>
                    <input
                      aria-label="City"
                      type="text"
                      placeholder="Guwahati"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border-0 bg-transparent shadow-none focus:outline-none p-0 text-sm md:text-base font-semibold text-foreground placeholder:text-muted-foreground/40"
                    />
                  </div>
                </label>

                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/80 dark:bg-white/5 border border-border/70 text-left">
                  <CalendarDays className="text-primary h-5 w-5 shrink-0" />
                  <div className="flex flex-col w-full text-left">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Pickup date</span>
                    <input aria-label="Pickup date" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full border-0 bg-transparent shadow-none focus:outline-none p-0 text-sm md:text-base font-semibold text-foreground" />
                  </div>
                </label>

                <label className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-background/80 dark:bg-white/5 border border-border/70 text-left">
                  <CalendarDays className="text-primary h-5 w-5 shrink-0" />
                  <div className="flex flex-col w-full text-left">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Return date</span>
                    <input aria-label="Return date" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full border-0 bg-transparent shadow-none focus:outline-none p-0 text-sm md:text-base font-semibold text-foreground" />
                  </div>
                </label>

                <Button type="submit" size="lg" className="rounded-2xl h-14 px-6 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:-translate-y-0.5 shadow-sm w-full shrink-0 md:col-span-2">
                  <Search className="mr-2 h-5 w-5" /> Search Available Vehicles
                </Button>
              </motion.form>

              {/* Trust badges — 2x2 grid on mobile, inline on desktop */}
              <div className="grid grid-cols-2 gap-1.5 lg:hidden max-w-sm mx-auto">
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80">
                  <ShieldCheck className="h-3 w-3 text-primary shrink-0" /> Verified shops
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80">
                  <Wallet className="h-3 w-3 text-primary shrink-0" /> Clear pricing
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80">
                  <CheckCircle2 className="h-3 w-3 text-primary shrink-0" /> Token booking
                </span>
                <span className="flex items-center gap-1.5 rounded-lg bg-secondary/60 px-2.5 py-1.5 text-[11px] font-semibold text-foreground/80">
                  <MessageCircle className="h-3 w-3 text-primary shrink-0" /> WhatsApp confirmation
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground/80 max-w-2xl mx-auto lg:mx-0 hidden lg:block">
                Verified shops · Clear pricing · Token booking · WhatsApp confirmation
              </p>

              {/* Mobile vehicle thumbnail strip — only on small screens */}
              <div className="flex gap-2.5 overflow-x-auto pb-1 lg:hidden -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {popularBikes.slice(0, 5).map((vehicle, i) => (
                  <button
                    key={vehicle.id || i}
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (vehicle.bike_type) params.append("type", vehicle.bike_type);
                      navigate(`/search-vehicles?${params.toString()}`);
                    }}
                    className="relative shrink-0 w-[100px] h-[72px] rounded-2xl overflow-hidden border border-border/60 bg-secondary shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                  >
                    {vehicle.image_url ? (
                      <img
                        src={getOptimizedImageUrl(vehicle.image_url, { width: 200, height: 144, crop: "fill" })}
                        alt={vehicle.name || "Vehicle"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-background">
                        <Car className="h-6 w-6 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-3">
                      <span className="text-[10px] font-bold text-white leading-none capitalize">
                        {vehicle.name || vehicle.bike_type || "Vehicle"}
                      </span>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => navigate("/search-vehicles")}
                  className="shrink-0 w-[72px] h-[72px] rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10 transition-colors"
                >
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wide">View all</span>
                </button>
              </div>

              <p className="text-sm text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Need help choosing a vehicle?{" "}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
                  Contact GoPanda on WhatsApp.
                </a>
              </p>

              <p className="text-sm text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                No more calling multiple shops. Find local rentals in one place.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Pickup areas:</span>
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 lg:justify-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {POPULAR_AREAS.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams({ q: place });
                      if (vehicleType) params.append("type", vehicleType);
                      navigate(`/search-vehicles?${params.toString()}`);
                    }}
                    className="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-secondary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    {place} <span aria-hidden="true">→</span>
                  </button>
                ))}
                </div>
              </div>
            </motion.div>

            {/* Right: Hero image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden lg:block w-full max-w-lg lg:max-w-none lg:pt-12"
            >
              <div className="relative">
                <div className="rounded-3xl overflow-hidden shadow-2xl shadow-foreground/8 border border-border bg-secondary">
                  {primaryHeroImage ? (
                    <img
                      src={primaryHeroImage}
                      srcSet={primaryHeroImageSrcSet}
                      sizes="(min-width: 1024px) 44vw, (min-width: 768px) 520px, calc(100vw - 2rem)"
                      alt={`GoPanda rental vehicle in Guwahati${primaryHeroVehicle?.name ? `: ${primaryHeroVehicle.name}` : ""}`}
                      className="w-full h-[300px] md:h-[360px] lg:h-[390px] object-cover object-center"
                      loading="eager"
                      fetchpriority="high"
                    />
                  ) : (
                    <div className="flex h-[300px] md:h-[360px] lg:h-[390px] items-center justify-center bg-gradient-to-br from-secondary to-background">
                      <div className="text-center px-6">
                        <Car className="mx-auto h-10 w-10 text-primary/40" />
                        <p className="mt-3 text-sm font-semibold text-foreground">Local vehicle photos loading</p>
                        <p className="mt-1 text-xs text-muted-foreground">Real rental listings from Guwahati shops</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 hidden grid-cols-3 gap-2 sm:grid">
                  {heroVehicleSlots.map((slot) => (
                    <div key={slot.value} className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-lg">
                      {slot.vehicle?.image_url ? (
                        <img
                          src={getOptimizedImageUrl(slot.vehicle.image_url, { width: 220, height: 170, crop: "fill" })}
                          alt={`${slot.label} rental listing on GoPanda${slot.vehicle.name ? `: ${slot.vehicle.name}` : ""}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                          <Car className="h-7 w-7 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-x-1 bottom-1 rounded-full bg-white/90 px-2 py-0.5 text-center text-[10px] font-bold text-foreground shadow-sm">
                        {slot.label}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Floating price tag */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="absolute -bottom-4 left-4 bg-white rounded-2xl p-3.5 shadow-lg shadow-foreground/5 border border-border"
                >
                  <p className="text-xs text-emerald-600 font-semibold">Available now</p>
                  <p className="text-lg font-bold font-display text-foreground">
                    {primaryHeroVehicle?.name || "Guwahati rentals"}
                  </p>
                </motion.div>
                {/* Floating trust badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="absolute top-4 right-4 bg-white rounded-xl px-3 py-2 shadow-lg shadow-foreground/5 border border-border flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Verified shops</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="absolute left-4 top-4 bg-white rounded-xl px-3 py-2 shadow-lg shadow-foreground/5 border border-border flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  <span className="text-xs font-semibold text-foreground">WhatsApp confirmed</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TRUST CARDS ─── */}
      <section className="pb-12 bg-background">
        <div className="container px-4 mx-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_CARDS.map((card) => (
              <div key={card.title} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                <card.icon className="h-5 w-5 text-primary mb-3" />
                <h2 className="text-base font-bold text-foreground">{card.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEFERRED BELOW-THE-FOLD CONTENT ─── */}
      {isMounted && (
        <>
          {/* ─── POPULAR VEHICLES ─── */}
          <section className="py-20 bg-white border-t border-border">
            <div className="container px-4 space-y-8">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Popular Rentals in Guwahati</h2>
                  <p className="text-muted-foreground mt-1.5 text-sm">Real bikes, scooties, and cars from local rental partners.</p>
                </div>
                <Button variant="outline" className="font-display gap-1 rounded-full text-foreground text-sm" onClick={() => navigate("/search-vehicles")}>
                  View All Vehicles <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {isLoadingVehicles ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`sk-vh-${i}`} className="flex flex-col space-y-3 rounded-2xl border border-border p-4">
                      <Skeleton className="h-[180px] w-full rounded-xl bg-muted" />
                      <Skeleton className="h-5 w-2/3 bg-muted mt-2" />
                      <Skeleton className="h-4 w-1/2 bg-muted" />
                      <div className="flex justify-between mt-4">
                        <Skeleton className="h-8 w-1/3 bg-muted" />
                        <Skeleton className="h-8 w-1/3 bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : popularBikes.length > 0 ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularBikes.map((v, i) => (
                    <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <VehicleCard vehicle={v} priority={i < 4} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-background p-8 text-center">
                  <p className="mx-auto max-w-xl text-muted-foreground">
                    Vehicles are being onboarded in Guwahati. Need help choosing a vehicle? Chat with GoPanda on WhatsApp.
                  </p>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1ebe5d]"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp GoPanda
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* ─── HOW IT WORKS ─── */}
          <section id="how-it-works" className="py-20 bg-white relative border-t border-border">
            <div className="container px-4 mx-auto">
              <div className="text-center mb-14 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">How GoPanda Works</h2>
                <p className="text-muted-foreground text-base">Book your ride from local rental shops in a few simple steps.</p>
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
                  { icon: Search, title: "Choose your vehicle", desc: "Browse bikes, scooties, and cars from verified local rental shops." },
                  { icon: Zap, title: "Pay a small token", desc: "Lock your booking with a small advance." },
                  { icon: MessageCircle, title: "Get WhatsApp confirmation", desc: "Receive pickup details and shop contact on WhatsApp." },
                  { icon: Wallet, title: "Pick up and ride", desc: "Pay the remaining amount directly to the shop." }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    className="relative z-10 flex flex-col items-center text-center group shrink-0 w-[80vw] sm:w-[280px] md:w-auto snap-center bg-card md:bg-transparent p-6 md:p-0 rounded-3xl md:rounded-none border border-border md:border-transparent shadow-sm md:shadow-none"
                  >
                    {/* Icon Box */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-border shadow-md md:shadow-lg shadow-foreground/4 flex items-center justify-center mb-4 md:mb-5 group-hover:-translate-y-2 group-hover:shadow-glow transition-all duration-300">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] flex items-center justify-center text-white">
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

          {/* ─── WHY GOPANDA ─── */}
          <section className="py-20 bg-background">
            <div className="container px-4 mx-auto">
              <div className="max-w-2xl mb-12">
                <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground mb-3">Why Book Through GoPanda?</h2>
                <p className="text-muted-foreground">Transparent local-shop pricing. No surprise charges from GoPanda.</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                <motion.div whileHover={{ y: -5 }} className="card-elevated rounded-2xl p-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <Search className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">No More Calling Multiple Shops</h3>
                    <p className="text-muted-foreground text-sm">Compare local rental options in one place.</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="card-elevated rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Clear Price Before Booking</h3>
                  <p className="text-muted-foreground text-sm">See rent and pickup details upfront.</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="card-elevated rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Token-Based Confirmation</h3>
                  <p className="text-muted-foreground text-sm">Lock your vehicle before visiting the shop.</p>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="card-elevated rounded-2xl p-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">WhatsApp Support</h3>
                  <p className="text-muted-foreground text-sm">Get booking details and help in one familiar place.</p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ─── BROWSE BY VEHICLE TYPE ─── */}
          <section className="py-20 bg-white border-t border-border">
            <div className="container px-4 mx-auto">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Browse by Vehicle Type</h2>
                  <p className="text-muted-foreground mt-1.5 text-sm">Start with the ride you need in Guwahati.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {VEHICLE_TYPES.map((type) => (
                  <a key={type.value} href={`/rent/${type.value}/in/guwahati`} className="rounded-2xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                    <span className="text-3xl" aria-hidden="true">{type.icon}</span>
                    <h3 className="mt-4 text-lg font-bold text-foreground">{type.label}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{type.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Browse Guwahati <ChevronRight className="h-4 w-4" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* ─── POPULAR SHOPS ─── */}
          <section className="py-20 bg-background border-t border-border">
            <div className="container px-4 mx-auto">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Verified Local Shops</h2>
                  <p className="text-muted-foreground mt-1.5 text-sm">Rent directly from trusted partners across Guwahati.</p>
                </div>
                <Button variant="outline" className="font-display gap-1 rounded-full text-foreground text-sm" onClick={() => navigate("/shops")}>
                  View All Shops <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {isLoadingShops ? (
                <div className="grid md:grid-cols-3 gap-5">
                  {[...Array(3)].map((_, i) => (
                    <div key={`sk-shop-${i}`} className="rounded-2xl border border-border bg-card h-40 animate-pulse" />
                  ))}
                </div>
              ) : popularShops.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-5">
                  {popularShops.map((shop: any, i: number) => (
                    <motion.div
                      key={shop.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link to={`/shops/${shop.id}`} className="group block h-full">
                        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur hover:border-primary/20 hover:bg-card transition-all h-full p-6 flex flex-col shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-display text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                              {shop.name}
                            </h3>
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0 ml-3">
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-muted-foreground mb-4">
                            {(shop.address || shop.city) && (
                              <p className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                                <span className="line-clamp-1">{shop.address}{shop.city ? `, ${shop.city}` : ""}</span>
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-border/50">
                            {shop.rating ? (
                              <div className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 text-primary fill-primary" />
                                <span className="text-sm font-semibold">{shop.rating}</span>
                                <span className="text-xs text-muted-foreground ml-1">Rating</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <Star className="h-4 w-4 text-muted-foreground/30" />
                                <span className="text-sm text-muted-foreground font-medium">New Shop</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {/* ─── POPULAR LOCATIONS ─── */}
          <section className="py-20 bg-secondary/40 border-t border-border">
            <div className="container px-4 mx-auto">
              <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Popular Rental Locations in Guwahati</h2>
                  <p className="text-muted-foreground mt-1.5 text-sm">Search vehicle availability around common pickup areas.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {POPULAR_AREAS.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => navigate(`/search-vehicles?q=${encodeURIComponent(area)}`)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/30 hover:text-primary"
                  >
                    <MapPin className="mr-1.5 inline h-3.5 w-3.5" />
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ─── PARTNER CTA ─── */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] rounded-[2rem] p-8 md:p-14 relative overflow-hidden text-center md:text-left shadow-glow">
                <div className="absolute top-[-15%] right-[-8%] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[-15%] left-[-8%] w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-xl">
                    <h2 className="text-2xl md:text-4xl font-bold font-display text-white mb-4 leading-tight">
                      Own a Vehicle Rental Shop?
                    </h2>
                    <p className="text-primary-foreground/80 text-base md:text-lg mb-6">
                      GoPanda helps you take your rental business online without building your own website or managing complicated software.
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-2 text-left text-sm text-white/85 mb-6">
                      {["Get online visibility", "Receive booking requests on WhatsApp", "Manage vehicles easily", "0% commission during launch", "No technical setup needed"].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a href="/register" className="inline-flex items-center justify-center rounded-xl px-6 py-5 text-base font-bold bg-white text-[hsl(var(--primary))] hover:bg-white/90 hover:shadow-lg transition-all hover:-translate-y-1">
                        List Your Shop
                      </a>
                      <a href="/login" className="inline-flex items-center justify-center rounded-xl px-6 py-5 text-base font-bold text-black border border-white/30 hover:bg-white/10 transition-colors">
                        Partner login
                      </a>
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

          {/* ─── FAQ SECTION ─── */}
          <section className="py-20 bg-secondary/40 border-t border-border">
            <div className="container px-4 mx-auto max-w-4xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">Everything you need to know about renting a vehicle with GoPanda.</p>
              </div>
              <Accordion type="single" collapsible className="w-full bg-white rounded-2xl p-6 shadow-sm border border-border">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary">What documents are required to rent a vehicle?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    You will usually need a valid driving license for the vehicle category and a government ID such as Aadhaar, voter ID, or passport. The rental shop may ask for original ID verification during pickup.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary">Do I have to pay the full amount online?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    No. GoPanda uses a small token amount to confirm your booking. The remaining rental amount is paid directly to the shop at pickup.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary">Is the security deposit included in the rental price?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    Security deposit rules are set by each rental shop and may vary by vehicle. Check the vehicle details before booking or confirm with GoPanda on WhatsApp.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary">Will I get confirmation after booking?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    Yes. After the token payment, GoPanda shares booking confirmation and pickup details on WhatsApp.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary">Can I rent a vehicle for a Shillong or Meghalaya trip?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    Many shops allow outstation trips, but permissions and documents can vary. Confirm Meghalaya or Shillong travel before pickup so the shop can share the correct terms.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary">What happens if I cancel?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                    Cancellation handling depends on booking timing and shop policy. Contact GoPanda support on WhatsApp as early as possible so we can help coordinate with the rental shop.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Footer is now rendered globally in App.tsx */}
        </>
      )}
    </main>
  );
}
