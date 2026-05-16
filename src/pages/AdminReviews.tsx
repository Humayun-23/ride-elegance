import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, ArrowLeft } from "lucide-react";

export default function AdminReviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.listReviews({ limit: 100 }).then((r) => setReviews(Array.isArray(r) ? r : [])).catch(() => setReviews([])).finally(() => setLoading(false));
  }, [user]);

  const avg = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1) : "—";
  const byBike: Record<string, any[]> = {};
  reviews.forEach((r) => {
    const k = String(r.bike_id || "unknown");
    (byBike[k] = byBike[k] || []).push(r);
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-5xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold">Reviews <span className="text-gradient">Management</span></h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <span className="font-display text-2xl font-bold">{avg}</span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{reviews.length} total</p>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : reviews.length === 0 ? (
          <Card className="border-dashed border-border/50 bg-transparent">
            <CardContent className="p-12 text-center text-muted-foreground">No reviews yet.</CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(byBike).map(([bikeId, list]) => {
              const bikeAvg = (list.reduce((a, r) => a + (r.rating || 0), 0) / list.length).toFixed(1);
              return (
                <div key={bikeId} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-display cursor-pointer" onClick={() => navigate(`/bikes/${bikeId}`)}>Bike #{bikeId}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-primary fill-primary" /> {bikeAvg} · {list.length} reviews
                    </span>
                  </div>
                  <div className="space-y-2">
                    {list.map((r) => (
                      <Card key={r.id} className="border-border/30 bg-card/40">
                        <CardContent className="p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-display font-medium">{r.user_name || `User #${r.user_id}`}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} className={`h-3 w-3 ${j < (r.rating || 0) ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                          {r.created_at && <p className="text-[10px] text-muted-foreground/60">{new Date(r.created_at).toLocaleString("en-IN")}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
