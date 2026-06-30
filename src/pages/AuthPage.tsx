import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/common/SEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { stripIndianPrefix } from "@/lib/phone";

export default function AuthPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === "/register" ? "register" : "login");

  // Sync tab with URL if user uses browser back/forward buttons
  useEffect(() => {
    setActiveTab(location.pathname === "/register" ? "register" : "login");
  }, [location.pathname]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    window.history.replaceState({}, "", `/${val}`);
  };

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"customer" | "shop_owner">("customer");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (activeTab === "login") setLoginLoading(true);
      else setRegLoading(true);

      await googleLogin(credentialResponse.credential, activeTab === "register" ? userType : "customer");
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err: any) {
      toast({ title: "Google authentication failed", description: err.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
      setRegLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err: any) {
      if (String(err.message || "").toLowerCase().includes("email not verified")) {
        toast({ title: "Verify your email", description: "Check your inbox to activate your account." });
        navigate(`/verify-email?email=${encodeURIComponent(loginEmail)}`);
        return;
      }
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  // TODO: Remove demo login before launching to real users.
  const handleDemoLogin = async () => {
    setLoginEmail("demo@gopanda.in");
    setLoginPassword("demo123");
    setLoginLoading(true);
    try {
      await login("demo@gopanda.in", "demo123");
      const from = location.state?.from || "/";
      navigate(from);
    } catch (err: any) {
      toast({
        title: "Demo account not found",
        description: "Please register a user with email 'demo@gopanda.in' and password 'demo123' first.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = stripIndianPrefix(phone).replace(/\D/g, "");
    if (firstname.length < 1 || firstname.length > 50) {
      toast({ title: "First name must be 1-50 characters", variant: "destructive" });
      return;
    }
    if (lastname.length < 1 || lastname.length > 50) {
      toast({ title: "Last name must be 1-50 characters", variant: "destructive" });
      return;
    }
    if (phoneDigits.length !== 10) {
      toast({ title: "Please enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    if (regPassword.length < 8 || regPassword.length > 128) {
      toast({ title: "Password must be 8-128 characters", variant: "destructive" });
      return;
    }
    setRegLoading(true);
    try {
      await register({ firstname, lastname, email: regEmail, password: regPassword, phone_number: phoneDigits, user_type: userType });
      const from = location.state?.from || "/";
      navigate(`/verify-email?email=${encodeURIComponent(regEmail)}`, { state: { justRegistered: true, from } });
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 relative overflow-hidden">
      <SEO title={activeTab === "login" ? "Sign In | GoPanda" : "Create Account | GoPanda"} noindex={true} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(152_45%_36%/0.04),transparent_50%)]" />

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
          <p className="text-muted-foreground text-sm">
            {activeTab === "login" ? "Welcome back! Sign in to continue." : "Create your account to get started."}
          </p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur shadow-xl">
          <CardContent className="p-1 sm:p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="login" className="rounded-lg font-display">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg font-display">Sign Up</TabsTrigger>
              </TabsList>

              {activeTab === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-1.5 mb-6 overflow-hidden"
                >
                  <Label className="text-[11px] sm:text-xs font-display uppercase tracking-wider text-muted-foreground">I am a</Label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {(["customer", "shop_owner"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUserType(type)}
                        className={`p-2 sm:p-2.5 rounded-xl border-2 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${userType === type
                            ? "border-primary bg-primary/5 text-primary shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
                          }`}
                      >
                        <span className="text-sm sm:text-base">{type === "customer" ? "🏍️" : "🏪"}</span>
                        <span>{type === "customer" ? "Customer" : "Shop Owner"}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="mb-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast({ title: "Google login failed", variant: "destructive" })}
                  shape="rectangular"
                  theme="outline"
                  text={activeTab === "login" ? "signin_with" : "signup_with"}
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

              <AnimatePresence mode="wait">
                <TabsContent value="login" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <motion.form
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLoginSubmit}
                    className="space-y-4 px-3 sm:px-0"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="loginEmail" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="loginEmail" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className="bg-background pl-10 rounded-xl" placeholder="you@email.com" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="loginPassword" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="loginPassword" type={showLoginPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className="bg-background pl-10 pr-10 rounded-xl" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <div className="flex flex-col gap-3 pt-1">
                      <Button type="submit" className="w-full font-display rounded-xl glow" disabled={loginLoading}>
                        {loginLoading ? <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Signing in...</span> : "Sign In"}
                      </Button>
                      {/* TODO: Remove this demo login button before launching to real users. */}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full font-display rounded-xl border-dashed border-2 hover:bg-muted/50"
                        disabled={loginLoading}
                        onClick={handleDemoLogin}
                      >
                        <span className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          Try Demo Account
                        </span>
                      </Button>
                    </div>
                  </motion.form>
                </TabsContent>

                <TabsContent value="register" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                  <motion.form
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleRegisterSubmit}
                    className="space-y-4 px-3 sm:px-0 pb-4"
                  >


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
                      <Label htmlFor="regEmail" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="regEmail" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="bg-background pl-10 rounded-xl" placeholder="you@email.com" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                      <div className="relative flex items-center">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <span className="absolute left-9 text-sm text-foreground">+91</span>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            const v = stripIndianPrefix(e.target.value).replace(/\D/g, "");
                            if (v.length <= 10) setPhone(v);
                          }}
                          required
                          className="bg-background pl-[68px] rounded-xl"
                          placeholder="9876543210"
                          inputMode="numeric"
                          autoComplete="tel-national"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="regPassword" className="text-xs font-display uppercase tracking-wider text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="regPassword" type={showRegPassword ? "text" : "password"} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required className="bg-background pl-10 pr-10 rounded-xl" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full font-display rounded-xl glow mt-4" disabled={regLoading}>
                      {regLoading ? <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Creating...</span> : "Create Account"}
                    </Button>
                  </motion.form>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
