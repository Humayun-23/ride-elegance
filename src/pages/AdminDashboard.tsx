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
import { Plus, Store, Bike, Package, Calendar, TrendingUp, Star, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState("shops");
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Shop form
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopCity, setShopCity] = useState("");
  const [shopState, setShopState] = useState("");
  const [shopZipCode, setShopZipCode] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [shopOpeningTime, setShopOpeningTime] = useState("");
  const [shopClosingTime, setShopClosingTime] = useState("");
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  // Vehicle form
  const [bikeName, setBikeName] = useState("");
  const [bikeModel, setBikeModel] = useState("");
  const [bikeType, setBikeType] = useState("bike");
  const [bikeEngineCC, setBikeEngineCC] = useState("");
  const [bikeDesc, setBikeDesc] = useState("");
  const [bikePriceHour, setBikePriceHour] = useState("");
  const [bikePriceDay, setBikePriceDay] = useState("");
  const [bikeCondition, setBikeCondition] = useState("good");
  const [bikeAvailable, setBikeAvailable] = useState(true);
  const [bikeShopId, setBikeShopId] = useState("");
  const [bikeImages, setBikeImages] = useState<File[]>([]);
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);

  // Inventory form
  const [invBikeId, setInvBikeId] = useState("");
  const [invShopId, setInvShopId] = useState("");
  const [invQuantity, setInvQuantity] = useState("");
  const [isCreatingInventory, setIsCreatingInventory] = useState(false);

  useEffect(() => {
    if (!user || (user.user_type !== "shop_owner" && !localStorage.getItem("is_admin"))) {
      navigate("/login");
      return;
    }
    const isAdmin = localStorage.getItem("is_admin") === "true" || user.user_type === "admin";
    
    Promise.all([
      api.get(isAdmin ? "/shops/" : "/shops/me").catch(() => ({ data: [] })),
      api.get("/shops/dashboard-metrics").catch(() => ({ data: null })),
      api.get("/bookings/", { params: { limit: 100 } }).catch(() => ({ data: [] }))
    ]).then(([shopsRes, metricsRes, bookingsRes]) => {
      setShops(shopsRes.data || []);
      
      if (metricsRes.data) {
        setDashboardMetrics(metricsRes.data);
        setAllReviews(metricsRes.data.recent_reviews || []);
      }
      
      setAllBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setLoading(false);
    });
  }, [user]);

  const loadBikesForShop = async (shopId: string) => {
    try {
      const bikes = (await api.get(`/bikes/shop/${shopId}`)).data;
      setShopBikes((prev) => ({ ...prev, [shopId]: bikes }));
    } catch {}
  };

  const resetShopForm = () => {
    setShopName(""); setShopPhone(""); setShopAddress(""); setShopCity("");
    setShopState(""); setShopZipCode(""); setShopDesc("");
    setShopOpeningTime(""); setShopClosingTime(""); setShopImage(null);
  };

  const createShop = async () => {
    if (shopPhone.length < 10 || shopPhone.length > 20) {
      toast({ title: "Phone must be 10-20 characters", variant: "destructive" });
      return;
    }
    setIsCreatingShop(true);
    try {
      const payload: any = {
        name: shopName,
        phone_number: shopPhone,
        address: shopAddress,
        city: shopCity,
      };
      if (shopDesc) payload.description = shopDesc;
      if (shopState) payload.state = shopState;
      if (shopZipCode) payload.zip_code = shopZipCode;
      if (shopOpeningTime) payload.opening_time = shopOpeningTime;
      if (shopClosingTime) payload.closing_time = shopClosingTime;

      const shop = (await api.post("/shops/", payload)).data;
      let created = shop;
      if (shopImage) {
        try {
          const formData = new FormData();
          formData.append("file", shopImage);
          created = (await api.post(`/shops/${shop.id}/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })).data;
        } catch (err: any) {
          toast({ title: "Shop created, image upload failed", description: err.message, variant: "destructive" });
        }
      }
      setShops((p) => [...p, created]);
      resetShopForm();
      toast({ title: "Shop created!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingShop(false);
    }
  };

  const resetVehicleForm = () => {
    setBikeName(""); setBikeModel(""); setBikeType("bike"); setBikeEngineCC("");
    setBikeDesc(""); setBikePriceHour(""); setBikePriceDay("");
    setBikeCondition("good"); setBikeAvailable(true); setBikeShopId(""); setBikeImages([]);
  };

  const createVehicle = async () => {
    setIsCreatingVehicle(true);
    try {
      const payload: any = {
        name: bikeName,
        model: bikeModel,
        bike_type: bikeType,
        price_per_hour: Number(bikePriceHour),
        price_per_day: Number(bikePriceDay),
        shop_id: Number(bikeShopId),
        condition: bikeCondition,
        is_available: bikeAvailable,
      };
      if (bikeEngineCC) payload.engine_cc = Number(bikeEngineCC);
      if (bikeDesc) payload.description = bikeDesc;

      const created = (await api.post("/bikes/", payload)).data;
      if (bikeImages.length > 0) {
        try {
          const formData = new FormData();
          bikeImages.forEach((file) => formData.append("files", file));
          await api.post(`/bikes/${created.id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (err: any) {
          toast({ title: "Vehicle created, image upload failed", description: err.message, variant: "destructive" });
        }
      }
      resetVehicleForm();
      toast({ title: "Vehicle added!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  const createInventory = async () => {
    setIsCreatingInventory(true);
    try {
      await api.post("/inventory/", {
        bike_id: Number(invBikeId),
        shop_id: Number(invShopId),
        total_quantity: Number(invQuantity),
      });
      setInvBikeId(""); setInvShopId(""); setInvQuantity("");
      toast({ title: "Inventory created!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingInventory(false);
    }
  };

  const handleBookingAction = async (id: string, action: "confirm" | "reject" | "complete" | "return") => {
    try {
      await api.post(`/bookings/${id}/${action}`);
      toast({ title: `Booking ${action}ed` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const selectClasses = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

  const totalBikes = dashboardMetrics?.total_bikes ?? Object.values(shopBikes).reduce((a, l) => a + l.length, 0);
  const activeBookings = dashboardMetrics?.active_bookings ?? allBookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length;
  const revenue = dashboardMetrics?.revenue ?? allBookings.filter((b) => ["completed", "returned"].includes(b.status)).reduce((a, b) => a + (Number(b.total_price) || 0), 0);
  const avgRating = dashboardMetrics?.avg_rating || (allReviews.length ? (allReviews.reduce((a, r) => a + (r.rating || 0), 0) / allReviews.length).toFixed(1) : "—");
  const recentBookings = [...allBookings].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5);
  const recentReviews = dashboardMetrics?.recent_reviews || [...allReviews].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5);

  const metrics = [
    { label: "Total Vehicles", value: loading ? "..." : totalBikes, icon: Bike },
    { label: "Active Bookings", value: loading ? "..." : activeBookings, icon: Calendar },
    { label: "Revenue (₹)", value: loading ? "..." : revenue, icon: TrendingUp },
    { label: "Avg Rating", value: loading ? "..." : avgRating, icon: Star },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 space-y-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Shop Owner <span className="text-gradient">Dashboard</span>
        </h1>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <Card key={m.label} className="border-border/50 bg-card/60 backdrop-blur">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-2xl font-bold truncate">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick nav */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Shop", to: "/admin/shop", icon: Store, desc: "Edit shop details" },
            { label: "Inventory", to: "/admin/inventory", icon: Package, desc: "Manage vehicles" },
            { label: "Bookings", to: "/admin/bookings", icon: Bike, desc: "Confirm / complete" },
            { label: "Reviews", to: "/admin/reviews", icon: Plus, desc: "Customer feedback" },
          ].map((n) => (
            <button
              key={n.to}
              onClick={() => navigate(n.to)}
              className="text-left rounded-xl border border-border bg-card/60 hover:border-primary/30 hover:bg-card transition-all p-4 flex items-center gap-3 group"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <n.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Recent activity */}
        {(recentBookings.length > 0 || recentReviews.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-card/60">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display font-bold text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Recent Bookings
                </h3>
                {recentBookings.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No bookings yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentBookings.map((b) => (
                      <button key={b.id} onClick={() => navigate(`/bookings/${b.id}`)} className="w-full flex items-center justify-between text-left p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-xs">
                        <div className="min-w-0">
                          <p className="font-display font-medium truncate">Booking #{String(b.id).slice(0, 6)}</p>
                          <p className="text-muted-foreground text-[11px]">{b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN") : ""}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-[10px] font-display">{b.status}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/60">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-display font-bold text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" /> Recent Reviews
                </h3>
                {recentReviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No reviews yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {recentReviews.map((r) => (
                      <div key={r.id} className="p-2.5 rounded-lg hover:bg-secondary/50 transition-colors space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-display">Shop #{r.shop_id}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className={`h-3 w-3 ${j < (r.rating || 0) ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                            ))}
                          </div>
                        </div>
                        {r.comment && <p className="text-xs text-muted-foreground line-clamp-1">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

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
              <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="font-display">Create New Shop</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name <span className="text-destructive">*</span></Label>
                    <Input value={shopName} onChange={(e) => setShopName(e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number <span className="text-destructive">*</span></Label>
                    <Input value={shopPhone} onChange={(e) => setShopPhone(e.target.value)} placeholder="10-20 chars" minLength={10} maxLength={20} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Address <span className="text-destructive">*</span></Label>
                    <Input value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className="bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>City <span className="text-destructive">*</span></Label>
                      <Input value={shopCity} onChange={(e) => setShopCity(e.target.value)} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={shopState} onChange={(e) => setShopState(e.target.value)} className="bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Zip Code</Label>
                    <Input value={shopZipCode} onChange={(e) => setShopZipCode(e.target.value)} className="bg-background" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Opening Time</Label>
                      <Input type="time" value={shopOpeningTime} onChange={(e) => setShopOpeningTime(e.target.value)} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label>Closing Time</Label>
                      <Input type="time" value={shopClosingTime} onChange={(e) => setShopClosingTime(e.target.value)} className="bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shop Photo (1 image)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setShopImage(e.target.files?.[0] || null)}
                      className="bg-background"
                    />
                  </div>
              <Button className="w-full font-display" onClick={createShop} disabled={isCreatingShop}>
                {isCreatingShop ? "Creating..." : "Create Shop"}
              </Button>
                </div>
              </DialogContent>
            </Dialog>

            {loading ? (
              <div className="text-muted-foreground animate-pulse py-12 text-center border-2 border-dashed border-border/50 rounded-xl">Loading your shops...</div>
            ) : shops.length === 0 ? (
              <div className="text-muted-foreground py-12 text-center border-2 border-dashed border-border/50 rounded-xl">No shops found. Click "Add Shop" to get started!</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {shops.map((shop) => (
                  <motion.div key={shop.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-lg border border-border bg-card p-5 space-y-2">
                    <h3 className="font-display font-bold text-lg">{shop.name}</h3>
                    <p className="text-sm text-muted-foreground">{shop.address}, {shop.city}</p>
                    {shop.phone_number && <p className="text-xs text-muted-foreground">📞 {shop.phone_number}</p>}
                    {(shop.opening_time || shop.closing_time) && (
                      <p className="text-xs text-muted-foreground">🕐 {shop.opening_time || "?"} – {shop.closing_time || "?"}</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="font-display" onClick={() => navigate(`/shops/${shop.id}`)}>View</Button>
                      <Button size="sm" variant="outline" className="font-display" onClick={() => loadBikesForShop(shop.id)}>Load Vehicles</Button>
                      <Button size="sm" variant="outline" className="font-display text-destructive border-destructive/30" onClick={async () => {
                        await api.delete(`/shops/${shop.id}`);
                        setShops((p) => p.filter((s) => s.id !== shop.id));
                        toast({ title: "Shop deleted" });
                      }}>Delete</Button>
                    </div>
                    {shopBikes[shop.id] && (
                      <div className="mt-3 space-y-2">
                        {shopBikes[shop.id].map((bike: any) => (
                          <div key={bike.id} className="text-sm text-muted-foreground flex justify-between items-center border-t border-border pt-2">
                            <span>{bike.name} {bike.model && `· ${bike.model}`} ({bike.bike_type}) {bike.engine_cc ? `— ${bike.engine_cc}cc` : ""}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize text-xs">{bike.condition || "good"}</Badge>
                              <span className="text-primary font-display">₹{bike.price_per_hour}/hr</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6 mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="font-display gap-2"><Plus className="h-4 w-4" /> Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="font-display">Add New Vehicle</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Name <span className="text-destructive">*</span></Label>
                      <Input value={bikeName} onChange={(e) => setBikeName(e.target.value)} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label>Model <span className="text-destructive">*</span></Label>
                      <Input value={bikeModel} onChange={(e) => setBikeModel(e.target.value)} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Type <span className="text-destructive">*</span></Label>
                      <select value={bikeType} onChange={(e) => setBikeType(e.target.value)} className={selectClasses}>
                        <option value="scooty">Scooty</option>
                        <option value="bike">Bike</option>
                        <option value="car">Car</option>
                        <option value="mountain">Mountain</option>
                        <option value="road">Road</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Engine CC</Label>
                      <Input type="number" value={bikeEngineCC} onChange={(e) => setBikeEngineCC(e.target.value)} placeholder="Optional" className="bg-background" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Price/Hour (₹) <span className="text-destructive">*</span></Label>
                      <Input type="number" value={bikePriceHour} onChange={(e) => setBikePriceHour(e.target.value)} className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <Label>Price/Day (₹) <span className="text-destructive">*</span></Label>
                      <Input type="number" value={bikePriceDay} onChange={(e) => setBikePriceDay(e.target.value)} className="bg-background" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <select value={bikeCondition} onChange={(e) => setBikeCondition(e.target.value)} className={selectClasses}>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Available</Label>
                      <select value={bikeAvailable ? "true" : "false"} onChange={(e) => setBikeAvailable(e.target.value === "true")} className={selectClasses}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={bikeDesc} onChange={(e) => setBikeDesc(e.target.value)} className="bg-background" placeholder="Optional" />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Photos (max 3)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setBikeImages(Array.from(e.target.files || []).slice(0, 3))}
                      className="bg-background"
                    />
                    {bikeImages.length > 0 && (
                      <p className="text-xs text-muted-foreground">Selected {bikeImages.length} file(s)</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Shop <span className="text-destructive">*</span></Label>
                    <select value={bikeShopId} onChange={(e) => setBikeShopId(e.target.value)} className={selectClasses}>
                      <option value="">Select shop</option>
                      {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
              <Button className="w-full font-display" onClick={createVehicle} disabled={isCreatingVehicle}>
                {isCreatingVehicle ? "Adding..." : "Add Vehicle"}
              </Button>
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
                  <div className="space-y-2">
                    <Label>Bike ID <span className="text-destructive">*</span></Label>
                    <Input type="number" value={invBikeId} onChange={(e) => setInvBikeId(e.target.value)} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shop <span className="text-destructive">*</span></Label>
                    <select value={invShopId} onChange={(e) => setInvShopId(e.target.value)} className={selectClasses}>
                      <option value="">Select shop</option>
                      {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Quantity <span className="text-destructive">*</span></Label>
                    <Input type="number" value={invQuantity} onChange={(e) => setInvQuantity(e.target.value)} className="bg-background" />
                  </div>
              <Button className="w-full font-display" onClick={createInventory} disabled={isCreatingInventory}>
                {isCreatingInventory ? "Creating..." : "Create"}
              </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid md:grid-cols-2 gap-4">
              {shops.map((shop) => (
                <div key={shop.id} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="font-display font-bold">{shop.name}</h3>
                  <p className="text-xs text-muted-foreground">{shop.address}, {shop.city}</p>
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
