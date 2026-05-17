import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"customer" | "shop_owner">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (firstname.length < 1 || firstname.length > 50) {
      toast({ title: "First name must be 1-50 characters", variant: "destructive" });
      return;
    }
    if (lastname.length < 1 || lastname.length > 50) {
      toast({ title: "Last name must be 1-50 characters", variant: "destructive" });
      return;
    }
    if (phone.length < 10 || phone.length > 20) {
      toast({ title: "Phone number must be 10-20 characters", variant: "destructive" });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      toast({ title: "Password must be 8-128 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await register({ firstname, lastname, email, password, phone_number: phone, user_type: userType });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
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
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Car className="h-7 w-7 text-primary" />
            <span className="text-gradient">GoPanda</span>
          </Link>
          <p className="text-muted-foreground text-sm">Create your account to get started</p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account type toggle */}
              <div className="space-y-1.5">
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
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={10} maxLength={20} placeholder="+91 98765 43210" className="bg-background rounded-xl" />
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
