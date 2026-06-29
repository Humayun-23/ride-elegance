import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { stripIndianPrefix } from "@/lib/phone";
import { SEO } from "@/components/common/SEO";

export default function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"customer" | "shop_owner">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      await googleLogin(credentialResponse.credential, userType);
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err: any) {
      toast({ title: "Google login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstname.trim() || firstname.length > 50) {
      toast({ title: "First name is required (max 50 characters)", variant: "destructive" });
      return;
    }
    if (!lastname.trim() || lastname.length > 50) {
      toast({ title: "Last name is required (max 50 characters)", variant: "destructive" });
      return;
    }
    
    // Validate phone number digits
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 20) {
      toast({ title: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters long", variant: "destructive" });
      return;
    }
    if (password.length > 128) {
      toast({ title: "Password cannot exceed 128 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register({ firstname, lastname, email, password, phone_number: phone, user_type: userType });
      const from = location.state?.from || "/";
      navigate(`/verify-email?email=${encodeURIComponent(email)}`, { state: { justRegistered: true, from } });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative">
      <SEO title="Create Account | GoPanda" noindex={true} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(45_100%_51%/0.05),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center space-y-3 mb-8">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src="/wordmark.png" alt="GoPanda Logo" className="h-10 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
          </Link>
          <p className="text-muted-foreground text-sm">Create your account to get started</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="p-6">
            {/* Account type toggle */}
            <div className="space-y-1.5 mb-6">
              <Label className="text-xs font-display uppercase tracking-wider text-muted-foreground">I am a</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["customer", "shop_owner"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setUserType(type)}
                    className={`p-3 rounded-xl border-2 text-sm font-display transition-all ${
                      userType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
                    }`}
                  >
                    {type === "customer" ? "🏍️ Customer" : "🏪 Shop Owner"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast({ title: "Google login failed", variant: "destructive" })}
                shape="rectangular"
                theme="outline"
                text="signup_with"
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


              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstname" className="text-xs font-display uppercase tracking-wider text-muted-foreground">First Name</Label>
                  <Input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} required maxLength={50} placeholder="John" className="bg-background rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastname" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Last Name</Label>
                  <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required maxLength={50} placeholder="Doe" className="bg-background rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-background rounded-xl" placeholder="you@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">+91</span>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(stripIndianPrefix(e.target.value))}
                    required
                    minLength={10}
                    maxLength={20}
                    placeholder="98765 43210"
                    className="bg-background rounded-xl pl-12"
                    inputMode="tel"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={128}
                    placeholder="Min 8 characters"
                    className="bg-background pr-10 rounded-xl"
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
              <Button type="submit" className="w-full font-display rounded-xl glow" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
