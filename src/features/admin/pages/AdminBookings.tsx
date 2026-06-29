import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminBookings, getAdminBookingById, actionAdminBooking } from "@/features/admin/services/adminService";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ArrowLeft, CheckCircle2, XCircle, Flag, RotateCcw } from "lucide-react";

const FILTERS = ["all", "pending", "confirmed", "completed", "refunded", "cancelled"] as const;
//blank comment
const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  paid: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  completed: "bg-primary/10 text-primary border-primary/30",
  returned: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  refund_pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  refunded: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function AdminBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getAdminBookings().then((res) => setBookings(res.data)).catch(() => setBookings([]));
  }, [user]);

  const refresh = async (id: string) => {
    try {
      const fresh = (await getAdminBookingById(id)).data;
      setBookings((p) => p.map((b) => (b.id === fresh.id ? fresh : b)));
    } catch { }
  };

  const act = async (id: string, action: "confirm" | "reject" | "complete" | "return") => {
    setBusyId(id);
    try {
      await actionAdminBooking(id, action);
      await refresh(id);
      toast({ title: `Booking ${action}${action.endsWith("e") ? "d" : "ed"}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setBusyId(null); }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const fmt = (d?: string) => d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-6xl space-y-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="font-display text-3xl font-bold">Bookings <span className="text-gradient">Management</span></h1>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-display uppercase tracking-wider transition-all whitespace-nowrap ${filter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Card className="border-border/50 bg-card/60">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>UTR</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-10">No bookings</TableCell></TableRow>
                ) : filtered.map((b) => (
                  <TableRow key={b.id} className="cursor-pointer" onClick={() => navigate(`/bookings/${b.id}`)}>
                    <TableCell className="font-mono text-xs">#{String(b.id).slice(0, 6)}</TableCell>
                    <TableCell>{b.customer_name || b.customer_id || "—"}</TableCell>
                    <TableCell>{b.bike_name || b.bike_id || "—"}</TableCell>
                    <TableCell>{fmt(b.start_time)}</TableCell>
                    <TableCell>{fmt(b.end_time)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${STATUS_COLOR[b.status]} capitalize`}>{b.status}</Badge>
                    </TableCell>
                    <TableCell>{b.total_price != null ? `₹${b.total_price}` : "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{b.utr_number || "—"}</TableCell>
                    <TableCell className="text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      {["pending", "confirmed"].includes(b.status) && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" title="Reject / Flag Fake Payment" disabled={busyId === b.id} onClick={() => act(b.id, "reject")}><XCircle className="h-4 w-4" /></Button>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" disabled={busyId === b.id} onClick={() => act(b.id, "complete")}><Flag className="h-4 w-4" /></Button>
                      )}
                      {b.status === "completed" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-sky-400" disabled={busyId === b.id} onClick={() => act(b.id, "return")}><RotateCcw className="h-4 w-4" /></Button>
                      )}
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
