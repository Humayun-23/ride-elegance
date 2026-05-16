import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function PasswordReset() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (!token) {
      toast({ title: "Missing reset token", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.passwordResetConfirm({ token, new_password: password });
      setDone(true);
      toast({ title: "Password updated" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md px-4">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
        <Card className="glass border-border/50">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold">Reset your password</h1>
              <p className="text-sm text-muted-foreground">Enter a new password for your account.</p>
            </div>
            {done ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" /> Password updated. Redirecting…
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>New password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm password</Label>
                  <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" disabled={loading} className="w-full font-display glow">
                  {loading ? "Saving…" : "Update password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
