import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Check, X, CheckCircle, RotateCcw, Store, Bike, Package, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [shops, setShops] = useState<any[]>([]);
  const [shopBikes, setShopBikes] = useState<Record<string, any[]>>({});
  const [shopBookings, setShopBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("shops");

  // New shop form
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopDesc, setShopDesc] = useState("");

  // New vehicle form
  const [bikeName, setBikeName] = useState("");
  const [bikeType, setBikeType] = useState("bike");
  const [bikeEngineCC, setBikeEngineCC] = useState("");
  const [bikePriceHour, setBikePriceHour] = useState("");
  const [bikePriceDay, setBikePriceDay] = useState("");
  const [bikeShopId, setBikeShopId] = useState("");

  // Inventory form
  const [invBikeId, setInvBikeId] = useState("");
  const [invShopId, setInvShopId] = useState("");
  const [invQuantity, setInvQuantity] = useState("");

  useEffect(() => {
    if (!user || (user.user_type !== "shop_owner" && !localStorage.getItem("is_admin"))) {
      navigate("/login");
      return;
    }
    api.getShops().then(setShops).catch(() => {});
  }, [user]);

  const loadBikesForShop = async (shopId: string) => {
    try {
      const bikes = await api.getBikesByShop(shopId);
      setShopBikes((prev) => ({ ...prev, [shopId]: bikes }));
    } catch {}
  };

  const createShop = async () => {
    try {
      const shop = await api.createShop({ name: shopName, location: shopLocation, description: shopDesc });
      setShops((p) => [...p, shop]);
      setShopName(""); setShopLocation(""); setShopDesc("");
      toast({ title: "Shop created!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const createVehicle = async () => {
    try {
      await api.createBike({
        name: bikeName,
        bike_type: bikeType,
        engine_cc: Number(bikeEngineCC),
        price_per_hour: Number(bikePriceHour),
        price_per_day: Number(bikePriceDay),
        shop_id: Number(bikeShopId),
      });
      setBikeName(""); setBikeType("bike"); setBikeEngineCC(""); setBikePriceHour(""); setBikePriceDay(""); setBikeShopId("");
      toast({ title: "Vehicle added!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const createInventory = async () => {
    try {
      await api.createInventory({
        bike_id: Number(invBikeId),
        shop_id: Number(invShopId),
        total_quantity: Number(invQuantity),
      });
      setInvBikeId(""); setInvShopId(""); setInvQuantity("");
      toast({ title: "Inventory created!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleBookingAction = async (id: string, action: "confirm" | "reject" | "complete" | "return") => {
    try {
      const fn = action === "confirm" ? api.confirmBooking : action === "reject" ? api.rejectBooking : action === "return" ? api.returnBooking : api.completeBooking;
      await fn(id);
      toast({ title: `Booking ${action}ed` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 space-y-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Shop Owner <span className="text-gradient">Dashboard</span>
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="shops" className="font-display gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Store className="h-4 w-4" /> Shops
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="font-display gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bike className="h-4 w-4" /> Vehicles
            </TabsTrigger>
            <TabsTrigger value="inventory" className="font-display gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-4 w-4" /> Inventory
            </TabsTrigger>
          </TabsList>

          {/* Shops Tab */}
          <TabsContent value="shops" className="space-y-6 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="font-display gap-2"><Plus className="h-4 w-4" /> Add Shop</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="font-display">Create New Shop</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={shopName} onChange={(e) => setShopName(e.target.value)} className="bg-background" /></div>
                  <div className="space-y-2"><Label>Location</Label><Input value={shopLocation} onChange={(e) => setShopLocation(e.target.value)} className="bg-background" /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} className="bg-background" /></div>
                  <Button className="w-full font-display" onClick={createShop}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid md:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <motion.div key={shop.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-lg border border-border bg-card p-5 space-y-2">
                  <h3 className="font-display font-bold text-lg">{shop.name}</h3>
                  <p className="text-sm text-muted-foreground">{shop.location}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="font-display" onClick={() => navigate(`/shops/${shop.id}`)}>View</Button>
                    <Button size="sm" variant="outline" className="font-display" onClick={() => loadBikesForShop(shop.id)}>Load Vehicles</Button>
                    <Button size="sm" variant="outline" className="font-display text-destructive border-destructive/30" onClick={async () => {
                      await api.deleteShop(shop.id);
                      setShops((p) => p.filter((s) => s.id !== shop.id));
                      toast({ title: "Shop deleted" });
                    }}>Delete</Button>
                  </div>
                  {shopBikes[shop.id] && (
                    <div className="mt-3 space-y-2">
                      {shopBikes[shop.id].map((bike: any) => (
                        <div key={bike.id} className="text-sm text-muted-foreground flex justify-between items-center border-t border-border pt-2">
                          <span>{bike.name} ({bike.bike_type}) — {bike.engine_cc}cc</span>
                          <span className="text-primary font-display">₹{bike.price_per_hour}/hr</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="font-display gap-2"><Plus className="h-4 w-4" /> Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="font-display">Add New Vehicle</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={bikeName} onChange={(e) => setBikeName(e.target.value)} className="bg-background" /></div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select value={bikeType} onChange={(e) => setBikeType(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                      <option value="scooty">Scooty</option>
                      <option value="bike">Bike</option>
                      <option value="car">Car</option>
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Engine CC</Label><Input type="number" value={bikeEngineCC} onChange={(e) => setBikeEngineCC(e.target.value)} className="bg-background" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Price/Hour (₹)</Label><Input type="number" value={bikePriceHour} onChange={(e) => setBikePriceHour(e.target.value)} className="bg-background" /></div>
                    <div className="space-y-2"><Label>Price/Day (₹)</Label><Input type="number" value={bikePriceDay} onChange={(e) => setBikePriceDay(e.target.value)} className="bg-background" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Shop</Label>
                    <select value={bikeShopId} onChange={(e) => setBikeShopId(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                      <option value="">Select shop</option>
                      {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <Button className="w-full font-display" onClick={createVehicle}>Add Vehicle</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="font-display gap-2"><Plus className="h-4 w-4" /> Add Inventory</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="font-display">Create Inventory</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Bike ID</Label><Input type="number" value={invBikeId} onChange={(e) => setInvBikeId(e.target.value)} className="bg-background" /></div>
                  <div className="space-y-2">
                    <Label>Shop</Label>
                    <select value={invShopId} onChange={(e) => setInvShopId(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                      <option value="">Select shop</option>
                      {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Total Quantity</Label><Input type="number" value={invQuantity} onChange={(e) => setInvQuantity(e.target.value)} className="bg-background" /></div>
                  <Button className="w-full font-display" onClick={createInventory}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid md:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <div key={shop.id} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-display font-bold">{shop.name}</h3>
                  <Button size="sm" variant="outline" className="mt-2 font-display" onClick={() => navigate(`/shops/${shop.id}`)}>
                    View Inventory
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
