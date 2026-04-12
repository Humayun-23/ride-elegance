import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, Shield, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";

const VEHICLE_TYPES = [
  { label: "Cars", icon: "🚗", value: "car" },
  { label: "Bikes", icon: "🏍️", value: "bike" },
  { label: "Scooters", icon: "🛵", value: "scooter" },
  { label: "Bicycles", icon: "🚲", value: "bicycle" },
];

const FEATURES = [
  { icon: Zap, title: "Instant Booking", desc: "Reserve your ride in seconds with real-time availability" },
  { icon: Shield, title: "Fully Insured", desc: "Every rental comes with comprehensive coverage" },
  { icon: Clock, title: "24/7 Access", desc: "Pick up and drop off on your schedule" },
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
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(45_100%_51%/0.08),transparent_60%)]" />
        <div className="container relative z-10 text-center space-y-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Ride <span className="text-gradient">Anything</span>,<br />
              Anywhere.
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
              From cars to scooters — find and book vehicles near you in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex max-w-lg mx-auto gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles, locations..."
                className="pl-10 bg-card border-border h-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button size="lg" className="h-12 px-6 font-display" onClick={handleSearch}>
              Search
            </Button>
          </motion.div>

          {/* Vehicle types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            {VEHICLE_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => navigate(`/search?type=${t.value}`)}
                className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 w-24 hover:border-glow hover:glow transition-all"
              >
                <span className="text-2xl">{t.icon}</span>
                <span className="text-xs font-display text-muted-foreground">{t.label}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border">
        <div className="container px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
            Why <span className="text-gradient">RIDEX</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="rounded-lg border border-border bg-card p-8 space-y-4 hover:border-glow transition-all"
              >
                <div className="inline-flex rounded-md bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container px-4">
          <div className="rounded-2xl border border-border bg-card p-12 md:p-16 text-center space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(45_100%_51%/0.06),transparent_60%)]" />
            <h2 className="font-display text-3xl md:text-4xl font-bold relative z-10">
              Ready to <span className="text-gradient">ride</span>?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto relative z-10">
              Create an account and start booking vehicles in your area today.
            </p>
            <Button size="lg" className="font-display relative z-10 gap-2" onClick={() => navigate("/register")}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-display font-bold text-foreground">RIDEX</span>
          <span>© {new Date().getFullYear()} RIDEX. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
