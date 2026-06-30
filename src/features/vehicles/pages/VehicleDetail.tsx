import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { createBooking } from "@/features/bookings/services/bookingService";
import { getVehicleFullDetails } from "@/features/vehicles/services/vehicleService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Gauge, Calendar, Info, Shield, Clock, CheckCircle2, Star, MessageSquare, ChevronRight, Phone, MapPinned, Bike, Car, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/common/SEO";
import { EmptyState } from "@/components/common/EmptyState";
import VehicleCard from "@/features/vehicles/components/VehicleCard";
import { buildWhatsAppUrl } from "@/lib/phone";
import { QRCodeSVG } from "qrcode.react";

const TYPE_ICON: Record<string, any> = {
  scooty: Bike,
  bike: Bike,
  car: Car,
  mountain: Bike,
  road: Bike,
  hybrid: Zap,
  electric: Zap,
};

const getDefaultPickupDateTime = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 1);

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

const formatTime12 = (time: string) => {
  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  if (!time || Number.isNaN(hour) || !minuteText) return "";
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteText} ${period}`;
};

const buildUpiPaymentUrl = ({
  upiId,
  payeeName,
  amount,
  reference,
}: {
  upiId: string;
  payeeName: string;
  amount: number;
  reference: string;
}) => {
  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: payeeName || "Shop Owner",
    am: amount.toFixed(2),
    cu: "INR",
    tn: "GoPanda Token Advance",
    tr: reference,
  });

  return `upi://pay?${params.toString()}`;
};

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const searchParams = new URLSearchParams(window.location.search);
  const [defaultPickup] = useState(getDefaultPickupDateTime);
  const [startDate, setStartDate] = useState(searchParams.get("pickup_date") || defaultPickup.date);
  const [startTimeVal, setStartTimeVal] = useState(defaultPickup.time);
  const [endDate, setEndDate] = useState(searchParams.get("return_date") || "");
  const [endTimeVal, setEndTimeVal] = useState(defaultPickup.time);

  const startTime = startDate && startTimeVal ? `${startDate}T${startTimeVal}` : "";
  const endTime = endDate && endTimeVal ? `${endDate}T${endTimeVal}` : "";
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{
    confirmationState: { booking: any; vehicle: any; shop: any };
    whatsappUrl: string;
  } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const getBookingRangeError = () => {
    if (!startTime || !endTime) return "";
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Select valid pickup and return times.";
    if (start < new Date()) return "Pickup time must be in the future.";
    if (end <= start) return "Return time must be after pickup time.";
    if (end.getTime() - start.getTime() < 60 * 60 * 1000) return "Booking must be at least 1 hour.";
    if (end.getTime() - start.getTime() > 30 * 24 * 60 * 60 * 1000) return "Booking cannot exceed 30 days.";
    return "";
  };

  const totalPrice = calculateTotalPrice();
  const bookingRangeError = getBookingRangeError();
  const tokenAmount = totalPrice > 0 ? Math.max(299, Math.floor(totalPrice * 0.10)) : 299;
  const balanceAmount = totalPrice > 0 ? totalPrice - tokenAmount : 0;
  const upiReference = `GP${id || vehicle?.id || "TOKEN"}${startTime.replace(/\D/g, "")}${endTime.replace(/\D/g, "")}`.slice(0, 35);
  const upiPaymentUrl = shop?.upi_id
    ? buildUpiPaymentUrl({
      upiId: shop.upi_id,
      payeeName: shop.name || "Shop Owner",
      amount: tokenAmount,
      reference: upiReference,
    })
    : "";
  const mapUrl = shop?.shop_location || shop?.googleMapsUrl || shop?.gmapLink || shop?.mapUrl || shop?.locationUrl || "";
  const contactShopUrl = shop?.phone_number ? `tel:${shop.phone_number.replace(/\D/g, '')}` : "";

  const formattedStart = startTime ? new Date(startTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
  const formattedEnd = endTime ? new Date(endTime).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  const buildBookingWhatsAppUrl = (booking: any, vehicleName: string, shopPhone: string, customerName: string) => {
    const apiUrl = (import.meta.env.VITE_API_BASE_URL || "https://gopanda.in/api/v1").replace(/\/$/, "");

    const confirmLink = `${apiUrl}/bookings/${booking.id}/magic-action?action=accept&token=${booking.magic_token}`;
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

This booking is already confirmed. The accept link is only a placeholder.
If the UTR is fake or the payment was not received, tap reject to cancel it:

[+] *ACCEPT PLACEHOLDER:*
${confirmLink}

[x] *TAP TO REJECT:*
${rejectLink}`;

    return buildWhatsAppUrl(shopPhone, message);
  };

  const handleBook = async () => {
    const showBookingError = (message: string) => {
      window.alert(message);
      toast({ title: message, variant: "destructive" });
    };

    if (!user) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!startTime || !endTime) { showBookingError("Select pickup and return dates."); return; }
    if (bookingRangeError) { showBookingError(bookingRangeError); return; }
    if (utrNumber.length !== 12) { showBookingError("Please enter your 12-digit UTR number."); return; }

    setBooking(true);
    try {
      const response = await createBooking({ bike_id: Number(id), start_time: startTime, end_time: endTime, utr_number: utrNumber });
      const newBooking = response.data;
      const confirmationState = { booking: newBooking, vehicle, shop };
      const whatsappUrl = shop?.phone_number
        ? buildBookingWhatsAppUrl(newBooking, vehicle.name, shop.phone_number, user.firstname || "Customer")
        : "";
      sessionStorage.setItem("latest_booking_confirmation", JSON.stringify(confirmationState));
      setBookingDialogOpen(false);
      setBookingSuccess({ confirmationState, whatsappUrl });
      toast({ title: "Booking confirmed!", description: "Send the details to the shop owner for faster verification." });
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message;
      window.alert(`Booking failed: ${detail}`);
      toast({ title: "Booking failed", description: detail, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  const sendBookingDetailsToShop = () => {
    if (!bookingSuccess) return;
    if (bookingSuccess.whatsappUrl) {
      window.location.assign(bookingSuccess.whatsappUrl);
      return;
    }
    navigate("/bookings/confirmation", { state: bookingSuccess.confirmationState });
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
    image: heroImage || 'https://www.gopanda.in/og-image-1.png',
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
      <Dialog open={Boolean(bookingSuccess)} onOpenChange={(open) => { if (!open) setBookingSuccess(null); }}>
        <DialogContent className="sm:max-w-md overflow-hidden border-border/60 bg-background p-0 shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-50 via-background to-primary/10 px-6 pt-7 pb-5 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogHeader className="space-y-2 text-center">
              <DialogTitle className="font-display text-2xl text-foreground">Booking confirmed</DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Your booking is confirmed. Send your details to the shop owner to speed up verification.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 pb-6">
            <div className="rounded-xl border border-border/60 bg-card/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Faster shop verification</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The message includes your booking details, UTR, and the reject link for fake-payment protection.
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="h-12 w-full rounded-xl bg-emerald-600 font-display text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
              onClick={sendBookingDetailsToShop}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send details to shop owner
            </Button>

            <Button
              variant="ghost"
              className="h-10 w-full rounded-xl text-xs font-semibold text-muted-foreground"
              onClick={() => {
                if (!bookingSuccess) return;
                navigate("/bookings/confirmation", { state: bookingSuccess.confirmationState });
              }}
            >
              View booking confirmation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
                  fetchPriority="high"
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
                    className={`rounded-xl overflow-hidden border ${i === activeImage ? "border-primary" : "border-border/50"} bg-card/60 aspect-square md:aspect-[4/3] min-h-[44px] hover:border-primary/50 transition-colors`}
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

              <div className="flex flex-wrap gap-2 pt-1 pb-2">
                <button onClick={() => document.getElementById('booking-form-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] text-primary bg-primary/10 px-3 py-1.5 rounded-full font-semibold hover:bg-primary/20 transition-colors border border-primary/20">Jump to Booking</button>
                <button onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[11px] text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-full font-semibold hover:bg-secondary transition-colors border border-border">Jump to Reviews</button>
              </div>

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

                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Estimated Total</span>
                    <span className="text-xl font-display font-bold text-primary">₹{totalPrice}</span>
                  </div>
                  <div className="grid gap-2 text-xs font-display text-muted-foreground sm:grid-cols-2">
                    <div className="rounded-lg bg-secondary/60 px-3 py-2 flex items-center justify-between">
                      <span>Token Advance:</span>
                      <span className="font-bold text-foreground">₹{tokenAmount}</span>
                    </div>
                    <div className="rounded-lg bg-secondary/60 px-3 py-2 flex items-center justify-between">
                      <span>Balance at Shop:</span>
                      <span className="font-bold text-foreground">₹{balanceAmount}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed text-center px-2">
                    Pay the token now to lock your dates. The balance is paid directly to the rental shop at pickup.
                  </p>
                </div>

                <div id="booking-form-section" className="grid grid-cols-1 sm:grid-cols-2 gap-3 scroll-mt-28">
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-start-date" className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pickup
                    </Label>
                    <Input id="booking-start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background rounded-xl h-12 text-base px-4 w-full" />
                    <div className="relative">
                      <Input id="booking-start-time" type="time" value={startTimeVal} onChange={(e) => setStartTimeVal(e.target.value)} className="bg-background rounded-xl h-10 text-sm px-4 w-full text-transparent caret-transparent" />
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-foreground">{formatTime12(startTimeVal)}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-end-date" className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Return
                    </Label>
                    <Input id="booking-end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background rounded-xl h-12 text-base px-4 w-full" />
                    <div className="relative">
                      <Input id="booking-end-time" type="time" value={endTimeVal} onChange={(e) => setEndTimeVal(e.target.value)} className="bg-background rounded-xl h-10 text-sm px-4 w-full text-transparent caret-transparent" />
                      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-foreground">{formatTime12(endTimeVal)}</span>
                    </div>
                  </div>
                </div>
                {bookingRangeError && (
                  <p className="text-xs font-medium text-destructive">{bookingRangeError}</p>
                )}

                {/* Modal Trigger & Payment Flow */}
                <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full font-display gap-2 rounded-xl"
                      size="lg"
                      disabled={booking || vehicle.is_available === false || !startTime || !endTime || Boolean(bookingRangeError)}
                    >
                      <Calendar className="h-4 w-4" />
                      {vehicle.is_available === false ? "Unavailable" : !startTime || !endTime ? "Select dates to book" : bookingRangeError ? "Fix booking time" : "Review Booking"}
                    </Button>
                  </DialogTrigger>

                  {startTime && endTime && (
                    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl">Review Booking</DialogTitle>
                        <DialogDescription>
                          Verify your dates and complete the token payment to confirm your ride.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-2">
                        {/* Summary Box */}
                        <div className="bg-secondary/40 rounded-xl p-3 text-sm border border-border/50">
                          <div className="font-semibold text-foreground mb-2 flex items-center justify-between">
                            <span>{vehicle.name}</span>
                            <span className="text-primary font-bold">₹{totalPrice} Total</span>
                          </div>
                          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">Pickup:</span>
                            <span>{formattedStart}</span>
                            <span className="font-medium text-foreground">Return:</span>
                            <span>{formattedEnd}</span>
                            <span className="font-medium text-foreground">Token:</span>
                            <span className="text-foreground font-bold">₹{tokenAmount} (Pay Now)</span>
                            <span className="font-medium text-foreground">Balance:</span>
                            <span>₹{balanceAmount} (Pay at Shop)</span>
                          </div>
                        </div>

                        {/* Payment Box */}
                        <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 space-y-4">
                          {shop?.upi_id ? (
                            <>
                              <div className="space-y-1">
                                <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Step 1: Pay Token</Label>
                              </div>

                              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background p-3 rounded-lg border border-border">
                                <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                                  <span className="font-display font-bold text-2xl text-primary">₹{tokenAmount}.00</span>
                                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Scan or Click to Pay</span>
                                </div>

                                {/* Desktop QR Code */}
                                <div className="hidden md:block bg-white p-2 rounded-xl shadow-sm border border-slate-100 shrink-0">
                                  <QRCodeSVG
                                    value={upiPaymentUrl}
                                    size={90}
                                    level="L"
                                  />
                                </div>

                                {/* Mobile Deep Link */}
                                <div className="md:hidden w-full">
                                  <Button asChild size="lg" className="w-full font-display">
                                    <a href={upiPaymentUrl} target="_blank" rel="noopener noreferrer">
                                      Pay via UPI App
                                    </a>
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2 pt-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="booking-utr-number" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Step 2: Enter 12-Digit UTR</Label>
                                  <div className="group relative">
                                    <span className="text-[10px] text-primary underline decoration-primary/30 underline-offset-2 cursor-help">Where to find UTR?</span>
                                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-50">
                                      <p className="font-bold mb-1 border-b border-white/20 pb-1">Where is my 12-digit UTR/Ref Number?</p>
                                      <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-300">
                                        <li><strong className="text-white">GPay:</strong> Open transaction history → "UPI transaction ID"</li>
                                        <li><strong className="text-white">PhonePe:</strong> Open history → "UTR" under transfer details</li>
                                        <li><strong className="text-white">Paytm:</strong> Open history → "UPI Ref No"</li>
                                      </ul>
                                      <div className="absolute -bottom-1 right-4 w-2 h-2 bg-slate-900 rotate-45"></div>
                                    </div>
                                  </div>
                                </div>
                                <Input id="booking-utr-number" placeholder="e.g. 321456789012" value={utrNumber} onChange={(e) => setUtrNumber(e.target.value)} maxLength={12} className="bg-background font-mono text-sm tracking-widest" />
                              </div>
                            </>
                          ) : (
                            <div className="text-center p-4">
                              <Phone className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                              <h4 className="font-bold text-foreground mb-1">Online Booking Unavailable</h4>
                              <p className="text-xs text-muted-foreground mb-4">This shop hasn't set up their UPI payment ID yet. Please contact them directly to reserve this vehicle.</p>
                              {contactShopUrl && (
                                <Button asChild className="w-full rounded-xl" variant="outline">
                                  <a href={contactShopUrl} target="_blank" rel="noopener noreferrer">
                                    Contact Shop via WhatsApp
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-[10px] text-muted-foreground text-center">
                          By confirming, you agree to our <a href="/terms" target="_blank" className="underline">Cancellation Policy</a> (Full refund if canceled 24hrs before pickup).
                        </p>
                      </div>

                      <DialogFooter>
                        {shop?.upi_id && (
                          <Button
                            className={`w-full font-display gap-2 rounded-xl ${utrNumber.length === 12 ? "bg-primary text-primary-foreground" : ""}`}
                            size="lg"
                            onClick={handleBook}
                            disabled={booking || utrNumber.length !== 12}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {booking ? "Confirming..." : utrNumber.length !== 12 ? "Enter UTR to confirm" : "Confirm Booking"}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  )}
                </Dialog>

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
        <div id="reviews-section" className="mt-12 space-y-5 scroll-mt-28">
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
            onClick={() => {
              const el = document.getElementById('booking-form-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            disabled={vehicle.is_available === false}
          >
            <Calendar className="mr-1 h-4 w-4" />
            {vehicle.is_available === false ? "Unavailable" : "Book Now"}
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
