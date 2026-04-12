import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Check, X, CheckCircle, Store, Bike, Package, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [shops, setShops] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("bookings");

  // New shop form
  const [shopName, setShopName] = useState("");
  const [shopLocation, setShopLocation] = useState("");
  const [shopDesc, setShopDesc] = useState("");

  // New vehicle form
  const [bikeName, setBikeName] = useState("");
  const [bikeType, setBikeType] = useState("");
  const [bikePrice, setBikePrice] = useState("");
  const [bikeShopId, setBikeShopId] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("is_admin")) { navigate("/admin/login"); return; }
    api.getShops().then(setShops).catch(() => {});
    // Admin might have a different bookings endpoint, but we use what's available
  }, []);

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
      await api.createBike({ name: bikeName, type: bikeType, price_per_day: Number(bikePrice), shop_id: bikeShopId });
      setBikeName(""); setBikeType(""); setBikePrice(""); setBikeShopId("");
      toast({ title: "Vehicle added!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleBookingAction = async (id: string, action: "confirm" | "reject" | "complete") => {
    try {
      const fn = action === "confirm" ? api.confirmBooking : action === "reject" ? api.rejectBooking : api.completeBooking;
      await fn(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: action === "confirm" ? "confirmed" : action === "reject" ? "rejected" : "completed" } : b));
      toast({ title: `Booking ${action}ed` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const loadBookingsForShop = async (shopId: string) => {
    // Since there's no admin-specific bookings list, we load bikes per shop
    // and show a simplified view
    try {
      const bikes = await api.getBikesByShop(shopId);
      // For demo, we just show bikes
    } catch {}
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Admin <span className="text-gradient">Dashboard</span>
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="bookings" className="font-display gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-4 w-4" /> Bookings
            </TabsTrigger>
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

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4 mt-6">
            <p className="text-muted-foreground text-sm">Select a shop to manage its bookings.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <div key={shop.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <h3 className="font-display font-bold">{shop.name}</h3>
                  <Button size="sm" variant="outline" className="font-display" onClick={() => navigate(`/admin/shops/${shop.id}`)}>
                    Manage Bookings
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Shops Tab */}
          <TabsContent value="shops" className="space-y-6 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="font-display gap-2"><Plus className="h-4 w-4" /> Add Shop</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display">Create New Shop</DialogTitle>
                </DialogHeader>
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
                    <Button size="sm" variant="outline" className="font-display text-destructive border-destructive/30" onClick={async () => {
                      await api.deleteShop(shop.id);
                      setShops((p) => p.filter((s) => s.id !== shop.id));
                      toast({ title: "Shop deleted" });
                    }}>Delete</Button>
                  </div>
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
                <DialogHeader>
                  <DialogTitle className="font-display">Add New Vehicle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={bikeName} onChange={(e) => setBikeName(e.target.value)} className="bg-background" /></div>
                  <div className="space-y-2"><Label>Type</Label><Input value={bikeType} onChange={(e) => setBikeType(e.target.value)} placeholder="car, bike, scooter..." className="bg-background" /></div>
                  <div className="space-y-2"><Label>Price per day</Label><Input type="number" value={bikePrice} onChange={(e) => setBikePrice(e.target.value)} className="bg-background" /></div>
                  <div className="space-y-2">
                    <Label>Shop</Label>
                    <select value={bikeShopId} onChange={(e) => setBikeShopId(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                      <option value="">Select shop</option>
                      {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <Button className="w-full font-display" onClick={createVehicle}>Add Vehicle</Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="text-muted-foreground text-sm">
              Vehicles are listed under their respective shops. Visit a shop page to see its vehicles.
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6 mt-6">
            <p className="text-muted-foreground text-sm">
              Manage inventory through shop vehicle pages. Use the API to update stock and availability.
            </p>
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
