import { Home, Search, Bookmark, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";

export default function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const NAV_ITEMS = [
    { label: "Home", to: "/", icon: Home },
    { label: "Search", to: "/search-vehicles", icon: Search },
    { label: "Bookings", to: "/bookings", icon: Bookmark, requiresAuth: true },
    { label: "Profile", to: user ? "/profile" : "/login", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          if (item.requiresAuth && !user) return null;
          
          const isActive = location.pathname === item.to || (item.to === "/profile" && location.pathname === "/login" && !user);

          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
