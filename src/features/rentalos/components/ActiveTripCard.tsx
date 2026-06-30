import { CalendarClock, CarFront, User, Wallet, CheckCircle2 } from 'lucide-react';
import type { RentalBooking } from '../types';
import { secondaryButtonClass } from './ui';

interface ActiveTripCardProps {
  booking: RentalBooking;
  onRecordPayment: (booking: RentalBooking) => void;
  onCompleteTrip: (booking: RentalBooking) => void;
}

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? '--:--' : date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function ActiveTripCard({ booking, onRecordPayment, onCompleteTrip }: ActiveTripCardProps) {
  const hasBalance = booking.balance_due > 0;
  
  const customerName = `${booking.customer?.firstname || ''} ${booking.customer?.lastname || ''}`.trim() || 'Walk-in customer';
  const vehicleName = booking.bike?.name || `Vehicle #${booking.bike_id}`;

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-5 flex flex-col h-full font-[Poppins]">
      
      {/* Top Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[color:var(--rl-brand-soft)] flex items-center justify-center text-[color:var(--rl-brand-deep)] shrink-0">
            <CarFront className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-[color:var(--rl-ink)] leading-tight">{vehicleName}</h3>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-green-50 text-[color:var(--rl-brand-deep)] border border-green-100 rounded-full text-[11px] font-bold uppercase tracking-wider">
          Active
        </span>
      </div>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-[13px] text-[color:var(--rl-ink)] truncate">{customerName}</span>
        </div>
        <p className="text-[12px] text-gray-500 pl-6">{booking.customer?.phone_number || 'No phone number'}</p>
      </div>

      {/* Time & Financial Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
            <CalendarClock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Pickup</span>
          </div>
          <p className="text-[13px] font-bold text-[color:var(--rl-ink)]">
            {formatDate(booking.start_time)} at {formatTime(booking.start_time)}
          </p>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
            <CalendarClock className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Return</span>
          </div>
          <p className="text-[13px] font-bold text-[color:var(--rl-ink)]">
            {formatDate(booking.end_time)} at {formatTime(booking.end_time)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Deposit</span>
          </div>
          <p className="text-[13px] font-bold text-[color:var(--rl-ink)]">
            ₹{currency.format(booking.security_deposit || 0)}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-gray-400 mb-0.5">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Balance</span>
          </div>
          <p className={`text-[13px] font-bold ${hasBalance ? 'text-[#8a5a10]' : 'text-[color:var(--rl-brand-deep)]'}`}>
            ₹{currency.format(booking.balance_due || 0)}
          </p>
        </div>
      </div>

      {/* Payment Status Badge */}
      <div className="mb-auto pb-4">
        {hasBalance ? (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-[#fff8e6] text-[#8a5a10] border border-[#ffe4a0]">
            Balance Pending
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold bg-green-50 text-[color:var(--rl-brand-deep)] border border-green-100">
            Payment Clear
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-5 border-t border-gray-100 mt-auto">
        {hasBalance && (
          <button
            type="button"
            onClick={() => onRecordPayment(booking)}
            className="flex-1 h-12 rounded-2xl border-2 border-gray-100 bg-white text-[color:var(--rl-ink)] font-bold text-[14px] hover:border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Record Payment
          </button>
        )}
        <button
          type="button"
          onClick={() => onCompleteTrip(booking)}
          className="flex-1 h-12 rounded-2xl bg-gradient-to-b from-[#40c48a] to-[#3bb881] hover:from-[#3bb881] hover:to-[#32a472] text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(59,184,129,0.25)] ring-1 ring-black/5 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          Complete Trip <CheckCircle2 className="w-4 h-4 stroke-[2.5px]" />
        </button>
      </div>

    </div>
  );
}
