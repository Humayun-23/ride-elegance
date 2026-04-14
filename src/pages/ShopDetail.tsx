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
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Star, Send, Phone, Clock, Plus, Trash2, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<any>(null);
  const [bikes, setBikes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [submitting, setSubmitting] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    name: "", model: "", bike_type: "bike", engine_cc: "",
    description: "", price_per_hour: "", price_per_day: "",
    condition: "good" as "excellent" | "good" | "fair",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isOwner = user?.user_type === "shop_owner";

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

  const handleAddVehicle = async () => {
    if (!vehicleForm.name || !vehicleForm.model || !vehicleForm.price_per_hour || !vehicleForm.price_per_day) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setAddingVehicle(true);
    try {
      const newBike = await api.createBike({
        shop_id: Number(id),
        name: vehicleForm.name,
        model: vehicleForm.model,
        bike_type: vehicleForm.bike_type,
        engine_cc: vehicleForm.engine_cc ? Number(vehicleForm.engine_cc) : undefined,
        description: vehicleForm.description || undefined,
        price_per_hour: Number(vehicleForm.price_per_hour),
        price_per_day: Number(vehicleForm.price_per_day),
        condition: vehicleForm.condition,
        is_available: true,
      });
      setBikes((prev) => [...prev, newBike]);
      setShowAddVehicle(false);
      setVehicleForm({ name: "", model: "", bike_type: "bike", engine_cc: "", description: "", price_per_hour: "", price_per_day: "", condition: "good" });
      toast({ title: "Vehicle added!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteBike(String(deleteTarget.id));
      setBikes((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast({ title: "Vehicle deleted" });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
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
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Available Vehicles</h2>
            {isOwner && (
              <Button onClick={() => setShowAddVehicle(true)} className="font-display gap-2">
                <Plus className="h-4 w-4" /> Add Vehicle
              </Button>
            )}
          </div>

          {/* Add Vehicle Form */}
          <AnimatePresence>
            {showAddVehicle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg">New Vehicle</h3>
                    <Button variant="ghost" size="icon" onClick={() => setShowAddVehicle(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Name *</Label>
                      <Input value={vehicleForm.name} onChange={(e) => setVehicleForm((f) => ({ ...f, name: e.target.value }))} placeholder="Honda Activa" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Model *</Label>
                      <Input value={vehicleForm.model} onChange={(e) => setVehicleForm((f) => ({ ...f, model: e.target.value }))} placeholder="2024" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select value={vehicleForm.bike_type} onValueChange={(v) => setVehicleForm((f) => ({ ...f, bike_type: v }))}>
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["scooty", "bike", "car", "mountain", "road", "hybrid", "electric"].map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Engine CC</Label>
                      <Input type="number" value={vehicleForm.engine_cc} onChange={(e) => setVehicleForm((f) => ({ ...f, engine_cc: e.target.value }))} placeholder="150" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price/Hour (₹) *</Label>
                      <Input type="number" value={vehicleForm.price_per_hour} onChange={(e) => setVehicleForm((f) => ({ ...f, price_per_hour: e.target.value }))} placeholder="50" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price/Day (₹) *</Label>
                      <Input type="number" value={vehicleForm.price_per_day} onChange={(e) => setVehicleForm((f) => ({ ...f, price_per_day: e.target.value }))} placeholder="500" className="bg-background" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Condition</Label>
                      <Select value={vehicleForm.condition} onValueChange={(v: any) => setVehicleForm((f) => ({ ...f, condition: v }))}>
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label className="text-xs">Description</Label>
                      <Textarea value={vehicleForm.description} onChange={(e) => setVehicleForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description..." className="bg-background" />
                    </div>
                  </div>
                  <Button onClick={handleAddVehicle} disabled={addingVehicle} className="font-display gap-2">
                    <Plus className="h-4 w-4" /> {addingVehicle ? "Adding..." : "Add Vehicle"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {bikes.length === 0 ? (
            <p className="text-muted-foreground">No vehicles at this shop.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bikes.map((b) => (
                <div key={b.id} className="relative group">
                  <VehicleCard vehicle={b} />
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(b); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Vehicle</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteVehicle} disabled={deleting} className="gap-2">
                <Trash2 className="h-4 w-4" /> {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
