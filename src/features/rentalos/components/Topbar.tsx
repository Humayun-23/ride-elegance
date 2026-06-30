import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Plus, ChevronDown, Check, LayoutGrid } from 'lucide-react';
import { useRentalOS } from './RentalOSContext';
import CommandPaletteTrigger from './CommandPaletteTrigger';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TopbarProps {
  onMenuClick?: () => void;
  onOpenCommand?: () => void;
}

const TITLES: Record<string, string> = {
  '/rentalos': 'Command Center',
  '/rentalos/vehicles': 'Vehicles',
  '/rentalos/bookings': 'Bookings',
  '/rentalos/customers': 'Customers',
};

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export default function Topbar({ onMenuClick, onOpenCommand }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeShop, shops, isOwner, setActiveShopId, openCatalogue } = useRentalOS();
  const title = TITLES[location.pathname] || 'RentalOS';
  const now = useNow();

  return (
    <header className="h-14 bg-white border-b sticky top-0 z-10 px-3 sm:px-4 flex items-center gap-3 shrink-0" style={{ borderColor: 'var(--rl-border)' }}>
      <div className="flex items-center gap-2 min-w-0">
        <h1 className="text-[14px] font-semibold tracking-tight truncate" style={{ color: 'var(--rl-ink)' }}>
          {title}
        </h1>
      </div>

      <div className="flex-1 flex justify-center px-2">
        <CommandPaletteTrigger onClick={() => onOpenCommand?.()} />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Live shift clock */}
        <div className="hidden lg:flex flex-col items-end leading-tight pr-2 mr-1 border-r" style={{ borderColor: 'var(--rl-border)' }}>
          <span className="rl-num text-[12px] font-semibold" style={{ color: 'var(--rl-ink)' }}>
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </span>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--rl-faint)' }}>
            {now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
          </span>
        </div>

        {/* Shop switcher popover */}
        {shops.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] font-medium border bg-white hover:bg-[color:var(--rl-hover)]"
                style={{ borderColor: 'var(--rl-border)', color: 'var(--rl-ink)' }}
              >
                <span className="truncate max-w-[140px]">{activeShop?.shop_name || 'Select shop'}</span>
                <span className="rl-pill rl-pill-mute">{isOwner ? 'Owner' : 'Staff'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-1">
              <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Switch shop</div>
              {shops.map((shop) => {
                const active = shop.shop_id === activeShop?.shop_id;
                return (
                  <button
                    key={`${shop.role}-${shop.shop_id}`}
                    onClick={() => setActiveShopId(shop.shop_id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-left hover:bg-[color:var(--rl-hover)] ${active ? 'font-semibold' : ''}`}
                    style={{ color: 'var(--rl-ink)' }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{shop.shop_name}</div>
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--rl-faint)' }}>{shop.role}</div>
                    </div>
                    {active && <Check className="w-4 h-4" style={{ color: 'var(--rl-brand)' }} />}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        )}

        <button
          type="button"
          onClick={openCatalogue}
          className="rl-btn-ghost inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] font-semibold border"
          style={{ borderColor: 'var(--rl-border)' }}
          aria-label="Open vehicle catalogue"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Catalogue</span>
        </button>

        <button
          type="button"
          onClick={onMenuClick}
          className="rl-btn-ghost md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md border"
          style={{ borderColor: 'var(--rl-border)' }}
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/rentalos/bookings?new=1')}
          className="rl-btn-primary hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New booking</span>
        </button>
      </div>
    </header>
  );
}
