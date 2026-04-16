import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
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
      .getBooking(bookingId)
      .then(setBooking)
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

  const handlePayment = async () => {
    setProcessing(true);
    // TODO: Integrate actual payment gateway here
    // Simulate processing delay for now
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Payment integration pending",
        description: "Payment gateway will be connected soon. Your booking is confirmed.",
      });
      navigate("/bookings");
    }, 2000);
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

  const subtotal = booking.total_price || 0;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

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
          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* Payment Method Toggle */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-6 space-y-5">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Method
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {(["card", "upi"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-4 rounded-lg border-2 transition-all text-center font-display text-sm uppercase tracking-wider ${
                        paymentMethod === method
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground/30"
                      }`}
                    >
                      {method === "card" ? "💳 Card" : "📱 UPI"}
                    </button>
                  ))}
                </div>

                <Separator />

                {paymentMethod === "card" ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                        Card Number
                      </Label>
                      <Input
                        placeholder="4242 4242 4242 4242"
                        className="bg-background font-mono"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                          Expiry
                        </Label>
                        <Input placeholder="MM/YY" className="bg-background font-mono" maxLength={5} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                          CVV
                        </Label>
                        <Input
                          placeholder="•••"
                          type="password"
                          className="bg-background font-mono"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                        Name on Card
                      </Label>
                      <Input placeholder="John Doe" className="bg-background" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">
                        UPI ID
                      </Label>
                      <Input placeholder="yourname@upi" className="bg-background" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You'll receive a payment request on your UPI app after clicking Pay.
                    </p>
                  </div>
                )}
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
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Pay ₹{total}
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-display font-bold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="font-display font-bold">₹{tax}</span>
                  </div>
                  <Separator />
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
