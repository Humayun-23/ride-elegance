import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Store, Save, ArrowLeft, Trash2 } from "lucide-react";

export default function AdminShop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shops, setShops] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [shopImage, setShopImage] = useState<File | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.getShops().then((s) => {
      setShops(s);
      if (s[0]) setSelected(s[0]);
    }).catch(() => {});
  }, [user]);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await api.updateShop(String(selected.id), selected);
      let updatedWithImage = updated;
      if (shopImage) {
        try {
          updatedWithImage = await api.uploadShopImage(String(updated.id), shopImage);
        } catch (err: any) {
          toast({ title: "Shop updated, image upload failed", description: err.message, variant: "destructive" });
        }
      }
      setShops((p) => p.map((s) => (s.id === updatedWithImage.id ? updatedWithImage : s)));
      setSelected(updatedWithImage);
      setShopImage(null);
      toast({ title: "Shop updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!selected || !confirm("Delete this shop?")) return;
    try {
      await api.deleteShop(String(selected.id));
      setShops((p) => p.filter((s) => s.id !== selected.id));
      setSelected(null);
      toast({ title: "Shop deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const set = (k: string, v: any) => setSelected((s: any) => ({ ...s, [k]: v }));

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-5xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Shop <span className="text-gradient">Management</span></h1>
        </div>

        {shops.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {shops.map((s) => (
              <Badge key={s.id} variant={selected?.id === s.id ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelected(s)}>
                {s.name}
              </Badge>
            ))}
          </div>
        )}

        {!selected ? (
          <p className="text-muted-foreground">No shops. Create one from the dashboard.</p>
        ) : (
          <Card className="border-border/50 bg-card/80">
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={selected.name || ""} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={selected.phone_number || ""} onChange={(e) => set("phone_number", e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Address</Label>
                  <Input value={selected.address || ""} onChange={(e) => set("address", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input value={selected.city || ""} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input value={selected.state || ""} onChange={(e) => set("state", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Zip</Label>
                  <Input value={selected.zip_code || ""} onChange={(e) => set("zip_code", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Opening</Label>
                  <Input type="time" value={selected.opening_time || ""} onChange={(e) => set("opening_time", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Closing</Label>
                  <Input type="time" value={selected.closing_time || ""} onChange={(e) => set("closing_time", e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea value={selected.description || ""} onChange={(e) => set("description", e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Shop Photo (1 image)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setShopImage(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving} className="font-display gap-2 glow">
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button variant="outline" onClick={remove} className="font-display gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" /> Delete shop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
