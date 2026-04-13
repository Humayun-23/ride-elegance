import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setFirstname(user.firstname || "");
    setLastname(user.lastname || "");
    setPhone(user.phone_number || "");
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.updateUser(user.id, { firstname, lastname, phone_number: phone });
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4 max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex rounded-full bg-card border border-border p-6">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold">Profile</h1>
          {user?.user_type && (
            <Badge variant="outline" className="font-display capitalize">{user.user_type.replace("_", " ")}</Badge>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={firstname} onChange={(e) => setFirstname(e.target.value)} className="bg-card" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={lastname} onChange={(e) => setLastname(e.target.value)} className="bg-card" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="bg-card opacity-50" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-card" />
          </div>
          <Button className="w-full font-display" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" className="w-full text-destructive border-destructive/30" onClick={() => { logout(); navigate("/"); }}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
