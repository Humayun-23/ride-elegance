import { useState } from 'react';
import { AlertTriangle, CheckCircle2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { completeBooking } from '../services/rentalosService';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';
import { rentalOSErrorMessage } from '../hooks/useRentalOSQueries';
import type { RentalBooking, RentalBookingCompletePayload, RentalCustomerFlagSeverity, RentalCustomerFlagType } from '../types';

interface CompleteTripModalProps {
  booking: RentalBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onRecordPayment: (booking: RentalBooking) => void;
}

type CompleteTripFlagOption = {
  value: RentalCustomerFlagType;
  label: string;
  severity: RentalCustomerFlagSeverity;
  requiresNote: boolean;
};

const BASE_FLAGS: Array<{ value: RentalCustomerFlagType; label: string }> = [
  { value: 'good_customer', label: 'Good customer' },
  { value: 'normal_customer', label: 'Normal customer' },
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'payment_issue', label: 'Payment issue' },
  { value: 'late_return', label: 'Late return' },
  { value: 'damage_issue', label: 'Damage issue' },
  { value: 'document_issue', label: 'Document issue' },
  { value: 'blocked', label: 'Blocked' },
];

const FLAGS: CompleteTripFlagOption[] = BASE_FLAGS.map((flag) => ({
  severity: flag.value === 'blocked' ? 'blocked' : flag.value === 'good_customer' || flag.value === 'normal_customer' ? 'info' : 'warning',
  requiresNote: !['good_customer', 'normal_customer'].includes(flag.value),
  ...flag,
}));

export default function CompleteTripModal({ booking, isOpen, onClose, onComplete, onRecordPayment }: CompleteTripModalProps) {
  const [note, setNote] = useState('');
  const [flag, setFlag] = useState<RentalCustomerFlagType | ''>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!booking) return null;

  const hasBalance = booking.balance_due > 0;
  const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

  const handleComplete = async () => {
    const selectedFlag = FLAGS.find((item) => item.value === flag);
    const cleanNote = note.trim();

    if (selectedFlag?.requiresNote && !cleanNote) {
      setMessage('A note is required for this customer flag.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const payload: RentalBookingCompletePayload = {
        completed_at: new Date().toISOString(),
        note: cleanNote || undefined,
      };

      if (selectedFlag) {
        payload.customer_flag_type = selectedFlag.value;
        payload.customer_flag_severity = selectedFlag.severity;
        payload.customer_flag_note = cleanNote || `Customer marked as ${selectedFlag.label.toLowerCase()} at trip completion.`;
      }

      await completeBooking(booking.id, payload);
      toast.success('Trip completed successfully');
      onComplete();
    } catch (err: unknown) {
      setMessage(rentalOSErrorMessage(err, 'Failed to complete trip'));
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/95 backdrop-blur-md">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[color:var(--rl-ink)]">
              <CheckCircle2 className="w-6 h-6 text-[color:var(--rl-brand-deep)]" />
              Complete this trip?
            </DialogTitle>
            <DialogDescription className="text-[13px] pt-1">
              Once completed, this booking will be marked as completed and the vehicle will become available again for future bookings.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-[13px] text-[color:var(--rl-muted)]">Customer</span>
              <span className="text-[13px] font-semibold text-[color:var(--rl-ink)]">
                {booking.customer?.firstname || 'Walk-in'} {booking.customer?.lastname || ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[color:var(--rl-muted)]">Vehicle</span>
              <span className="text-[13px] font-semibold text-[color:var(--rl-ink)]">
                {booking.bike?.name} ({booking.bike?.model || booking.bike?.bike_type})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[13px] text-[color:var(--rl-muted)]">Return time</span>
              <span className="text-[13px] font-semibold text-[color:var(--rl-ink)]">
                {new Date(booking.end_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between pt-2 mt-2 border-t border-gray-200">
              <span className="text-[13px] font-semibold text-[color:var(--rl-ink)]">Pending balance</span>
              <span className={`text-[14px] font-bold ${hasBalance ? 'text-[#8a5a10]' : 'text-[color:var(--rl-brand-deep)]'}`}>
                ₹{currency.format(booking.balance_due || 0)}
              </span>
            </div>
          </div>

          {hasBalance && (
            <div className="mt-4 p-3 bg-[color:var(--rl-warn-soft)] rounded-lg flex items-start gap-2 border border-[#8a5a10]/20">
              <AlertTriangle className="w-5 h-5 text-[#8a5a10] shrink-0 mt-0.5" />
              <p className="text-[13px] font-semibold text-[#8a5a10] leading-tight">
                Balance is still pending. Record payment before completing or mark as pending note.
              </p>
            </div>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className={labelClass}>Customer Note (Optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add return condition, customer behavior, payment note, or any important detail..."
                className={`${inputClass} min-h-[80px] py-2 resize-none`}
              />
            </div>

            <div>
              <label className={labelClass}>Customer Flag (Optional)</label>
              <select
                value={flag}
                onChange={(e) => setFlag(e.target.value as RentalCustomerFlagType | '')}
                className={inputClass}
              >
                <option value="">No flag</option>
                {FLAGS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              {FLAGS.find((item) => item.value === flag)?.requiresNote && (
                <p className="mt-1 text-[11px] font-medium text-[#8a5a10]">
                  Backend requires a note for this flag.
                </p>
              )}
            </div>
          </div>

          {message && <p className="mt-3 text-red-500 text-sm font-semibold">{message}</p>}
        </div>

        <div className="mt-6 p-4 border-t bg-gray-50 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={loading} className={secondaryButtonClass}>
            Cancel
          </button>
          {hasBalance && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onRecordPayment(booking)}
              className="px-4 h-10 rounded-lg border border-[#8a5a10] text-[#8a5a10] font-semibold text-[13px] hover:bg-[color:var(--rl-warn-soft)] transition-colors"
            >
              Record Payment
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={handleComplete}
            className="px-6 h-10 rounded-lg bg-[#3bb881] text-white font-bold text-[13px] hover:bg-[#32a472] transition-colors shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Completing...' : 'Complete Trip'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
