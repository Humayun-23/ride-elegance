import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Trash2,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  Bike,
  CheckCircle2,
  XCircle,
  Timer,
  RotateCcw,
  AlertCircle,
  Filter,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    icon: <Timer className="h-3.5 w-3.5" />,
    label: "Pending",
  },
  confirmed: {
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Confirmed",
  },
  completed: {
    color: "bg-primary/10 text-primary border-primary/30",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Completed",
  },
  rejected: {
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: "Rejected",
  },
  returned: {
    color: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    icon: <RotateCcw className="h-3.5 w-3.5" />,
    label: "Returned",
  },
  cancelled: {
    color: "bg-muted text-muted-foreground border-border",
    icon: <XCircle className="h-3.5 w-3.5" />,
    label: "Cancelled",
  },
};

const FILTER_TABS = ["all", "pending", "confirmed", "completed", "returned"] as const;

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api
      .getUserBookings()
      .then(setBookings)
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user]);

  const cancelBooking = async (id: string) => {
    setCancellingId(id);
    try {
      await api.deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Booking cancelled successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: string, end: string) => {
    if (!start || !end) return "";
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.round(ms / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const rem = hours % 24;
    return rem > 0 ? `${days}d ${rem}h` : `${days}d`;
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length,
    completed: bookings.filter((b) => ["completed", "returned"].includes(b.status)).length,
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-display uppercase tracking-widest mb-1">
              Dashboard
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              My <span className="text-gradient">Bookings</span>
            </h1>
          </div>
          <Button
            onClick={() => navigate("/search")}
            className="font-display gap-2 glow"
          >
            <Bike className="h-4 w-4" /> Book a Ride
          </Button>
        </div>

        {/* Stats */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Bookings", value: stats.total, icon: Calendar },
              { label: "Active", value: stats.active, icon: Timer },
              { label: "Completed", value: stats.completed, icon: CheckCircle2 },
            ].map((s) => (
              <Card key={s.label} className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && bookings.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-display uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card h-32 animate-pulse"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 space-y-6"
          >
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold">No bookings yet</h2>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Browse our collection of vehicles and book your first ride today.
              </p>
            </div>
            <Button
              onClick={() => navigate("/search")}
              size="lg"
              className="font-display gap-2 glow"
            >
              <Bike className="h-4 w-4" /> Explore Vehicles
            </Button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No {filter} bookings found.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filtered.map((b, i) => {
                const status = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                return (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="border-border/50 bg-card/80 backdrop-blur hover:border-primary/20 transition-colors group">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Left: Status stripe */}
                          <div
                            className={`w-full md:w-1.5 h-1.5 md:h-auto rounded-t-lg md:rounded-l-lg md:rounded-tr-none ${
                              b.status === "confirmed"
                                ? "bg-emerald-500"
                                : b.status === "pending"
                                ? "bg-amber-500"
                                : b.status === "completed"
                                ? "bg-primary"
                                : b.status === "returned"
                                ? "bg-sky-500"
                                : "bg-muted-foreground"
                            }`}
                          />

                          <div className="flex-1 p-5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              {/* Booking info */}
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <h3 className="font-display font-bold text-lg">
                                    {b.bike_name || `Booking #${String(b.id).slice(0, 8)}`}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className={`${status.color} gap-1 font-display text-[10px] uppercase tracking-wider`}
                                  >
                                    {status.icon}
                                    {status.label}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {formatDate(b.start_time)}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {formatTime(b.start_time)} — {formatTime(b.end_time)}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <Timer className="h-3.5 w-3.5" />
                                    {getDuration(b.start_time, b.end_time)}
                                  </span>
                                  {b.shop_name && (
                                    <span className="flex items-center gap-1.5">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {b.shop_name}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right side: Price + Actions */}
                              <div className="flex items-center gap-4">
                                {b.total_price != null && (
                                  <div className="text-right">
                                    <p className="text-2xl font-display font-bold text-primary">
                                      ₹{b.total_price}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                      Total
                                    </p>
                                  </div>
                                )}

                                <Separator orientation="vertical" className="h-10 hidden md:block" />

                                <div className="flex items-center gap-2">
                                  {b.status === "confirmed" && (
                                    <Button
                                      size="sm"
                                      className="font-display gap-1.5 text-xs"
                                      onClick={() => navigate(`/payment/${b.id}`)}
                                    >
                                      <CreditCard className="h-3.5 w-3.5" />
                                      Pay Now
                                    </Button>
                                  )}
                                  {b.status === "pending" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 font-display"
                                      onClick={() => cancelBooking(b.id)}
                                      disabled={cancellingId === b.id}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      {cancellingId === b.id ? "..." : "Cancel"}
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground"
                                    onClick={() => navigate(`/vehicles/${b.bike_id || b.id}`)}
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
