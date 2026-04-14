import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      await api.passwordResetRequest({ email });
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
      await api.passwordResetConfirm({ token, new_password: newPassword });
      setDone(true);
      toast({ title: "Password reset successful!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-gradient">RIDEX</span>
          </Link>
          <p className="text-muted-foreground text-sm">Reset your password</p>
        </div>
        {done ? (
          <div className="text-center space-y-4">
            <p className="text-foreground">Password has been reset successfully.</p>
            <Link to="/login" className="text-primary hover:underline text-sm">Back to login</Link>
          </div>
        ) : step === "request" ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card" />
            </div>
            <Button type="submit" className="w-full font-display" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Token"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Reset Token</Label>
              <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Paste token from email" className="bg-card" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} maxLength={128} placeholder="8-128 chars" className="bg-card" />
            </div>
            <Button type="submit" className="w-full font-display" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            <button type="button" onClick={() => setStep("request")} className="text-sm text-muted-foreground hover:text-primary w-full text-center">
              ← Back to email step
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
