import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Menu, X, User, LogOut, Bookmark, LayoutDashboard, Store, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/features/vehicles/context/FavoritesContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918011401900";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi GoPanda, I need help with a vehicle rental booking.")}`;

const NAV_LINKS = [
  { label: "Rent Vehicles", to: "/search-vehicles" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Rental Shops", to: "/shops" },
  { label: "List Your Shop", to: "/register" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { favorites } = useFavorites();

  const displayName = user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email : "";

  useEffect(() => {
    const handleScroll = () => {
      // Don't apply this effect on desktop sizes
      if (window.innerWidth >= 768) {
        if (!isVisible) setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      
      // Always show at the very top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down past 50px - hide it
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show it
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isVisible]);

  return (
    <nav className={`fixed top-4 inset-x-0 z-50 flex justify-center px-4 md:px-6 pointer-events-none transition-transform duration-300 ${!isVisible ? "-translate-y-[150%] md:translate-y-0" : "translate-y-0"}`}>
      <div className="w-full max-w-6xl flex h-[3.75rem] items-center justify-between rounded-full border border-slate-200/80 bg-white/[0.88] px-4 shadow-[0_18px_45px_rgba(15,23,42,0.14)] ring-1 ring-white/70 backdrop-blur-xl md:px-5 pointer-events-auto transition-all duration-300">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold group">
          <img src="/logo.png" alt="GoPanda Logo" className="h-10 object-contain transition-transform duration-300 group-hover:scale-105" />
          <span className="sr-only">GoPanda</span>
        </Link>

        {/* Desktop Links - Nested Pill */}
        <div className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/80 p-0.5 shadow-sm">
          {NAV_LINKS.map((link) => {
            if (user && link.label === "List Your Shop") return null;
            return (
              <Link key={link.to} to={link.to} className="px-3.5 lg:px-4 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950 hover:bg-white transition-all rounded-full">
                {link.label}
              </Link>
            );
          })}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="px-3.5 lg:px-4 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950 hover:bg-white transition-all rounded-full">
            Contact
          </a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/saved" className="relative p-2 text-slate-600 hover:text-red-500 transition-colors flex items-center justify-center" aria-label="Saved Vehicles">
            <Heart className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {favorites.length}
              </span>
            )}
          </Link>
          {user?.user_type === "shop_owner" && (
            <Button size="sm" onClick={() => navigate("/owner/dashboard?addShop=true")} className="rounded-full glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white border-0 hover:scale-105 transition-all duration-300 font-semibold px-5 h-10">
              <Store className="h-4 w-4 mr-2" /> Add Shop
            </Button>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-full border-slate-200 bg-white/75 text-foreground hover:bg-white transition-all h-10 px-3">
                  <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-[11px] font-display font-bold text-primary">
                      {(user.firstname?.[0] || "U").toUpperCase()}
                    </span>
                  </div>
                  <span className="max-w-[100px] truncate text-sm font-medium">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl border-white/20 glass p-2 shadow-xl">
                <DropdownMenuItem onClick={() => navigate("/bookings")} className="gap-2 rounded-xl focus:bg-primary/10 cursor-pointer">
                  <Bookmark className="h-4 w-4 text-muted-foreground" /> My Bookings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="gap-2 rounded-xl focus:bg-primary/10 cursor-pointer">
                  <User className="h-4 w-4 text-muted-foreground" /> Profile
                </DropdownMenuItem>
                {user.user_type === "shop_owner" && (
                  <DropdownMenuItem onClick={() => navigate("/owner/dashboard")} className="gap-2 rounded-xl focus:bg-primary/10 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="gap-2 rounded-xl text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2 items-center">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login", { state: { from: location.pathname + location.search } })} className="rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-semibold px-5 h-10">
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/register")} className="rounded-full glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white border-0 hover:scale-105 transition-all duration-300 font-semibold px-6 h-10">
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {!user && (
            <Button size="sm" onClick={() => navigate("/register")} className="h-9 px-4 rounded-full text-xs font-semibold glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white border-0">
              Register
            </Button>
          )}
          {user?.user_type === "shop_owner" && (
            <Button size="sm" onClick={() => navigate("/owner/dashboard?addShop=true")} className="h-9 px-4 rounded-full text-xs font-semibold glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white border-0">
              Add Shop
            </Button>
          )}
          <button
            className="text-foreground p-2 rounded-full hover:bg-slate-100 transition-colors pointer-events-auto"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-4 right-4 md:hidden rounded-2xl border border-slate-200 bg-white/[0.96] shadow-elevated overflow-hidden pointer-events-auto"
          >
            <div className="p-4 space-y-1 backdrop-blur-xl">
              {user?.user_type !== "shop_owner" && (
                <>
                  {NAV_LINKS.map((link) => {
                    if (user && link.label === "List Your Shop") return null;
                    const isActive = location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to));
                    return (
                      <Link key={link.to} to={link.to} className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${isActive ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-slate-100"}`} onClick={() => setMobileOpen(false)}>
                        {link.label}
                      </Link>
                    );
                  })}
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-slate-100 rounded-xl transition-colors" onClick={() => setMobileOpen(false)}>
                    Contact
                  </a>
                </>
              )}

              {user ? (
                <>
                  <div className="h-px bg-slate-200 my-2 mx-4" />
                  <Link to="/bookings" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(false)}>
                    My Bookings
                  </Link>
                  <Link to="/profile" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(false)}>
                    Profile
                  </Link>
                  {user.user_type === "shop_owner" && (
                    <Link to="/owner/dashboard" className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(false)}>
                      Dashboard
                    </Link>
                  )}
                  <button
                    className="w-full text-left px-4 py-3 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
                    onClick={() => { logout(); setMobileOpen(false); navigate("/"); }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2">
                  <Button variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/5 h-11" onClick={() => { setMobileOpen(false); navigate("/login", { state: { from: location.pathname + location.search } }); }}>
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
