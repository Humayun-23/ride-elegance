import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Trash2, ArrowLeft, Pencil } from "lucide-react";

const TYPES = ["scooty", "bike", "car", "mountain", "road", "hybrid", "electric"];

export default function AdminInventory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shops, setShops] = useState<any[]>([]);
  const [shopId, setShopId] = useState<string>("");
  const [bikes, setBikes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({
    name: "", model: "", bike_type: "bike", engine_cc: "",
    description: "", price_per_hour: "", price_per_day: "", condition: "good",
  });
  const [bikeImages, setBikeImages] = useState<File[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.getShops().then((s) => {
      setShops(s);
      if (s[0]) setShopId(String(s[0].id));
    });
  }, [user]);

  useEffect(() => {
    if (!shopId) return;
    api.getBikesByShop(shopId).then(setBikes).catch(() => setBikes([]));
  }, [shopId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", model: "", bike_type: "bike", engine_cc: "", description: "", price_per_hour: "", price_per_day: "", condition: "good" });
    setBikeImages([]);
    setOpen(true);
  };
  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      name: b.name || "", model: b.model || "", bike_type: b.bike_type || "bike",
      engine_cc: b.engine_cc?.toString() || "", description: b.description || "",
      price_per_hour: b.price_per_hour?.toString() || "",
      price_per_day: b.price_per_day?.toString() || "",
      condition: b.condition || "good",
    });
    setBikeImages([]);
    setOpen(true);
  };

  const submit = async () => {
    try {
      const payload: any = {
        name: form.name, model: form.model, bike_type: form.bike_type,
        price_per_hour: Number(form.price_per_hour),
        price_per_day: Number(form.price_per_day),
        condition: form.condition,
      };
      if (form.engine_cc) payload.engine_cc = Number(form.engine_cc);
      if (form.description) payload.description = form.description;
      if (editing) {
        const updated = await api.updateBike(String(editing.id), payload);
        if (bikeImages.length > 0) {
          try {
            await api.uploadBikeImages(String(editing.id), bikeImages);
          } catch (err: any) {
            toast({ title: "Vehicle updated, image upload failed", description: err.message, variant: "destructive" });
          }
        }
        setBikes((p) => p.map((b) => (b.id === updated.id ? updated : b)));
        toast({ title: "Vehicle updated" });
      } else {
        payload.shop_id = Number(shopId);
        const created = await api.createBike(payload);
        let createdWithImages = created;
        if (bikeImages.length > 0) {
          try {
            createdWithImages = await api.uploadBikeImages(String(created.id), bikeImages);
          } catch (err: any) {
            toast({ title: "Vehicle added, image upload failed", description: err.message, variant: "destructive" });
          }
        }
        setBikes((p) => [...p, createdWithImages]);
        toast({ title: "Vehicle added" });
      }
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (b: any) => {
    if (!confirm(`Delete ${b.name}?`)) return;
    try {
      await api.deleteBike(String(b.id));
      setBikes((p) => p.filter((x) => x.id !== b.id));
      toast({ title: "Deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-6xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold">Inventory <span className="text-gradient">Management</span></h1>
          </div>
          <div className="flex items-center gap-2">
            {shops.length > 0 && (
              <Select value={shopId} onValueChange={setShopId}>
                <SelectTrigger className="w-52"><SelectValue placeholder="Shop" /></SelectTrigger>
                <SelectContent>
                  {shops.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAdd} className="font-display gap-2 glow"><Plus className="h-4 w-4" /> Add vehicle</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Edit vehicle" : "Add vehicle"}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Model *</Label><Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
                    <div className="space-y-1.5">
                      <Label>Type *</Label>
                      <Select value={form.bike_type} onValueChange={(v) => setForm({ ...form, bike_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Engine CC</Label><Input type="number" value={form.engine_cc} onChange={(e) => setForm({ ...form, engine_cc: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Price/Hour *</Label><Input type="number" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Price/Day *</Label><Input type="number" value={form.price_per_day} onChange={(e) => setForm({ ...form, price_per_day: e.target.value })} /></div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Condition</Label>
                      <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Vehicle Photos (max 3)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => setBikeImages(Array.from(e.target.files || []).slice(0, 3))}
                      />
                      {bikeImages.length > 0 && (
                        <p className="text-xs text-muted-foreground">Selected {bikeImages.length} file(s)</p>
                      )}
                    </div>
                  </div>
                  <Button className="w-full font-display" onClick={submit}>{editing ? "Save changes" : "Add"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-border/50 bg-card/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>CC</TableHead>
                  <TableHead>₹/hr</TableHead>
                  <TableHead>₹/day</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bikes.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No vehicles</TableCell></TableRow>
                ) : bikes.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.model}</TableCell>
                    <TableCell className="capitalize">{b.bike_type}</TableCell>
                    <TableCell>{b.engine_cc || "—"}</TableCell>
                    <TableCell>{b.price_per_hour}</TableCell>
                    <TableCell>{b.price_per_day}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{b.condition || "good"}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(b)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(b)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
