import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, LogOut, Bookmark, LayoutDashboard, ChevronDown } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 glass transition-all duration-300">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 font-display text-xl font-bold group">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full group-hover:bg-primary/40 transition-colors" />
            <Car className="h-6 w-6 text-primary relative z-10 transition-transform group-hover:scale-110" />
          </div>
          <span className="tracking-tight"><span className="text-gradient">Go</span><span className="text-foreground">Panda</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/search-vehicles" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all rounded-lg hover:bg-primary/5">
            Explore
          </Link>
          <Link to="/shops" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-all rounded-lg hover:bg-primary/5">
            Shops
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-all rounded-lg hover:bg-primary/5">
                Locations <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem asChild>
                <a href="/rent/car/in/guwahati">Guwahati</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/rent/car/in/jorhat">Jorhat</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/rent/car/in/dibrugarh">Dibrugarh</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/rent/car/in/tezpur">Tezpur</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/rent/car/in/silchar">Silchar</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/rent/car/in/shillong">Shillong</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                  <DropdownMenuItem onClick={() => navigate("/owner/dashboard")} className="gap-2">
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="rounded-xl text-primary hover:text-primary/80 hover:bg-primary/5 font-semibold">
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/register")} className="rounded-xl glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white border-0 hover:scale-105 transition-transform font-bold">
                Register
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!user && (
            <Button size="sm" onClick={() => navigate("/register")} className="h-8 px-3 rounded-lg text-xs font-bold glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white border-0">
              Register
            </Button>
          )}
          <button className="text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <div className="p-4 space-y-1">
              <Link to="/search-vehicles" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                Explore
              </Link>
              <Link to="/shops" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                Shops
              </Link>
              <div className="py-2 border-y border-border/60 my-2">
                 <span className="block px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Locations</span>
                 <Link to="/rent/car/in/guwahati" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>Guwahati</Link>
                 <Link to="/rent/car/in/jorhat" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>Jorhat</Link>
                 <Link to="/rent/car/in/dibrugarh" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>Dibrugarh</Link>
                 <Link to="/rent/car/in/tezpur" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>Tezpur</Link>
                 <Link to="/rent/car/in/silchar" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>Silchar</Link>
                 <Link to="/rent/car/in/shillong" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>Shillong</Link>
              </div>
              {user ? (
                <>
                  <Link to="/bookings" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                    My Bookings
                  </Link>
                  <Link to="/profile" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
                    Profile
                  </Link>
                  {user.user_type === "shop_owner" && (
                    <Link to="/owner/dashboard" className="block px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/50 transition-colors" onClick={() => setMobileOpen(false)}>
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
                <div className="pt-2">
                  <Button variant="outline" className="w-full rounded-xl border-primary text-primary hover:bg-primary/5" onClick={() => { setMobileOpen(false); navigate("/login"); }}>
                    Login
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
