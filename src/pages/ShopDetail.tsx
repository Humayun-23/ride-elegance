import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, Send, Phone, Clock, Plus, Trash2, X,
  Bike, Store, MessageSquare,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { formatIndianPhone } from "@/lib/phone";

export default function ShopDetail() {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<any>(null);
  const [bikes, setBikes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
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
  const [vehicleImages, setVehicleImages] = useState<File[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAdmin = user?.user_type === "admin";
  const isOwner = isAdmin || (user?.user_type === "shop_owner" && shop?.owner_id === user?.id);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/shops/${id}`).then((res) => res.data),
      api.get(`/bikes/shop/${id}`).then((res) => res.data).catch(() => []),
    ]).then(([s, b]) => {
      setShop(s);
      setBikes(Array.isArray(b) ? b : []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddVehicle = async () => {
    if (!vehicleForm.name || !vehicleForm.model || !vehicleForm.price_per_hour || !vehicleForm.price_per_day) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setAddingVehicle(true);
    try {
      const newBike = (await api.post("/bikes/", {
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
      })).data;
      let created = newBike;
      if (vehicleImages.length > 0) {
        try {
          const formData = new FormData();
          vehicleImages.forEach((file) => formData.append("files", file));
          created = (await api.post(`/bikes/${newBike.id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })).data;
        } catch (err: any) {
          toast({ title: "Vehicle added, image upload failed", description: err.message, variant: "destructive" });
        }
      }
      setBikes((prev) => [...prev, created]);
      setShowAddVehicle(false);
      setVehicleForm({ name: "", model: "", bike_type: "bike", engine_cc: "", description: "", price_per_hour: "", price_per_day: "", condition: "good" });
      setVehicleImages([]);
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
      await api.delete(`/bikes/${deleteTarget.id}`);
      setBikes((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast({ title: "Vehicle deleted" });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        Loading shop...
      </div>
    </div>
  );
  if (!shop) return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Shop not found</div>;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-6xl space-y-10">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Shop Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50 bg-card/60 backdrop-blur overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 overflow-hidden">
                      {shop.image_url ? (
                        <img src={shop.image_url} alt={shop.name} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-7 w-7 text-primary" />
                      )}
                    </div>
                    <div>
                      <h1 className="font-display text-2xl md:text-3xl font-bold">{shop.name}</h1>
                      {shop.is_active === false && (
                        <Badge variant="destructive" className="mt-1 text-[10px]">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {(shop.address || shop.city) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary/60" />
                        {shop.address}{shop.city ? `, ${shop.city}` : ""}{shop.state ? `, ${shop.state}` : ""}{shop.zip_code ? ` ${shop.zip_code}` : ""}
                      </span>
                    )}
                    {shop.phone_number && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary/60" />{formatIndianPhone(shop.phone_number)}
                      </span>
                    )}
                    {(shop.opening_time || shop.closing_time) && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary/60" />{shop.opening_time || "?"} – {shop.closing_time || "?"}
                      </span>
                    )}
                  </div>

                  {shop.description && (
                    <p className="text-sm text-muted-foreground/80 max-w-2xl leading-relaxed">{shop.description}</p>
                  )}
                </div>

                {/* Stats sidebar */}
                <div className="flex md:flex-col items-center gap-6 md:gap-4 md:text-right shrink-0">
                  {avgRating && (
                    <div>
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="h-5 w-5 text-primary fill-primary" />
                        <span className="font-display text-2xl font-bold">{avgRating}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{reviews.length} reviews</p>
                    </div>
                  )}
                  <div>
                    <p className="font-display text-2xl font-bold">{bikes.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vehicles</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Vehicles Section */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bike className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl md:text-2xl font-bold">Available Vehicles</h2>
              <Badge variant="outline" className="font-display">{bikes.length}</Badge>
            </div>
            {isOwner && (
              <Button onClick={() => setShowAddVehicle(!showAddVehicle)} className="font-display gap-2 rounded-xl" size="sm">
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
                <Card className="border-primary/20 bg-card/80">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-lg">New Vehicle</h3>
                      <Button variant="ghost" size="icon" onClick={() => setShowAddVehicle(false)} className="h-8 w-8">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Name *</Label>
                        <Input value={vehicleForm.name} onChange={(e) => setVehicleForm((f) => ({ ...f, name: e.target.value }))} placeholder="Honda Activa" className="bg-background rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Model *</Label>
                        <Input value={vehicleForm.model} onChange={(e) => setVehicleForm((f) => ({ ...f, model: e.target.value }))} placeholder="2024" className="bg-background rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Type</Label>
                        <Select value={vehicleForm.bike_type} onValueChange={(v) => setVehicleForm((f) => ({ ...f, bike_type: v }))}>
                          <SelectTrigger className="bg-background rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["scooty", "bike", "car", "mountain", "road", "hybrid", "electric"].map((t) => (
                              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Engine CC</Label>
                        <Input type="number" value={vehicleForm.engine_cc} onChange={(e) => setVehicleForm((f) => ({ ...f, engine_cc: e.target.value }))} placeholder="150" className="bg-background rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Price/Hour (₹) *</Label>
                        <Input type="number" value={vehicleForm.price_per_hour} onChange={(e) => setVehicleForm((f) => ({ ...f, price_per_hour: e.target.value }))} placeholder="50" className="bg-background rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Price/Day (₹) *</Label>
                        <Input type="number" value={vehicleForm.price_per_day} onChange={(e) => setVehicleForm((f) => ({ ...f, price_per_day: e.target.value }))} placeholder="500" className="bg-background rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Condition</Label>
                        <Select value={vehicleForm.condition} onValueChange={(v: any) => setVehicleForm((f) => ({ ...f, condition: v }))}>
                          <SelectTrigger className="bg-background rounded-xl"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Vehicle Photos (max 3)</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => setVehicleImages(Array.from(e.target.files || []).slice(0, 3))}
                          className="bg-background rounded-xl"
                        />
                        {vehicleImages.length > 0 && (
                          <p className="text-xs text-muted-foreground">Selected {vehicleImages.length} file(s)</p>
                        )}
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Description</Label>
                        <Textarea value={vehicleForm.description} onChange={(e) => setVehicleForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description..." className="bg-background rounded-xl" />
                      </div>
                    </div>
                    <Button onClick={handleAddVehicle} disabled={addingVehicle} className="font-display gap-2 rounded-xl glow">
                      <Plus className="h-4 w-4" /> {addingVehicle ? "Adding..." : "Add Vehicle"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {bikes.length === 0 ? (
            <Card className="border-dashed border-border/50 bg-transparent">
              <CardContent className="p-12 text-center space-y-3">
                <Bike className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground text-sm">No vehicles at this shop yet.</p>
                {isOwner && (
                  <Button variant="outline" size="sm" onClick={() => setShowAddVehicle(true)} className="font-display gap-2 rounded-xl">
                    <Plus className="h-4 w-4" /> Add your first vehicle
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {bikes.map((b) => (
                <div key={b.id} className="relative group">
                  <VehicleCard vehicle={b} />
                  {isOwner && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-xl"
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
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl">Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteVehicle} disabled={deleting} className="gap-2 rounded-xl">
                <Trash2 className="h-4 w-4" /> {deleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
