import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAdminShops, getAdminShopBikes, updateAdminBike, uploadAdminBikeImages, createAdminBike, deleteAdminBike, getServiceLogs, createServiceLog, deleteServiceLog } from "@/features/admin/services/adminService";
import { useAuth } from "@/features/auth/context/AuthContext";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Trash2, ArrowLeft, Pencil } from "lucide-react";

const TYPES = ["scooty", "bike", "car", "hybrid", "electric"];

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
    is_available: true, maintenance_status: "available"
  });
  const [bikeImages, setBikeImages] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Service Logs State
  const [serviceLogs, setServiceLogs] = useState<any[]>([]);
  const [logForm, setLogForm] = useState({ description: "", cost: "" });
  const [loadingLogs, setLoadingLogs] = useState(false);

  const addLog = async () => {
    if (!logForm.description) return;
    try {
      const created = (await createServiceLog(editing.id, {
        description: logForm.description,
        cost: Number(logForm.cost) || 0,
      })).data;
      setServiceLogs([created, ...serviceLogs]);
      setLogForm({ description: "", cost: "" });
      toast({ title: "Log added" });
    } catch (e: any) {
      toast({ title: "Failed to add log", variant: "destructive" });
    }
  };
  
  const removeLog = async (logId: number) => {
    try {
      await deleteServiceLog(editing.id, logId);
      setServiceLogs(serviceLogs.filter(l => l.id !== logId));
      toast({ title: "Log deleted" });
    } catch (e: any) {
      toast({ title: "Failed to delete log", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user || (user.user_type !== "shop_owner" && user.user_type !== "admin")) { 
      navigate("/login"); 
      return; 
    }
    const isAdmin = user.user_type === "admin";
    getAdminShops(isAdmin).then((res) => {
      const s = res.data;
      setShops(s);
      if (s[0]) setShopId(String(s[0].id));
    }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    getAdminShopBikes(shopId).then((res) => setBikes(res.data)).catch(() => setBikes([]))
      .finally(() => setLoading(false));
  }, [shopId]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", model: "", bike_type: "bike", engine_cc: "", description: "", price_per_hour: "", price_per_day: "", condition: "good", is_available: true, maintenance_status: "available" });
    setBikeImages([]);
    setServiceLogs([]);
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
      is_available: b.is_available !== false,
      maintenance_status: b.maintenance_status || "available"
    });
    setBikeImages([]);
    setLoadingLogs(true);
    getServiceLogs(b.id).then(res => setServiceLogs(res.data)).catch(() => setServiceLogs([])).finally(() => setLoadingLogs(false));
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast({ title: "Vehicle name is required", variant: "destructive" });
      return;
    }
    if (!form.model.trim()) {
      toast({ title: "Vehicle model is required", variant: "destructive" });
      return;
    }
    const pph = Number(form.price_per_hour);
    const ppd = Number(form.price_per_day);
    if (isNaN(pph) || pph <= 0) {
      toast({ title: "Price per hour must be a valid number greater than 0", variant: "destructive" });
      return;
    }
    if (isNaN(ppd) || ppd <= 0) {
      toast({ title: "Price per day must be a valid number greater than 0", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(), model: form.model.trim(), bike_type: form.bike_type,
        price_per_hour: pph,
        price_per_day: ppd,
        condition: form.condition,
        is_available: form.is_available,
        maintenance_status: form.maintenance_status,
      };
      if (form.engine_cc) payload.engine_cc = Number(form.engine_cc);
      if (form.description) payload.description = form.description;
      if (editing) {
        const updated = (await updateAdminBike(editing.id, payload)).data;
        if (bikeImages.length > 0) {
          try {
            const formData = new FormData();
            bikeImages.forEach((file) => formData.append("files", file));
            await uploadAdminBikeImages(editing.id, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          } catch (err: any) {
            toast({ title: "Vehicle updated, image upload failed", description: err.message, variant: "destructive" });
          }
        }
        setBikes((p) => p.map((b) => (b.id === updated.id ? updated : b)));
        toast({ title: "Vehicle updated" });
      } else {
        payload.shop_id = Number(shopId);
        const created = (await createAdminBike(payload)).data;
        let createdWithImages = created;
        if (bikeImages.length > 0) {
          try {
            const formData = new FormData();
            bikeImages.forEach((file) => formData.append("files", file));
            createdWithImages = (await uploadAdminBikeImages(created.id, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })).data;
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
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (b: any) => {
    if (!confirm(`Delete ${b.name}?`)) return;
    try {
      await deleteAdminBike(b.id);
      setBikes((p) => p.filter((x) => x.id !== b.id));
      toast({ title: "Deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-6xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/owner/dashboard")} className="gap-2 text-muted-foreground -ml-2">
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
                    <div className="space-y-1.5 col-span-2">
                      <Label>Maintenance Status</Label>
                      <Select value={form.maintenance_status} onValueChange={(v) => setForm({ ...form, maintenance_status: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available (No Maintenance)</SelectItem>
                          <SelectItem value="maintenance">In Maintenance</SelectItem>
                          <SelectItem value="repair">In Repair</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5 col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="space-y-1.5 col-span-2 flex flex-row items-center justify-between rounded-lg border p-4 bg-card/50">
                      <div className="space-y-0.5">
                        <Label className="text-base font-semibold">Available for booking</Label>
                        <p className="text-xs text-muted-foreground">Turn off to temporarily remove this vehicle from search results.</p>
                      </div>
                      <Switch 
                        checked={form.is_available} 
                        onCheckedChange={(v) => setForm({ ...form, is_available: v })} 
                      />
                    </div>
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
                <Button className="w-full font-display" onClick={submit} disabled={isSaving}>
                  {isSaving ? "Saving..." : (editing ? "Save changes" : "Add")}
                </Button>
                
                {editing && (
                  <div className="mt-8 border-t pt-6">
                    <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">Service & Maintenance Logs</h3>
                    <div className="flex gap-2 items-end mb-4">
                      <div className="space-y-1 flex-1">
                        <Label>Description</Label>
                        <Input placeholder="e.g. Oil change" value={logForm.description} onChange={e => setLogForm({...logForm, description: e.target.value})} />
                      </div>
                      <div className="space-y-1 w-24">
                        <Label>Cost (₹)</Label>
                        <Input type="number" placeholder="0" value={logForm.cost} onChange={e => setLogForm({...logForm, cost: e.target.value})} />
                      </div>
                      <Button onClick={addLog}><Plus className="h-4 w-4" /></Button>
                    </div>
                    {loadingLogs ? <p className="text-sm text-muted-foreground animate-pulse">Loading logs...</p> : (
                      <div className="space-y-2">
                        {serviceLogs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No service logs found.</p>
                        ) : serviceLogs.map(l => (
                          <div key={l.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                            <div>
                              <p className="text-sm font-medium">{l.description}</p>
                              <p className="text-xs text-muted-foreground">{new Date(l.service_date).toLocaleDateString()} • ₹{l.cost}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeLog(l.id)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                  <TableHead className="w-16">Status</TableHead>
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
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10 animate-pulse">Loading inventory...</TableCell></TableRow>
                ) : bikes.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No vehicles</TableCell></TableRow>
                ) : bikes.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Switch
                        checked={b.is_available !== false}
                        onCheckedChange={async (checked) => {
                          try {
                            const updated = (await updateAdminBike(b.id, { ...b, is_available: checked })).data;
                            setBikes((p) => p.map((x) => (x.id === updated.id ? updated : x)));
                            toast({ title: checked ? "Marked available" : "Marked unavailable" });
                          } catch (err: any) {
                            toast({ title: "Error", description: err.message, variant: "destructive" });
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {b.name}
                      {b.maintenance_status && b.maintenance_status !== "available" && (
                        <Badge variant="destructive" className="ml-2 text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{b.maintenance_status}</Badge>
                      )}
                    </TableCell>
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
