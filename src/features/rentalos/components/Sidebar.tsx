import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, CarFront, Users, FileText, X, LogOut, ChevronsLeft, ChevronsRight, UserCog, ClipboardList } from 'lucide-react';
import { useRentalOS } from './RentalOSContext';
import { useAuth } from '@/features/auth/context/AuthContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/rentalos', icon: LayoutDashboard, hint: 'G D' },
  { name: 'Bookings', path: '/rentalos/bookings', icon: FileText, hint: 'G B' },
  { name: 'Vehicles', path: '/rentalos/vehicles', icon: CarFront, hint: 'G V' },
  { name: 'Inventory', path: '/rentalos/inventory', icon: ClipboardList, hint: 'G I' },
  { name: 'Customers', path: '/rentalos/customers', icon: Users, hint: 'G C' },
  { name: 'Staff', path: '/rentalos/staff', icon: UserCog, hint: 'G S' },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function Rail({ collapsed, onClose, onToggle }: { collapsed: boolean; onClose?: () => void; onToggle?: () => void }) {
  const { pathname } = useLocation();
  const { activeShop, isOwner } = useRentalOS();
  const { user, logout } = useAuth();

  return (
    <div className="rl-rail flex flex-col h-full">
      {/* Brand + shop */}
      <div className={`h-14 flex items-center border-b border-white/5 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <div className="w-7 h-7 rounded-md bg-[#3bb881] flex items-center justify-center shrink-0">
          <span className="text-[#010101] font-black text-sm">R</span>
        </div>
        {!collapsed && (
          <div className="ml-2.5 flex-1 min-w-0">
            <div className="text-[13px] font-bold text-white leading-tight tracking-tight">RentalOS</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider truncate">
              {activeShop?.shop_name || 'No shop'}
            </div>
          </div>
        )}
        {onClose && !collapsed && (
          <button onClick={onClose} className="md:hidden p-1.5 rounded text-white/60 hover:bg-white/10" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-2'} py-3 space-y-0.5 overflow-y-auto`}>
        {!collapsed && (
          <div className="px-2 pb-1.5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            Workspace
          </div>
        )}
        {NAV_ITEMS.filter((item) => {
          if (item.name === 'Staff' && !isOwner) return false;
          if (item.name === 'Inventory' && !isOwner) return false;
          return true;
        }).map((item) => {
          const isActive = item.path === '/rentalos' ? pathname === '/rentalos' : pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              data-active={isActive}
              className={`rl-rail-item group flex items-center rounded-md text-[13px] ${collapsed ? 'justify-center h-9 w-9 mx-auto' : 'gap-2.5 px-2.5 h-9'
                }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  <span className="rl-kbd opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
                    {item.hint}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/5 p-2">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {(user?.firstname?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-white truncate leading-tight">
                {user?.firstname} {user?.lastname}
              </div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">
                {isOwner ? 'Owner' : 'Staff'}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-9 h-9 mx-auto flex items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {onToggle && (
          <button
            onClick={onToggle}
            className={`hidden md:flex w-full items-center justify-center mt-1 h-7 rounded-md text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useRentalOS();

  return (
    <>
      <aside
        className={`hidden md:flex shrink-0 transition-[width] duration-200 ${sidebarCollapsed ? 'w-[56px]' : 'w-[220px]'
          }`}
      >
        <Rail collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-black/50"
              onClick={onClose}
            />
            <motion.aside
              className="relative h-full w-64 max-w-[85vw] shadow-xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 420, damping: 38, mass: 0.8 }}
            >
              <Rail collapsed={false} onClose={onClose} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
