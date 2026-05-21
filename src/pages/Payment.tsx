import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Shield,
  Lock,
  Calendar,
  Clock,
  Timer,
  CheckCircle2,
  Bike,
} from "lucide-react";

export default function Payment() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!bookingId) return;
    api
      .get(`/bookings/${bookingId}`)
      .then((res) => setBooking(res.data))
      .catch(() => {
        toast({ title: "Booking not found", variant: "destructive" });
        navigate("/bookings");
      })
      .finally(() => setLoading(false));
  }, [user, bookingId]);

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
    if (hours < 24) return `${hours} hours`;
    const days = Math.floor(hours / 24);
    const rem = hours % 24;
    return rem > 0 ? `${days} days ${rem} hours` : `${days} days`;
  };

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    if (!bookingId || !booking) return;
    setProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error("Unable to load payment gateway");
      }

      const order = (await api.post("/payments/", { booking_id: Number(bookingId) })).data;
      const razorpay = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "RideWheel",
        description: `Booking #${booking.id}`,
        order_id: order.order_id,
        prefill: {
          name: user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : undefined,
          email: user?.email,
          contact: user?.phone_number,
        },
        notes: {
          booking_id: String(booking.id),
        },
        theme: {
          color: "#0f766e",
        },
        handler: async (response: any) => {
          await api.post("/payments/verify", {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast({ title: "Payment successful", description: "Your booking is now paid." });
          navigate("/bookings");
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
      });
      razorpay.open();
    } catch (err: any) {
      setProcessing(false);
      toast({
        title: "Payment failed",
        description: err.message || "Unable to start payment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">
        Booking not found
      </div>
    );
  }

  const total = booking.total_price || 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/bookings")}
          className="mb-6 gap-2 text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Bookings
        </Button>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground font-display uppercase tracking-widest mb-1">
            Checkout
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Complete <span className="text-gradient">Payment</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment Gateway */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 space-y-6"
            >
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="p-6 space-y-5">
                  <h2 className="font-display font-bold text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Razorpay Checkout
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Complete payment securely with card, UPI, wallet, or netbanking. Payment details are handled by Razorpay.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {["Card", "UPI", "Netbanking"].map((method) => (
                      <div key={method} className="rounded-lg border border-border bg-secondary/40 p-4 text-center text-sm font-display">
                        {method}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            {/* Security Notice */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
              <Lock className="h-4 w-4 shrink-0" />
              <p>
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>

            {/* Pay Button */}
            <Button
              size="lg"
              className="w-full font-display gap-2 text-base glow"
              onClick={handlePayment}
              disabled={processing || booking.status !== "confirmed"}
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  {booking.status === "paid" ? "Paid" : `Pay ₹${total}`}
                </>
              )}
            </Button>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/50 bg-card/80 backdrop-blur sticky top-28">
              <CardContent className="p-6 space-y-5">
                <h2 className="font-display font-bold text-lg">Order Summary</h2>

                {/* Vehicle info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bike className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm">
                      {booking.bike_name || `Vehicle #${booking.bike_id}`}
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-1 font-display uppercase tracking-wider">
                      {booking.status}
                    </Badge>
                  </div>
                </div>

                {/* Booking details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {formatDate(booking.start_time)} — {formatDate(booking.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Timer className="h-3.5 w-3.5" />
                    <span>{getDuration(booking.start_time, booking.end_time)}</span>
                  </div>
                </div>

                <Separator />

                {/* Price breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-base">
                    <span className="font-display font-bold">Total</span>
                    <span className="font-display font-bold text-primary text-xl">₹{total}</span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {[
                    { icon: Shield, label: "Secure" },
                    { icon: Lock, label: "Encrypted" },
                    { icon: CheckCircle2, label: "Verified" },
                  ].map((badge) => (
                    <div
                      key={badge.label}
                      className="flex flex-col items-center gap-1 text-muted-foreground"
                    >
                      <badge.icon className="h-4 w-4" />
                      <span className="text-[9px] font-display uppercase tracking-wider">
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
