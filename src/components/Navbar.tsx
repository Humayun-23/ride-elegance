import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, LogOut, Bookmark, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email : "";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-gradient">GoPanda</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/search-vehicles" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
            Explore
          </Link>
          <Link to="/shops" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
            Shops
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 ml-2 rounded-xl">
                  <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-display font-bold text-primary">
                      {(user.firstname?.[0] || "U").toUpperCase()}
                    </span>
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/bookings")} className="gap-2">
                  <Bookmark className="h-4 w-4" /> My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2">
                  <User className="h-4 w-4" /> Profile
                </DropdownMenuItem>
                {user.user_type === "shop_owner" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")} className="gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2 ml-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-xl">
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate("/register")} className="rounded-xl glow">
                Get Started
              </Button>
            </div>
          )}
        </div>

        <button className="md:hidden text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 space-y-1">
              <Link to="/search-vehicles" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                Explore
              </Link>
              <Link to="/shops" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                Shops
              </Link>
              {user ? (
                <>
                  <Link to="/bookings" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                    My Bookings
                  </Link>
                  <Link to="/profile" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                    Profile
                  </Link>
                  {user.user_type === "shop_owner" && (
                    <Link to="/admin" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button
                    className="w-full text-left px-3 py-2.5 text-sm text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                    onClick={() => { logout(); setMobileOpen(false); navigate("/"); }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2 space-y-2">
                  <Button variant="outline" className="w-full rounded-xl" onClick={() => { setMobileOpen(false); navigate("/login"); }}>
                    Sign In
                  </Button>
                  <Button className="w-full rounded-xl glow" onClick={() => { setMobileOpen(false); navigate("/register"); }}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
