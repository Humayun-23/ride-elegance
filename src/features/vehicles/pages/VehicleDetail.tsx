import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { createBooking } from "@/features/bookings/services/bookingService";
import { getVehicleFullDetails } from "@/features/vehicles/services/vehicleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Gauge, Calendar, Info, Shield, Clock, CheckCircle2, Star, MessageSquare, ChevronRight, Phone, MapPinned, Bike, Car, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/common/SEO";
import { EmptyState } from "@/components/common/EmptyState";
import VehicleCard from "@/features/vehicles/components/VehicleCard";
import { buildWhatsAppUrl, cleanWhatsAppPhone } from "@/lib/phone";

const TYPE_ICON: Record<string, any> = {
  scooty: Bike,
  bike: Bike,
  car: Car,
  mountain: Bike,
  road: Bike,
  hybrid: Zap,
  electric: Zap,
};

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [startTimeVal, setStartTimeVal] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTimeVal, setEndTimeVal] = useState("09:00");

  const startTime = startDate && startTimeVal ? `${startDate}T${startTimeVal}` : "";
  const endTime = endDate && endTimeVal ? `${endDate}T${endTimeVal}` : "";
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        const res = await getVehicleFullDetails(id, {
          signal: controller.signal
        });
        if (!active) return;

        setVehicle(res.data.vehicle);
        setActiveImage(0);
        setAvailability(res.data.availability ?? null);
        setShop(res.data.shop ?? null);
        setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
      } catch (err: any) {
        if (!active || err.name === 'CanceledError' || err.message === 'canceled') return;
        setVehicle(null);
        setAvailability(null);
        setReviews([]);
        setShop(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [id]);

  const calculateTotalPrice = () => {
    if (!startTime || !endTime || !vehicle) return 0;
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (end <= start) return 0;
    const totalHours = Math.max((end - start) / (1000 * 60 * 60), 1);
    const fullDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours - (fullDays * 24);
    return Math.floor((fullDays * (vehicle.price_per_day || 0)) + (remainingHours * (vehicle.price_per_hour || 0)));
  };

  const totalPrice = calculateTotalPrice();
  const tokenAmount = totalPrice > 0 ? Math.max(299, Math.floor(totalPrice * 0.10)) : 299;
  const mapUrl = shop?.shop_location || shop?.googleMapsUrl || shop?.gmapLink || shop?.mapUrl || shop?.locationUrl || "";
  const contactShopUrl = shop?.phone_number ? `tel:${shop.phone_number.replace(/\\D/g, '')}` : "";

  const handleWhatsAppRedirect = (booking: any, vehicleName: string, shopPhone: string, customerName: string, waWindow: Window | null) => {
    // Use your real backend URL for the magic links
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://gopanda.in/api/v1";

    const confirmLink = `${apiUrl}/bookings/${booking.id}/magic-action?action=confirm&token=${booking.magic_token}`;
    const rejectLink = `${apiUrl}/bookings/${booking.id}/magic-action?action=reject&token=${booking.magic_token}`;

    const fromDate = new Date(booking.start_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const toDate = new Date(booking.end_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

    const message = `*--- NEW BOOKING REQUEST ---*
    
*Vehicle:* ${vehicleName}
*Customer:* ${customerName}
*From:* ${fromDate}
*To:* ${toDate}

*Payment Details:*
Token Received: *Rs.${booking.token_amount || 299}* 
Customer UTR Number: *${booking.utr_number}*
Balance to Collect at Shop: *Rs.${Math.max(0, (booking.total_price || 0) - (booking.token_amount || 299))}*

Please tap a link below to instantly Accept or Reject this booking:

[+] *TAP TO ACCEPT:*
${confirmLink}

[x] *TAP TO REJECT:*
${rejectLink}`;

    const cleanPhone = cleanWhatsAppPhone(shopPhone);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    if (waWindow) {
      waWindow.location.href = whatsappUrl;
    } else {
      window.location.href = whatsappUrl;
    }
  };

  const handleBook = async () => {
    if (!user) { navigate("/login"); return; }
    if (!startTime || !endTime) { toast({ title: "Select dates", variant: "destructive" }); return; }
    if (utrNumber.length !== 12) { toast({ title: "Please enter your 12-digit UTR number", variant: "destructive" }); return; }

    // Safari Popup Blocker Workaround: Open window synchronously *before* the await
    const waWindow = window.open('', '_blank');

    setBooking(true);
    try {
      const response = await createBooking({ bike_id: Number(id), start_time: startTime, end_time: endTime, utr_number: utrNumber });
      const newBooking = response.data;
      toast({ title: "Booking created!", description: "Check your bookings for status." });

      if (shop?.phone_number) {
        handleWhatsAppRedirect(newBooking, vehicle.name, shop.phone_number, user.firstname || "Customer", waWindow);
      } else if (waWindow) {
        waWindow.close();
      }

      if (waWindow) {
        navigate("/bookings");
      } else {
        setTimeout(() => navigate("/bookings"), 500);
      }
    } catch (err: any) {
      if (waWindow) waWindow.close();
      toast({ title: "Booking failed", description: err.message, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-6xl">
        <Skeleton className="h-8 w-24 mb-6 rounded-lg" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
            <div className="grid grid-cols-5 gap-2">
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="aspect-[4/3] rounded-xl" />
              <Skeleton className="aspect-[4/3] rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-5/6 rounded-sm" />
            <Skeleton className="h-64 w-full rounded-2xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
  if (!vehicle) return <EmptyState>Vehicle not found</EmptyState>;

  const images = Array.isArray(vehicle.image)
    ? vehicle.image.map((img: any) => img.image_url).filter(Boolean)
    : [];
  const heroImage = images[activeImage] || vehicle.image_url || "";

  // Build Product schema for this vehicle
  const vehicleSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.name}${vehicle.model ? ` ${vehicle.model}` : ''}`,
    description: vehicle.description || `Rent ${vehicle.name} in ${shop?.city || 'Guwahati'}`,
    image: heroImage || 'https://www.gopanda.in/og-image.png',
    brand: {
      '@type': 'Brand',
      name: vehicle.name?.split(' ')[0] || 'Vehicle',
    },
    offers: {
      '@type': 'Offer',
      price: vehicle.price_per_day || 0,
      priceCurrency: 'INR',
      availability: vehicle.is_available !== false
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `https://www.gopanda.in/bikes/${id}`,
      seller: shop ? {
        '@type': 'LocalBusiness',
        name: shop.name || 'GoPanda Partner Shop',
      } : undefined,
    },
  });

  return (
    <div className="overflow-x-hidden relative min-h-screen pt-24 pb-28 md:pb-16 w-full max-w-[100vw]">
      <SEO
        title={`Rent ${vehicle.name}${vehicle.model ? ` ${vehicle.model}` : ''} in ${shop?.city || 'Guwahati'} | GoPanda`}
        description={vehicle.description || `Rent ${vehicle.name} from ${shop?.name || 'a verified shop'} in ${shop?.city || 'Guwahati'}. ₹${vehicle.price_per_day || ''}/day. Book online with a small token.`}
        keywords={`rent ${vehicle.name}, ${vehicle.name} rental ${shop?.city || 'guwahati'}, ${vehicle.bike_type || 'vehicle'} rental near me`}
        canonical={`https://www.gopanda.in/bikes/${id}`}
        image={heroImage || undefined}
        schema={vehicleSchema}
      />
      <div className="container px-4 max-w-6xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[11px] md:text-xs font-display text-muted-foreground mb-6 uppercase tracking-wider overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to="/search-vehicles" className="hover:text-primary transition-colors">{(shop?.city || "Guwahati").toLowerCase()}</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to={`/search-vehicles?type=${vehicle.bike_type}`} className="hover:text-primary transition-colors">{vehicle.bike_type || "vehicles"}</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground font-semibold truncate max-w-[150px] md:max-w-none">{vehicle.name}</span>
        </nav>

        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden aspect-[4/3] relative">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={vehicle.name}
                  fetchpriority="high"
                  loading="eager"
                  decoding="sync"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary to-background">
                  {(() => {
                    const Icon = TYPE_ICON[vehicle.bike_type || ""] || Car;
                    return <Icon className="h-32 w-32 opacity-20" />;
                  })()}
                </div>
              )}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-display uppercase tracking-wider text-foreground border border-border/50 backdrop-blur">
                  {activeImage + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={`rounded-xl overflow-hidden border ${i === activeImage ? "border-primary" : "border-border/50"} bg-card/60 aspect-[4/3] hover:border-primary/50 transition-colors`}
                    aria-label={`View image ${i + 1}`}
                    type="button"
                  >
                    <img src={img} alt={`${vehicle.name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {vehicle.bike_type && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 font-display text-[10px] uppercase tracking-wider flex items-center gap-1.5 px-2 py-1">
                    {(() => {
                      const Icon = TYPE_ICON[vehicle.bike_type];
                      return Icon ? <Icon className="h-3.5 w-3.5" /> : null;
                    })()}
                    <span>{vehicle.bike_type}</span>
                  </Badge>
                )}
                {vehicle.condition && (
                  <Badge variant="outline" className="font-display capitalize text-[10px] uppercase tracking-wider">{vehicle.condition}</Badge>
                )}
                {vehicle.is_available === false && (
                  <Badge variant="destructive" className="font-display text-[10px]">Unavailable</Badge>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{vehicle.name}</h1>
              {vehicle.model && <p className="text-lg text-muted-foreground">{vehicle.model}</p>}

              <div className="flex items-center gap-4 flex-wrap">
                {vehicle.engine_cc && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-lg">
                    <Gauge className="h-4 w-4" />{vehicle.engine_cc}cc
                  </span>
                )}
              </div>

              {vehicle.description && (
                <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2 mt-2">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary/60" /> {vehicle.description}
                </p>
              )}
            </div>

            {/* Booking Card */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-baseline gap-6">
                  {/*vehicle.price_per_hour != null && (
                    <div>
                      <span className="text-primary font-display text-3xl font-bold">₹{vehicle.price_per_hour}</span>
                      <span className="text-muted-foreground text-sm">/hour</span>
                    </div> 
                  )*/}
                  {vehicle.price_per_day != null && (
                    <div>
                      <span className="text-foreground font-display text-xl font-bold">₹{vehicle.price_per_day}</span>
                      <span className="text-muted-foreground text-sm">/day</span>
                    </div>
                  )}
                </div>

                {availability && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-muted-foreground">
                      <span className="text-foreground font-display font-bold">{availability.available_count ?? 0}</span> of {availability.total_count ?? 0} available
                    </span>
                  </div>
                )}

                <Separator />

                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Pay a small token to lock the booking. The remaining amount is paid directly to the rental shop at pickup.
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Need help choosing a vehicle? Chat with GoPanda on WhatsApp.
                  </p>
                  <div className="grid gap-2 text-xs font-display text-muted-foreground sm:grid-cols-3">
                    <span className="rounded-lg bg-secondary/60 px-3 py-2 text-center">Token to confirm</span>
                    <span className="rounded-lg bg-secondary/60 px-3 py-2 text-center">Balance at pickup</span>
                    <span className="rounded-lg bg-secondary/60 px-3 py-2 text-center">Direct shop settlement</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-start-date" className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pickup
                    </Label>
                    <Input id="booking-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background rounded-xl h-12 text-base px-4 w-full" />
                    <Input id="booking-start-time" type="time" value={startTimeVal} onChange={(e) => setStartTimeVal(e.target.value)} className="bg-background rounded-xl h-10 text-sm px-4 w-full" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-end-date" className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Return
                    </Label>
                    <Input id="booking-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background rounded-xl h-12 text-base px-4 w-full" />
                    <Input id="booking-end-time" type="time" value={endTimeVal} onChange={(e) => setEndTimeVal(e.target.value)} className="bg-background rounded-xl h-10 text-sm px-4 w-full" />
                  </div>
                </div>

                {/* Direct UPI Payment Section */}
                {startTime && endTime && (
                  <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-4 mt-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Step 1: Pay Token Advance</Label>
                      <p className="text-[11px] text-muted-foreground">Secure your booking by paying a ₹{tokenAmount} token directly to the shop owner.</p>
                    </div>
                    <div className="flex items-center justify-between bg-background p-3 rounded-lg border border-border">
                      <span className="font-display font-bold text-lg text-primary">₹{tokenAmount}.00</span>
                      <Button asChild size="sm" className="font-display">
                        <a href={`upi://pay?pa=${shop?.upi_id || "default@upi"}&pn=${encodeURIComponent(shop?.name || "Shop Owner")}&am=${tokenAmount}.00&cu=INR&tn=${encodeURIComponent("GoPanda Token Advance")}`} target="_blank" rel="noopener noreferrer">
                          Pay via UPI App
                        </a>
                      </Button>
                    </div>
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="booking-utr-number" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Step 2: Enter 12-Digit UTR</Label>
                      <Input id="booking-utr-number" placeholder="e.g. 321456789012" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} maxLength={12} className="bg-background font-mono text-sm tracking-widest" />
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full font-display gap-2 rounded-xl ${utrNumber.length === 12 ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  size="lg"
                  onClick={handleBook}
                  disabled={booking || vehicle.is_available === false || utrNumber.length !== 12}
                >
                  <Calendar className="h-4 w-4" />
                  {booking ? "Booking..." : vehicle.is_available === false ? "Unavailable" : !startTime || !endTime ? "Select dates to book" : utrNumber.length !== 12 ? "Enter UTR to book" : "Book"}
                </Button>

                <div className="grid gap-2 sm:grid-cols-2">
                  {contactShopUrl && (
                    <Button asChild variant="outline" className="rounded-xl gap-2">
                      <a href={contactShopUrl} target="_blank" rel="noopener noreferrer">
                        <Phone className="h-4 w-4" /> Contact Shop
                      </a>
                    </Button>
                  )}
                  {mapUrl && (
                    <Button asChild className="rounded-xl gap-2 bg-emerald-500 hover:bg-emerald-600 text-white">
                      <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                        <MapPinned className="h-4 w-4" /> Locate Shop
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Reviews */}
        <div className="mt-12 space-y-5">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl md:text-2xl font-bold">Reviews</h2>
            <Badge variant="outline" className="font-display">{reviews.length}</Badge>
          </div>
          {reviews.length === 0 ? (
            <Card className="border-dashed border-border/50 bg-transparent">
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                No reviews yet. Reviews appear after a completed booking.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <Card key={r.id || i} className="border-border/30 bg-card/40">
                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-display font-medium">{r.user_name || r.customer_name || `User #${r.customer_id || r.user_id}`}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`h-3 w-3 ${j < (r.rating || 0) ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className={`grid gap-2 ${contactShopUrl && mapUrl ? "grid-cols-3" : contactShopUrl || mapUrl ? "grid-cols-2" : "grid-cols-1"}`}>
          <Button
            className="h-11 rounded-xl font-bold"
            onClick={handleBook}
            disabled={booking || vehicle.is_available === false || utrNumber.length !== 12}
          >
            <Calendar className="mr-1 h-4 w-4" />
            {booking ? "Booking..." : vehicle.is_available === false ? "Unavailable" : "Book"}
          </Button>
          {contactShopUrl && (
            <a
              href={contactShopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white px-2 text-xs font-bold text-foreground transition-colors hover:bg-secondary"
            >
              <Phone className="mr-1 h-4 w-4" /> Contact
            </a>
          )}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-500 px-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
            >
              <MapPinned className="mr-1 h-4 w-4" /> Locate
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
