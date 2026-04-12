import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Fuel, Calendar } from "lucide-react";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getBike(id),
      api.getAvailableInventory(id).catch(() => null),
    ]).then(([bike, avail]) => {
      setVehicle(bike);
      setAvailability(avail);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!startDate || !endDate) { toast({ title: "Select dates", variant: "destructive" }); return; }
    setBooking(true);
    try {
      await api.createBooking({ bike_id: id, start_date: startDate, end_date: endDate });
      toast({ title: "Booking created!", description: "Check your bookings for status." });
      navigate("/bookings");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!vehicle) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Vehicle not found</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-lg border border-border bg-card overflow-hidden aspect-[4/3]">
            {vehicle.image_url ? (
              <img src={vehicle.image_url} alt={vehicle.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground font-display text-2xl bg-secondary">
                {vehicle.type || "Vehicle"}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              {vehicle.type && <Badge className="bg-primary text-primary-foreground font-display uppercase tracking-wider">{vehicle.type}</Badge>}
              <h1 className="font-display text-3xl md:text-4xl font-bold">{vehicle.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {vehicle.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{vehicle.location}</span>}
                {vehicle.fuel_type && <span className="flex items-center gap-1"><Fuel className="h-4 w-4" />{vehicle.fuel_type}</span>}
              </div>
            </div>

            {vehicle.description && <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>}

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-primary font-display text-3xl font-bold">
                  ${vehicle.price_per_hour || vehicle.price_per_day || "—"}
                </span>
                <span className="text-muted-foreground text-sm">/{vehicle.price_per_hour ? "hour" : "day"}</span>
              </div>

              {availability && (
                <p className="text-sm text-muted-foreground">
                  {availability.available_count || availability.quantity || 0} available
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date</Label>
                  <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background" />
                </div>
              </div>

              <Button className="w-full font-display gap-2" size="lg" onClick={handleBook} disabled={booking}>
                <Calendar className="h-4 w-4" />
                {booking ? "Booking..." : "Book Now"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
