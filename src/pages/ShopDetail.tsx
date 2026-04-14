import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Star, Send, Phone, Clock } from "lucide-react";

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<any>(null);
  const [bikes, setBikes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getShop(id),
      api.getBikesByShop(id).catch(() => []),
      api.getShopReviews(id).catch(() => []),
    ]).then(([s, b, r]) => {
      setShop(s);
      setBikes(Array.isArray(b) ? b : []);
      setReviews(Array.isArray(r) ? r : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const submitReview = async () => {
    if (!user) { navigate("/login"); return; }
    if (!reviewText.trim() || reviewText.length > 500) {
      toast({ title: "Comment must be 1-500 characters", variant: "destructive" });
      return;
    }
    const rating = Number(reviewRating);
    if (rating < 1 || rating > 5) {
      toast({ title: "Rating must be 1-5", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const newReview = await api.createReview(id!, { rating, comment: reviewText });
      setReviews((prev) => [newReview, ...prev]);
      setReviewText("");
      toast({ title: "Review submitted!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!shop) return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Shop not found</div>;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 space-y-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{shop.name}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {shop.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {shop.address}{shop.city ? `, ${shop.city}` : ""}{shop.state ? `, ${shop.state}` : ""}{shop.zip_code ? ` ${shop.zip_code}` : ""}
              </span>
            )}
            {shop.phone_number && (
              <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{shop.phone_number}</span>
            )}
            {(shop.opening_time || shop.closing_time) && (
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{shop.opening_time || "?"} – {shop.closing_time || "?"}</span>
            )}
            {shop.rating && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-primary" />{shop.rating}</span>}
          </div>
          {shop.description && <p className="text-muted-foreground max-w-2xl">{shop.description}</p>}
        </motion.div>

        {/* Vehicles */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-bold">Available Vehicles</h2>
          {bikes.length === 0 ? (
            <p className="text-muted-foreground">No vehicles at this shop.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map((b) => <VehicleCard key={b.id} vehicle={b} />)}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold">Reviews</h2>

          {user && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Your review (max 500 chars)</Label>
                  <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} maxLength={500} className="bg-background" placeholder="Write a review..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Rating (1-5)</Label>
                  <Input type="number" min="1" max="5" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} className="bg-background w-20" />
                </div>
              </div>
              <Button size="sm" onClick={submitReview} disabled={submitting} className="font-display gap-2">
                <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reviews yet.</p>
            ) : (
              reviews.map((r, i) => (
                <motion.div key={r.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-primary">
                      {[...Array(r.rating || 0)].map((_, j) => <Star key={j} className="h-3 w-3 fill-current" />)}
                    </div>
                    <span className="text-xs text-muted-foreground">{r.user_name || "User"}</span>
                  </div>
                  <p className="text-sm text-foreground">{r.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
