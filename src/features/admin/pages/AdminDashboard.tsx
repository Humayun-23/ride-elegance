import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAdminShops, getShopDashboardMetrics, getAdminBookings, createAdminShop, uploadAdminShopImage, deleteAdminShop, getAdminShopBikes, deleteAdminBike, updateAdminBike } from "@/features/admin/services/adminService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { Plus, Store, Bike, Package, Calendar, TrendingUp, Star, Activity, Code, ActivitySquare, Percent, LayoutDashboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { getAdminAnalytics } from "@/features/admin/services/adminService";
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
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Vehicles state
  const [allBikes, setAllBikes] = useState<any[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(true);

  // Modal states
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("addShop") === "true") {
      setIsShopModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Shop form
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [shopLocationMapLink, setShopLocationMapLink] = useState("");
  const [shopCity, setShopCity] = useState("");
  const [shopState, setShopState] = useState("");
  const [shopZipCode, setShopZipCode] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [shopOpeningTime, setShopOpeningTime] = useState("");
  const [shopClosingTime, setShopClosingTime] = useState("");
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [shopUpiId, setShopUpiId] = useState("");
  const [isCreatingShop, setIsCreatingShop] = useState(false);

  useEffect(() => {
    if (!user || (user.user_type !== "shop_owner" && user.user_type !== "admin")) {
      navigate("/login");
      return;
    }
    const isAdmin = user.user_type === "admin";

    Promise.all([
      getAdminShops(isAdmin).catch(() => ({ data: [] })),
      getShopDashboardMetrics().catch(() => ({ data: null })),
      getAdminBookings({ limit: 100 }).catch(() => ({ data: [] }))
    ]).then(([shopsRes, metricsRes, bookingsRes]) => {
      setShops(shopsRes.data || []);

      // Fetch bikes for all shops
      const fetchedShops = shopsRes.data || [];
      if (fetchedShops.length > 0) {
        Promise.all(fetchedShops.map((shop: any) => getAdminShopBikes(shop.id)))
          .then((responses) => {
            const bikes = responses.flatMap(r => r.data || []);
            setAllBikes(bikes);
          })
          .catch(() => setAllBikes([]))
          .finally(() => setLoadingBikes(false));

        getAdminAnalytics().then(res => {
          setAnalytics(res.data);
        }).catch(err => console.error(err));
      } else {
        setLoadingBikes(false);
      }

      if (metricsRes.data) {
        setDashboardMetrics(metricsRes.data);
        setAllReviews(metricsRes.data.recent_reviews || []);
      }

      setAllBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      setLoading(false);
    });
  }, [user]);

  const resetShopForm = () => {
    setShopName(""); setShopPhone(""); setShopAddress(""); setShopLocationMapLink(""); setShopCity("");
    setShopState(""); setShopZipCode(""); setShopDesc("");
    setShopOpeningTime(""); setShopClosingTime(""); setShopUpiId(""); setShopImage(null);
  };

  const createShop = async () => {
    if (!shopName.trim() || shopName.length > 50) {
      toast({ title: "Shop name is required (max 50 characters)", variant: "destructive" });
      return;
    }
    
    const phoneDigits = shopPhone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 20) {
      toast({ title: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }

    if (!shopAddress.trim() || !shopCity.trim()) {
      toast({ title: "Address and City are required", variant: "destructive" });
      return;
    }

    if (shopUpiId && shopUpiId.length > 50) {
      toast({ title: "UPI ID cannot exceed 50 characters", variant: "destructive" });
      return;
    }

    setIsCreatingShop(true);
    try {
      const payload: any = {
        name: shopName,
        phone_number: shopPhone,
        address: shopAddress,
        location_map_link: shopLocationMapLink,
        city: shopCity,
      };
      if (shopDesc) payload.description = shopDesc;
      if (shopState) payload.state = shopState;
      if (shopZipCode) payload.zip_code = shopZipCode;
      if (shopOpeningTime) payload.opening_time = shopOpeningTime;
      if (shopClosingTime) payload.closing_time = shopClosingTime;
      if (shopUpiId) payload.upi_id = shopUpiId;

      const shop = (await createAdminShop(payload)).data;
      let created = shop;
      if (shopImage) {
        try {
          const formData = new FormData();
          formData.append("file", shopImage);
          created = (await uploadAdminShopImage(shop.id, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })).data;
        } catch (err: any) {
          toast({ title: "Shop created, image upload failed", description: err.message, variant: "destructive" });
        }
      }
      setShops((p) => [...p, created]);
      resetShopForm();
      toast({ title: "Shop created!" });
      setIsShopModalOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreatingShop(false);
    }
  };

  const totalBikes = dashboardMetrics?.total_bikes ?? 0;
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Shop Owner <span className="text-gradient">Dashboard</span>
          </h1>
          <Button onClick={() => window.open("/rentalos", "_blank")} className="bg-teal-500 hover:bg-teal-600 text-white font-bold gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Open RentalOS
          </Button>
        </div>

        {/* Quick nav */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Shop", to: "/owner/shop", icon: Store, desc: "Edit shop details" },
            { label: "Inventory", to: "/owner/inventory", icon: Package, desc: "Manage vehicles" },
            { label: "Bookings", to: "/owner/bookings", icon: Bike, desc: "Confirm / complete" },
            { label: "Reviews", to: "/owner/reviews", icon: Plus, desc: "Customer feedback" },
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

        {/* Quick Stats (KPIs) */}
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

        {/* My Vehicles Section */}
        <div className="space-y-6 mt-12 mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6 text-primary" /> My Vehicles</h2>
            <Button className="font-display gap-2" onClick={() => navigate("/owner/inventory?add=true")}><Plus className="h-4 w-4" /> Add Vehicle</Button>
          </div>

          {loadingBikes ? (
            <div className="text-muted-foreground animate-pulse py-12 text-center border-2 border-dashed border-border/50 rounded-xl">Loading your vehicles...</div>
          ) : allBikes.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center border-2 border-dashed border-border/50 rounded-xl">No vehicles found. Click "Add Vehicle" to get started!</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBikes.map((bike) => (
                <motion.div key={bike.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-lg border border-border bg-card p-5 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display font-bold text-lg">{bike.name}</h3>
                    <div className="flex gap-2">
                      {bike.maintenance_status && bike.maintenance_status !== "available" && (
                        <Badge variant="destructive" className="capitalize text-[10px] bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">{bike.maintenance_status}</Badge>
                      )}
                      <Badge variant="outline" className="capitalize text-xs">{bike.bike_type}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{bike.model}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">₹{bike.price_per_hour}/hr • ₹{bike.price_per_day}/day</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">{bike.is_available !== false ? 'Available' : 'Unavailable'}</span>
                      <Switch
                        checked={bike.is_available !== false}
                        onCheckedChange={async (checked) => {
                          try {
                            const updated = (await updateAdminBike(bike.id, { ...bike, is_available: checked })).data;
                            setAllBikes((p) => p.map((x) => (x.id === updated.id ? updated : x)));
                            toast({ title: checked ? "Marked available" : "Marked unavailable" });
                          } catch (err: any) {
                            toast({ title: "Error", description: err.message, variant: "destructive" });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 mt-2 border-t border-border/50">
                    <Button size="sm" variant="outline" className="font-display flex-1" onClick={() => navigate(`/owner/inventory?edit=${bike.id}`)}>Edit</Button>
                    <Button size="sm" variant="outline" className="font-display text-destructive border-destructive/30 flex-1" onClick={async () => {
                      if (!confirm(`Delete ${bike.name}?`)) return;
                      await deleteAdminBike(bike.id);
                      setAllBikes((p) => p.filter((b) => b.id !== bike.id));
                      toast({ title: "Vehicle deleted" });
                    }}>Delete</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-border/50 bg-card/60 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Revenue (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.revenue_over_time} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 flex flex-col">
              <Card className="flex-1 border-border/50 bg-card/60 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" /> Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[150px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.top_performers} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                        <RechartsTooltip cursor={{ fill: 'hsl(var(--secondary))' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

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

        {/* Invisible Create Shop Modal */}
        <Dialog open={isShopModalOpen} onOpenChange={setIsShopModalOpen}>
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
              <div className="space-y-2">
                <Label>Shop Location Map Link</Label>
                <Input value={shopLocationMapLink} onChange={(e) => setShopLocationMapLink(e.target.value)} placeholder="Google Maps Link" className="bg-background" />
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
                <Label>UPI ID (For direct token payments)</Label>
                <Input value={shopUpiId} onChange={(e) => setShopUpiId(e.target.value)} placeholder="e.g., shopname@ybl" className="bg-background" />
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

      </div>
    </div>
  );
}
