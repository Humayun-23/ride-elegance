import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, Shield, Clock, ArrowRight, MapPin, Star, ChevronRight } from "lucide-react";
import { useState } from "react";

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

  const handleSearch = () => {
    navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(45_100%_51%/0.08),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
        
        <div className="container relative z-10 text-center space-y-10 px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-display uppercase tracking-widest text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Now live in your city
            </div>
            <h1 className="font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95]">
              Ride <span className="text-gradient">Anything</span>,
              <br />
              Anywhere.
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              From scooties to cars — find, compare, and book vehicles near you in seconds. No hassle, no hidden fees.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex max-w-xl mx-auto gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, shops, locations..."
                className="pl-11 bg-card/80 border-border h-13 text-base backdrop-blur rounded-xl"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              size="lg"
              className="h-13 px-8 font-display rounded-xl glow"
              onClick={handleSearch}
            >
              Search
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center gap-4 md:gap-6 flex-wrap"
          >
            {VEHICLE_TYPES.map((t, i) => (
              <motion.button
                key={t.value}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/search?type=${t.value}`)}
                className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/60 backdrop-blur p-5 w-32 md:w-36 hover:border-primary/30 hover:glow transition-all"
              >
                <span className="text-3xl md:text-4xl">{t.icon}</span>
                <div>
                  <span className="text-sm font-display font-bold block">{t.label}</span>
                  <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1.5 rounded-full bg-muted-foreground/50"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-t border-border bg-card/30">
        <div className="container px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-gradient inline-flex items-center gap-1">
                  {s.value}
                  {s.icon && <s.icon className="h-5 w-5 text-primary fill-primary" />}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-display uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <p className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground">Why choose us</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Why <span className="text-gradient">GoPanda</span>?
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group rounded-2xl border border-border bg-card/50 p-8 md:p-10 space-y-5 hover:border-primary/20 hover:bg-card transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                <div className="relative">
                  <div className="inline-flex rounded-xl bg-primary/10 p-3.5 ring-1 ring-primary/20">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold relative">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed relative">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-card p-12 md:p-20 text-center space-y-8 relative overflow-hidden noise"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(45_100%_51%/0.06),transparent_70%)]" />
            <div className="relative z-10 space-y-8">
              <h2 className="font-display text-3xl md:text-5xl font-bold">
                Ready to <span className="text-gradient">ride</span>?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                Create a free account and start booking vehicles in your area today. No subscription needed.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  size="lg"
                  className="font-display gap-2 rounded-xl glow px-8"
                  onClick={() => navigate("/register")}
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-display gap-2 rounded-xl px-8"
                  onClick={() => navigate("/search")}
                >
                  Browse Vehicles
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-display font-bold text-foreground text-lg">
            <span className="text-gradient">GoPanda</span>
          </span>
          <div className="flex items-center gap-6">
            <a href="/search" className="hover:text-foreground transition-colors">Explore</a>
            <a href="/shops" className="hover:text-foreground transition-colors">Shops</a>
            <a href="/register" className="hover:text-foreground transition-colors">Sign Up</a>
          </div>
          <span>© {new Date().getFullYear()} GoPanda. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
