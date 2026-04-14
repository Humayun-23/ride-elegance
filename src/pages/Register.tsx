import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"customer" | "shop_owner">("customer");
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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-gradient">RIDEX</span>
          </Link>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} required maxLength={50} placeholder="1-50 chars" className="bg-card" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} required maxLength={50} placeholder="1-50 chars" className="bg-card" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={10} maxLength={20} placeholder="10-20 chars" className="bg-card" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userType">Account Type</Label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value as "customer" | "shop_owner")}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <option value="customer">Customer</option>
              <option value="shop_owner">Shop Owner</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={128} placeholder="8-128 chars" className="bg-card" />
          </div>
          <Button type="submit" className="w-full font-display" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
