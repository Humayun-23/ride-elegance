import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CarFront, Users, Plus, Phone, Hash } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useRentalOS } from './RentalOSContext';
import { searchCustomer, getBooking } from '../services/rentalosService';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { shopId, setSelectedBooking } = useRentalOS();
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const run = (fn: () => void) => {
    fn();
    onOpenChange(false);
  };

  const trimmed = query.trim();
  const isDigits = /^\d+$/.test(trimmed);
  const isPhone = /^\+?\d{7,}$/.test(trimmed.replace(/\s|-/g, ''));

  const lookupCustomer = async () => {
    if (!shopId || !isPhone) return;
    setBusy(true);
    try {
      const res = await searchCustomer(shopId, trimmed.replace(/\s|-/g, ''));
      if (res.data.found) {
        run(() => navigate(`/rentalos/customers?phone=${encodeURIComponent(trimmed)}`));
      } else {
        run(() => navigate(`/rentalos/customers?phone=${encodeURIComponent(trimmed)}&new=1`));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const openBookingById = async () => {
    if (!isDigits) return;
    setBusy(true);
    try {
      const res = await getBooking(trimmed);
      run(() => {
        setSelectedBooking(res.data);
        navigate('/rentalos/bookings');
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search customer by phone, booking #, or jump to…"
      />
      <CommandList>
        <CommandEmpty>
          {busy ? 'Searching…' : 'No matches. Try a phone number, booking ID, or "new walk-in".'}
        </CommandEmpty>

        {trimmed && (isPhone || isDigits) && (
          <>
            <CommandGroup heading="Quick lookup">
              {isPhone && (
                <CommandItem onSelect={lookupCustomer}>
                  <Phone className="w-4 h-4 mr-2" />
                  Look up customer <span className="ml-1 font-mono">{trimmed}</span>
                </CommandItem>
              )}
              {isDigits && (
                <CommandItem onSelect={openBookingById}>
                  <Hash className="w-4 h-4 mr-2" />
                  Open booking <span className="ml-1 font-mono">#{trimmed}</span>
                </CommandItem>
              )}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => run(() => navigate('/rentalos/bookings?new=1'))}>
            <Plus className="w-4 h-4 mr-2" />
            New walk-in booking
            <span className="ml-auto rl-kbd">N</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/rentalos/customers?new=1'))}>
            <Plus className="w-4 h-4 mr-2" />
            Add customer
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Jump to">
          <CommandItem onSelect={() => run(() => navigate('/rentalos'))}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
            <span className="ml-auto rl-kbd">G D</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/rentalos/bookings'))}>
            <FileText className="w-4 h-4 mr-2" />
            Bookings
            <span className="ml-auto rl-kbd">G B</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/rentalos/vehicles'))}>
            <CarFront className="w-4 h-4 mr-2" />
            Vehicles
            <span className="ml-auto rl-kbd">G V</span>
          </CommandItem>
          <CommandItem onSelect={() => run(() => navigate('/rentalos/customers'))}>
            <Users className="w-4 h-4 mr-2" />
            Customers
            <span className="ml-auto rl-kbd">G C</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
