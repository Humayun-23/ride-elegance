import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  cancelBookingById,
  getBooking,
  getBookingBike,
  getPaymentByBooking,
  requestBookingRefund,
  submitBookingReview,
  updateBooking,
} from "@/features/bookings/services/bookingService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/common/EmptyState";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, CreditCard, Trash2, Bike, Timer,
  CheckCircle2, XCircle, RotateCcw, Star, Send, Pencil, Save,
} from "lucide-react";

const STATUS_STEPS = ["pending", "confirmed", "paid", "completed"] as const;

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  paid: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  completed: "bg-primary/10 text-primary border-primary/30",
  returned: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  refund_pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  refunded: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<any>(null);
  const [bike, setBike] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!id) return;
    getBooking(id).then(async (res) => {
      const b = res.data;
      setBooking(b);
      setStartTime(b.start_time?.slice(0, 16) || "");
      setEndTime(b.end_time?.slice(0, 16) || "");
      if (b.bike_id) {
        try { setBike((await getBookingBike(b.bike_id)).data); } catch {}
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id, user]);

  const fmt = (d?: string) => d ? new Date(d).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  }) : "—";

  const saveEdits = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = (await updateBooking(id, { start_time: startTime, end_time: endTime })).data;
      setBooking(updated);
      setEditing(false);
      toast({ title: "Booking updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const cancelBooking = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      await cancelBookingById(id);
      toast({ title: "Booking cancelled" });
      navigate("/bookings");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setCancelling(false); }
  };

  const requestRefund = async () => {
    if (!id) return;
    setRefunding(true);
    try {
      const payment = (await getPaymentByBooking(id)).data;
      const refunded = (await requestBookingRefund({
        order_id: payment.order_id,
        reason: "customer_requested",
      })).data;
      setBooking((prev: any) => prev ? { ...prev, status: refunded.status === "refunded" ? "refunded" : "refund_pending" } : prev);
      toast({ title: "Refund initiated" });
    } catch (err: any) {
      toast({ title: "Refund failed", description: err.message, variant: "destructive" });
    } finally { setRefunding(false); }
  };

  const submitReview = async () => {
    if (!booking) return;
    if (!comment.trim() || comment.length > 500) {
      toast({ title: "Comment must be 1–500 characters", variant: "destructive" });
      return;
    }
    if (!bike?.shop_id) {
      toast({ title: "Unable to submit review", description: "Shop information is missing.", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    try {
      await submitBookingReview(bike.shop_id, { rating, comment });
      toast({ title: "Review submitted" });
      setComment("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Loading booking…</div>
  );
  if (!booking) return <EmptyState>Booking not found</EmptyState>;

  const stepIndex = STATUS_STEPS.indexOf(booking.status);
  const canEdit = booking.status === "pending";
  const canCancel = ["pending", "confirmed"].includes(booking.status);
  const canReview = ["completed", "returned"].includes(booking.status);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-4xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/bookings")} className="gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> All bookings
        </Button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Booking #{String(booking.id).slice(0, 8)}</p>
                  <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                    <Bike className="h-6 w-6 text-primary" />
                    {bike?.name || booking.bike_name || "Vehicle"}
                  </h1>
                  {bike?.model && <p className="text-sm text-muted-foreground">{bike.model}</p>}
                </div>
                <Badge variant="outline" className={`${STATUS_COLOR[booking.status]} capitalize font-display`}>
                  {booking.status}
                </Badge>
              </div>

              {/* Status timeline */}
              {stepIndex >= 0 && (
                <div className="flex items-center gap-2">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex-1 flex items-center gap-2">
                      <div className={`h-2 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-secondary"}`} />
                      {i === STATUS_STEPS.length - 1 && (
                        <span className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{s}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Dates */}
              <div className="grid sm:grid-cols-2 gap-4">
                {editing ? (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Start</Label>
                      <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">End</Label>
                      <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Start</p>
                      <p className="font-display font-medium">{fmt(booking.start_time)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider flex items-center gap-1.5"><Clock className="h-3 w-3" /> End</p>
                      <p className="font-display font-medium">{fmt(booking.end_time)}</p>
                    </div>
                  </>
                )}
              </div>

              {booking.total_price != null && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="text-sm text-muted-foreground">Total Rental Cost</span>
                    <span className="font-display text-xl font-bold text-foreground">₹{booking.total_price}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-border/50 bg-card/60">
                      <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider mb-1">Token Paid via UPI</p>
                      <p className="font-display text-lg font-bold text-emerald-500">₹{booking.token_amount || 299}</p>
                      {booking.utr_number && <p className="text-[10px] text-muted-foreground mt-1 font-mono">UTR: {booking.utr_number}</p>}
                    </div>
                    <div className="p-4 rounded-xl border border-border/50 bg-card/60">
                      <p className="text-[10px] text-muted-foreground font-display uppercase tracking-wider mb-1">Balance at Shop</p>
                      <p className="font-display text-lg font-bold text-primary">₹{Math.max(0, (booking.total_price || 0) - (booking.token_amount || 299))}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">To be paid on pickup</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {canEdit && !editing && (
                  <Button variant="outline" onClick={() => setEditing(true)} className="font-display gap-2">
                    <Pencil className="h-4 w-4" /> Edit dates
                  </Button>
                )}
                {editing && (
                  <>
                    <Button onClick={saveEdits} disabled={saving} className="font-display gap-2">
                      <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                    </Button>
                    <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
                  </>
                )}
                {canCancel && !editing && (
                  <Button variant="outline" onClick={cancelBooking} disabled={cancelling} className="font-display gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" /> {cancelling ? "Cancelling…" : "Cancel booking"}
                  </Button>
                )}
                {booking.status === "paid" && !editing && (
                  <Button variant="outline" onClick={requestRefund} disabled={refunding} className="font-display gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                    <RotateCcw className="h-4 w-4" /> {refunding ? "Refunding…" : "Cancel and refund"}
                  </Button>
                )}
                {bike && (
                  <Button variant="ghost" onClick={() => navigate(`/bikes/${bike.id}`)} className="font-display gap-2">
                    <Bike className="h-4 w-4" /> View vehicle
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Review */}
        {canReview && (
          <Card className="border-border/50 bg-card/60">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-display font-bold">Leave a review</h2>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} type="button" onClick={() => setRating(v)} className="p-0.5 hover:scale-110 transition-transform">
                    <Star className={`h-6 w-6 ${v <= rating ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
              </div>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="Share your experience…" />
              <Button onClick={submitReview} disabled={submittingReview} className="font-display gap-2">
                <Send className="h-4 w-4" /> {submittingReview ? "Submitting…" : "Submit review"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
