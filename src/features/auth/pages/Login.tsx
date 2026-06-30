import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { SEO } from "@/components/common/SEO";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential);
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err: any) {
      toast({ title: "Google login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // TODO: Remove this demo login function before launching to real clients
  const handleDemoLogin = async () => {
    setEmail("demo@gopanda.io");
    setPassword("demo123");
    setLoading(true);
    try {
      await login("demo@gopanda.io", "demo123");
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err: any) {
      toast({ 
        title: "Demo account not found", 
        description: "Please register a user with email 'demo@gopanda.io' and password 'demo123' first.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err: any) {
      if (String(err.message || "").toLowerCase().includes("email not verified")) {
        toast({ title: "Verify your email", description: "Check your inbox to activate your account." });
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <SEO title="Sign In | GoPanda" noindex={true} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(152_45%_36%/0.04),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center space-y-3 mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src="/wordmark.png" alt="GoPanda Logo" className="h-10 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
          </Link>
          <p className="text-muted-foreground text-sm">Welcome back! Sign in to continue.</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="p-6">
            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast({ title: "Google login failed", variant: "destructive" })}
                shape="rectangular"
                theme="outline"
                text="signin_with"
                size="large"
              />
            </div>
            
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background pl-10 rounded-xl"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background pl-10 pr-10 rounded-xl"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="flex flex-col gap-3 mt-2">
                <Button type="submit" className="w-full font-display rounded-xl glow" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                
                {/* TODO: Remove this demo button block before launching */}
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full font-display rounded-xl border-dashed border-2 hover:bg-muted/50" 
                  disabled={loading}
                  onClick={handleDemoLogin}
                >
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    Try Demo Account
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
