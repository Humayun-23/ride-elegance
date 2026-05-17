import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Mail, Phone, LogOut, Save, Calendar, Star, ChevronRight } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setFirstname(user.firstname || "");
    setLastname(user.lastname || "");
    setPhone(user.phone_number || "");
    api.getUserBookings({ limit: 50 }).then((b) => setBookings(Array.isArray(b) ? b : [])).catch(() => {});
    api.listReviews({ limit: 100 }).then((r) => {
      const mine = Array.isArray(r) ? r.filter((x: any) => x.user_id === user.id) : [];
      setReviews(mine);
    }).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateUser(user.id, { firstname, lastname, phone_number: phone });
      toast({ title: "Profile updated successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-2xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Avatar + Header */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mx-auto">
                <span className="font-display text-3xl font-bold text-primary">
                  {(user?.firstname?.[0] || "U").toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">
                {user?.firstname} {user?.lastname}
              </h1>
              {user?.user_type && (
                <Badge variant="outline" className="font-display capitalize mt-1 text-xs">
                  {user.user_type === "shop_owner" ? "🏪 Shop Owner" : "🏍️ Customer"}
                </Badge>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardContent className="p-6 space-y-5">
              <h2 className="font-display font-bold text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} className="bg-background rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input value={lastname} onChange={(e) => setLastname(e.target.value)} className="bg-background rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Email
                </Label>
                <Input value={user?.email || ""} disabled className="bg-background/50 rounded-xl opacity-60" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Phone
                </Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background rounded-xl" />
              </div>
              <Button className="w-full font-display rounded-xl glow gap-2" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Booking summary */}
          <Card className="border-border/50 bg-card/60 backdrop-blur">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Booking History
                </h2>
                <Button variant="ghost" size="sm" className="font-display gap-1 text-xs" onClick={() => navigate("/bookings")}>
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings yet.</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Total", value: bookings.length },
                      { label: "Active", value: bookings.filter((b) => ["pending", "confirmed"].includes(b.status)).length },
                      { label: "Completed", value: bookings.filter((b) => ["completed", "returned"].includes(b.status)).length },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-secondary/50 p-3 text-center">
                        <p className="font-display text-xl font-bold">{s.value}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {bookings.slice(0, 3).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        className="w-full flex items-center justify-between text-left p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-card transition-all"
                      >
                        <div className="min-w-0">
                          <p className="font-display text-sm font-medium truncate">{b.bike_name || `Booking #${String(b.id).slice(0, 6)}`}</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(b.start_time).toLocaleDateString("en-IN")}</p>
                        </div>
                        <Badge variant="outline" className="capitalize text-[10px] font-display">{b.status}</Badge>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* My reviews */}
          {reviews.length > 0 && (
            <Card className="border-border/50 bg-card/60 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-display font-bold text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" /> My Reviews
                </h2>
                <div className="space-y-2">
                  {reviews.slice(0, 5).map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border border-border/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Bike #{r.bike_id}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`h-3 w-3 ${j < (r.rating || 0) ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-destructive/20 bg-card/60">
            <CardContent className="p-6">
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 font-display rounded-xl gap-2"
                onClick={() => { logout(); navigate("/"); }}
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
