import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset, confirmPasswordReset } from "@/features/auth/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Mail, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset({ email });
      toast({ title: "Check your email for a reset token" });
      setStep("confirm");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({ title: "Token is required", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      toast({ title: "Password must be 8-128 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset({ token, new_password: newPassword });
      setDone(true);
      toast({ title: "Password reset successful!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(45_100%_51%/0.05),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center space-y-3 mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Car className="h-7 w-7 text-primary" />
            <span><span className="text-primary">Go</span><span className="text-foreground">Panda</span></span>
          </Link>
          <p className="text-muted-foreground text-sm">
            {done ? "All done!" : step === "request" ? "Reset your password" : "Enter your reset token"}
          </p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="p-6">
            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 py-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-sm text-foreground">Password has been reset successfully.</p>
                <Button asChild className="w-full font-display rounded-xl">
                  <Link to="/login">Back to Login</Link>
                </Button>
              </motion.div>
            ) : step === "request" ? (
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background pl-10 rounded-xl" placeholder="you@email.com" />
                  </div>
                </div>
                <Button type="submit" className="w-full font-display rounded-xl" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Token"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="token" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Reset Token</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Paste from email" className="bg-background pl-10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-display uppercase tracking-wider text-muted-foreground">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} maxLength={128} placeholder="Min 8 characters" className="bg-background rounded-xl" />
                </div>
                <Button type="submit" className="w-full font-display rounded-xl" disabled={loading}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary w-full transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to email step
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
