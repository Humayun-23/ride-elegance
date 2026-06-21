import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, FileText, Calendar, Car, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;
  const vehicle = location.state?.vehicle;
  const shop = location.state?.shop;

  useEffect(() => {
    if (!booking) {
      navigate("/bookings", { replace: true });
      return;
    }

    // Fire confetti on load!
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#3b82f6', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [booking, navigate]);

  if (!booking) return null;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-500 mb-4 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground">Booking Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          Your booking <span className="font-mono text-primary font-bold">#{booking.id}</span> has been received. A confirmation email has been sent to you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-display font-semibold text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Booking Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Vehicle</p>
                  <p className="font-semibold text-foreground">{vehicle?.name || "Your Vehicle"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-display">Dates</p>
                  <p className="font-medium text-foreground text-sm">
                    {new Date(booking.start_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    <br />
                    to {new Date(booking.end_time).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-display font-semibold text-xl flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> What happens next?
            </h3>
            
            <ol className="relative border-l border-primary/30 ml-3 space-y-6">                  
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-4 ring-background text-primary text-xs font-bold">1</span>
                <h4 className="font-semibold text-foreground text-sm">Shop Confirmation</h4>
                <p className="text-xs text-muted-foreground mt-1">The shop owner has been notified and will confirm your booking shortly.</p>
              </li>
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-4 ring-background text-primary text-xs font-bold">2</span>
                <h4 className="font-semibold text-foreground text-sm">Coordinate on WhatsApp</h4>
                <p className="text-xs text-muted-foreground mt-1">We've sent a WhatsApp message to the shop. You can chat with them to ask for directions or vehicle details.</p>
              </li>
              <li className="pl-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-primary/20 rounded-full -left-3 ring-4 ring-background text-primary text-xs font-bold">3</span>
                <h4 className="font-semibold text-foreground text-sm">Pick up your ride</h4>
                <p className="text-xs text-muted-foreground mt-1">Visit {shop?.name || "the shop"} at the scheduled time, pay the balance, and ride away!</p>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button asChild size="lg" className="rounded-xl font-display font-medium px-8">
          <Link to={`/bookings/${booking.id}`}>
            View Booking Details <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl font-display font-medium px-8">
          <Link to="/">
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
