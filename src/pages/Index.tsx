import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, Shield, Clock, ArrowRight, MapPin, Star, ChevronRight, ShieldCheck, Wallet, Car, Store } from "lucide-react";
import { useState, useMemo } from "react";
import VehicleCard from "@/components/VehicleCard";
import { useShops } from "@/hooks/useShops";
import { useSearchVehicles } from "@/hooks/useVehicles";
import { SEO } from "@/components/SEO";

const VEHICLE_TYPES = [
  { label: "Scooty", icon: "🛵", value: "scooty", desc: "Quick city rides" },
  { label: "Bikes", icon: "🏍️", value: "bike", desc: "Thrill & power" },
  { label: "Cars", icon: "🚗", value: "car", desc: "Comfort & space" },
];

const FEATURES = [
  { icon: Zap, title: "Instant Booking", desc: "Reserve your ride in seconds with real-time availability checking across all nearby shops." },
  { icon: Shield, title: "Fully Insured", desc: "Every rental comes with comprehensive coverage so you ride worry-free." },
  { icon: Clock, title: "24/7 Access", desc: "Pick up and drop off on your schedule — no waiting, no restrictions." },
];

const STATS = [
  { value: "500+", label: "Vehicles" },
  { value: "50+", label: "Shops" },
  { value: "10K+", label: "Rides" },
  { value: "4.8", label: "Rating", icon: Star },
];

