import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-gradient">RIDEX</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explore</Link>
          <Link to="/shops" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shops</Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  {displayName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/bookings")}>My Bookings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
                {user.user_type === "shop_owner" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>Dashboard</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
              <Button size="sm" onClick={() => navigate("/register")}>Get Started</Button>
            </div>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          <Link to="/search" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Explore</Link>
          <Link to="/shops" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Shops</Link>
          {user ? (
            <>
              <Link to="/bookings" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>My Bookings</Link>
              <Link to="/profile" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Profile</Link>
              {user.user_type === "shop_owner" && (
                <Link to="/admin" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              )}
              <button className="text-sm text-destructive" onClick={() => { logout(); setMobileOpen(false); navigate("/"); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="block text-sm text-primary font-semibold" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
