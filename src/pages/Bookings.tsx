import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Calendar, Trash2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  confirmed: "bg-green-500/10 text-green-500 border-green-500/30",
  completed: "bg-primary/10 text-primary border-primary/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  returned: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.getUserBookings().then(setBookings).catch(() => setBookings([])).finally(() => setLoading(false));
  }, [user]);

  const cancelBooking = async (id: string) => {
    try {
      await api.deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Booking cancelled" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleString();
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 space-y-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          My <span className="text-gradient">Bookings</span>
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="rounded-lg border border-border bg-card h-24 animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No bookings yet.</p>
            <Button onClick={() => navigate("/search")} className="font-display">Browse Vehicles</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border bg-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-bold">{b.bike_name || `Booking #${String(b.id).slice(0, 8)}`}</h3>
                    <Badge variant="outline" className={STATUS_COLORS[b.status] || ""}>
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(b.start_time)} — {formatDate(b.end_time)}
                  </p>
                  {b.total_price && <p className="text-sm text-primary font-display font-bold">₹{b.total_price}</p>}
                </div>
                {(b.status === "pending") && (
                  <Button variant="outline" size="sm" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => cancelBooking(b.id)}>
                    <Trash2 className="h-4 w-4" /> Cancel
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