export default function Index() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const { data: shopsData } = useShops({ limit: 6 });
  const { data: vehiclesData } = useSearchVehicles({ is_available: "true", limit: 6 });

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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20">
      <SEO title="GoPanda — Best Bike Rentals Near Me in Guwahati" />
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-28 overflow-hidden flex items-center justify-center min-h-[80vh]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm text-sm font-medium text-slate-700 mb-4">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                Zero Platform Fees. Instant Bookings.
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 font-display leading-[1.1]">
                Best Bike & Car Rentals in Guwahati. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Instantly Booked.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Skip the hassle. Lock your ride with a small token advance (min. ₹299) directly to the shop owner and pay the rest at pickup.
              </p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              onSubmit={handleSearch}
              className="mt-12 bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 max-w-4xl mx-auto flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl border border-slate-100 focus-within:border-primary/30 focus-within:bg-white transition-colors">
                <MapPin className="text-slate-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Where are you going? (e.g. Guwahati)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 text-base placeholder:text-slate-400"
                />
              </div>

              <div className="flex-1 flex items-center gap-3 bg-slate-50/50 px-4 py-3 rounded-2xl border border-slate-100 focus-within:border-primary/30 focus-within:bg-white transition-colors">
                <Car className="text-slate-400 h-5 w-5" />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full border-0 bg-transparent focus:ring-0 text-base outline-none text-slate-700 cursor-pointer"
                >
                  <option value="">Any Vehicle</option>
                  <option value="scooty">Scooty</option>
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                </select>
              </div>

              <Button type="submit" size="lg" className="rounded-2xl h-auto py-4 px-8 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5">
                Search Vehicles <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-24 bg-white relative">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4">The Frictionless Flow</h2>
            <p className="text-slate-600 text-lg">Four simple steps to get you on the road. No hidden fees, no complicated paperwork.</p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-4 gap-8 relative"
          >
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent z-0" />

            {[
              { icon: Search, title: "Find a Ride", desc: "Browse verified local shops and check real-time availability." },
              { icon: Zap, title: "Pay Token Advance", desc: "Pay a small token (min. ₹299) directly via UPI to lock your dates instantly." },
              { icon: ShieldCheck, title: "Instant Confirm", desc: "Your ride is secured. The shop owner is notified instantly on WhatsApp." },
              { icon: Wallet, title: "Pay Balance & Ride", desc: "Pay the remaining amount directly at the shop when you pick up." }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <step.icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Popular Vehicles */}
      {popularBikes.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container px-4 space-y-10">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">Popular Bike & Car Rentals Near You</h2>
                <p className="text-slate-600 mt-2">Check out the most booked vehicles in your area.</p>
              </div>
              <Button variant="outline" className="font-display gap-1 rounded-full text-slate-700" onClick={() => navigate("/search-vehicles")}>
                Browse all <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {popularBikes.map((v, i) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <VehicleCard vehicle={v} priority={i < 4} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Shops */}
      {featuredShops.length > 0 && (
        <section className="py-20 bg-[#fbf9f5] border-t border-slate-100">
          <div className="container px-4 space-y-10">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="space-y-2">
                <p className="text-xs font-display uppercase tracking-[0.3em] text-slate-500">Trusted Partners</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">
                  Top-Rated Rental <span className="text-primary">Shops Near You</span>
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/shops")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                All shops <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredShops.map((shop, i) => (
                <motion.div key={shop.id ?? i} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/shops/${shop.id}`)}
                    className="w-full h-full flex flex-col text-left rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 overflow-hidden shrink-0">
                        {shop.image_url ? (
                          <img src={shop.image_url} alt={shop.name ? `${shop.name} - Bike Rental in Guwahati` : "Bike Rental Shop in Guwahati"} className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 truncate">{shop.name || "Partner Shop"}</h3>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
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
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. WHY CHOOSE US (Bento Box) */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display text-slate-900 mb-4">Built on Trust & Transparency</h2>
            <p className="text-slate-600 text-lg">We designed GoPanda to be the fairest platform for both riders and local businesses.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Box 1 */}
            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
              <div className="relative z-10 w-2/3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No Double Bookings</h3>
                <p className="text-slate-600">Our smart inventory tracking means if you book it, it's yours. Period.</p>
              </div>
              <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
            </motion.div>

            {/* Box 2 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Reviews</h3>
              <p className="text-slate-600 text-sm">Real feedback from actual renters. Know exactly what you're getting.</p>
            </motion.div>

            {/* Box 3 */}
            <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden relative group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Direct Connect</h3>
              <p className="text-slate-600 text-sm">WhatsApp magic links keep you and the shop owner in perfect sync.</p>
            </motion.div>

            {/* Box 4 */}
            <motion.div whileHover={{ y: -5 }} className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl overflow-hidden relative group text-white">
              <div className="relative z-10 w-2/3">
                <div className="w-12 h-12 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6 backdrop-blur-sm">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">0% Commission</h3>
                <p className="text-slate-300">We don't take a cut from your bookings. You pay the absolute best price, directly to the local business.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. PARTNER CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden text-center md:text-left">
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold font-display text-white mb-6 leading-tight">
                  Own a vehicle rental shop? Let's grow your business.
                </h2>
                <p className="text-primary-foreground/90 text-lg md:text-xl mb-8">
                  Get instant UPI payments, smart fleet management, and zero commission fees. Accept bookings right from your WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="secondary" className="rounded-full px-8 py-6 text-lg font-bold bg-white text-primary hover:bg-slate-50 transition-transform hover:-translate-y-1" onClick={() => navigate("/register")}>
                    Become a Partner
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg font-bold text-black border-white/30 hover:bg-white/10 transition-colors" onClick={() => navigate("/login")}>
                    Partner Login
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block relative w-72 h-72">
                <div className="absolute inset-0 border-4 border-white/20 rounded-full border-dashed animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-4 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                  <Store className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 text-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="font-display font-bold text-2xl text-slate-900 tracking-tight flex items-center gap-2">
                <span className="text-primary">Go</span>Panda
              </div>
              <p className="text-slate-500 pr-4">
                The easiest, fastest way to find <strong>bike rentals near me</strong> and <strong>car rentals in Guwahati</strong> from verified local shops. Built for riders and owners alike.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Explore</h4>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => navigate("/search-vehicles")} className="hover:text-primary transition-colors">Search Vehicles</button></li>
                <li><button onClick={() => navigate("/shops")} className="hover:text-primary transition-colors">Browse Shops</button></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Partners</h4>
              <ul className="space-y-2 text-slate-500">
                <li><button onClick={() => navigate("/register")} className="hover:text-primary transition-colors">Register Shop</button></li>
                <li><button onClick={() => navigate("/login")} className="hover:text-primary transition-colors">Shop Login</button></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Legal</h4>
              <ul className="space-y-2 text-slate-500">
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between text-slate-400">
            <p>© {new Date().getFullYear()} GoPanda. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Made with ❤️ in Assam for local businesses.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
