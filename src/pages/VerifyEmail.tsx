import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuthToken } = useAuth();
  const { toast } = useToast();
  const token = searchParams.get("token") || "";
  const emailFromQuery = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [status, setStatus] = useState<"idle" | "verifying" | "verified" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const canVerify = useMemo(() => token.length > 0, [token]);

  useEffect(() => {
    if (!canVerify) return;
    setStatus("verifying");
    api.verifyEmail(token)
      .then((res) => {
        setStatus("verified");
        setMessage(res.message || "Email verified successfully.");
        if (res.access_token) {
          setAuthToken(res.access_token);
          setTimeout(() => navigate("/", { replace: true }), 900);
        }
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message || "Verification failed.");
      });
  }, [canVerify, navigate, setAuthToken, token]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(seconds - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const resend = async () => {
    if (resendCooldown > 0) return;
    if (!email) {
      toast({ title: "Email required", description: "Enter your email to resend the verification link.", variant: "destructive" });
      return;
    }
    setResending(true);
    try {
      const res = await api.resendVerification(email);
      setResendCooldown(30);
      toast({ title: "Verification email sent", description: res.message });
    } catch (err: any) {
      toast({ title: "Resend failed", description: err.message, variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(45_100%_51%/0.05),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Mail className="h-7 w-7 text-primary" />
            <span className="text-gradient">Verify Email</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {canVerify ? "Finalizing your account…" : "Check your inbox for a verification link."}
          </p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="p-6 space-y-4">
            {status === "verifying" && (
              <div className="text-sm text-muted-foreground">Verifying your email…</div>
            )}
            {status === "verified" && (
              <div className="flex items-center gap-2 text-emerald-500 text-sm">
                <CheckCircle2 className="h-4 w-4" /> {message}
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" /> {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="bg-background rounded-xl"
              />
            </div>

            <Button className="w-full font-display rounded-xl glow" onClick={resend} disabled={resending || resendCooldown > 0}>
              {resending
                ? "Sending…"
                : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend verification link"}
            </Button>

            <div className="text-xs text-muted-foreground text-center">
              Already verified? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
