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
import { ArrowLeft, Gauge, Calendar, Info } from "lucide-react";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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
    if (!startTime || !endTime) { toast({ title: "Select dates", variant: "destructive" }); return; }
    setBooking(true);
    try {
      await api.createBooking({ bike_id: Number(id), start_time: startTime, end_time: endTime });
      toast({ title: "Booking created!", description: "Check your bookings for status." });
      navigate("/bookings");
    } catch (err: any) {
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!vehicle) return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Vehicle not found</div>;

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
              <div className="flex h-full items-center justify-center text-muted-foreground font-display text-2xl bg-secondary capitalize">
                {vehicle.bike_type || "Vehicle"}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {vehicle.bike_type && <Badge className="bg-primary text-primary-foreground font-display uppercase tracking-wider">{vehicle.bike_type}</Badge>}
                {vehicle.condition && <Badge variant="outline" className="font-display capitalize">{vehicle.condition}</Badge>}
                {vehicle.is_available === false && <Badge variant="destructive" className="font-display">Unavailable</Badge>}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{vehicle.name}</h1>
              {vehicle.model && <p className="text-lg text-muted-foreground">{vehicle.model}</p>}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {vehicle.engine_cc && <span className="flex items-center gap-1"><Gauge className="h-4 w-4" />{vehicle.engine_cc}cc</span>}
              </div>
              {vehicle.description && (
                <p className="text-sm text-muted-foreground flex items-start gap-2 mt-2">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" /> {vehicle.description}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-baseline gap-4">
                {vehicle.price_per_hour != null && (
                  <div>
                    <span className="text-primary font-display text-3xl font-bold">₹{vehicle.price_per_hour}</span>
                    <span className="text-muted-foreground text-sm">/hour</span>
                  </div>
                )}
                {vehicle.price_per_day != null && (
                  <div>
                    <span className="text-primary font-display text-3xl font-bold">₹{vehicle.price_per_day}</span>
                    <span className="text-muted-foreground text-sm">/day</span>
                  </div>
                )}
              </div>

              {availability && (
                <p className="text-sm text-muted-foreground">
                  {availability.available_count ?? 0} of {availability.total_count ?? 0} available
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Time</Label>
                  <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="bg-background" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Time</Label>
                  <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="bg-background" />
                </div>
              </div>

              <Button className="w-full font-display gap-2" size="lg" onClick={handleBook} disabled={booking || vehicle.is_available === false}>
                <Calendar className="h-4 w-4" />
                {booking ? "Booking..." : vehicle.is_available === false ? "Unavailable" : "Book Now"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
