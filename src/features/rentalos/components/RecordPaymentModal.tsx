import { useEffect, useState } from 'react';
import { QrCode, Wallet, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { getPayments, recordPayment } from '../services/rentalosService';
import { getShop } from '../../shops/services/shopService';
import { rentalOSErrorMessage } from '../hooks/useRentalOSQueries';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';
import type { RentalBooking, RentalPayment, RentalPaymentCreatePayload, RentalPaymentMethod, RentalPaymentType } from '../types';

interface RecordPaymentModalProps {
  booking: RentalBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onRecorded: () => void;
}

const PAYMENT_TYPES: Array<{ value: RentalPaymentType; label: string }> = [
  { value: 'advance', label: 'Advance' },
  { value: 'balance', label: 'Balance' },
  { value: 'security_deposit', label: 'Security deposit' },
  { value: 'refund', label: 'Refund' },
  { value: 'extra_charge', label: 'Extra charge' },
];

const PAYMENT_METHODS: Array<{ value: RentalPaymentMethod; label: string }> = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'other', label: 'Other' },
];

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

type PaymentShop = {
  name?: string;
  upi_id?: string;
};

export default function RecordPaymentModal({ booking, isOpen, onClose, onRecorded }: RecordPaymentModalProps) {
  const [paymentType, setPaymentType] = useState<RentalPaymentType>('balance');
  const [paymentMethod, setPaymentMethod] = useState<RentalPaymentMethod>('cash');
  const [amount, setAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [payments, setPayments] = useState<RentalPayment[]>([]);
  const [shop, setShop] = useState<PaymentShop | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen || !booking) return;

    setPaymentType(booking.balance_due > 0 ? 'balance' : 'advance');
    setPaymentMethod('cash');
    setAmount(booking.balance_due > 0 ? String(booking.balance_due) : '');
    setReferenceNumber('');
    setShop(null);
    setMessage('');
    setLoadingPayments(true);

    Promise.all([
      getPayments(booking.id).then((res) => res.data).catch(() => [] as RentalPayment[]),
      getShop(booking.shop_id).then((res) => res.data as PaymentShop).catch(() => null),
    ])
      .then(([paymentData, shopData]) => {
        setPayments(paymentData);
        setShop(shopData);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoadingPayments(false));
  }, [booking, isOpen]);

  if (!booking) return null;

  const customerName = `${booking.customer?.firstname || ''} ${booking.customer?.lastname || ''}`.trim() || 'Walk-in customer';
  const vehicleName = booking.bike?.name || `Vehicle #${booking.bike_id}`;
  const qrAmount = amount || String(booking.balance_due || '');
  const upiUrl = shop?.upi_id && qrAmount
    ? `upi://pay?pa=${shop.upi_id}&pn=${encodeURIComponent(shop.name || 'Shop Owner')}&am=${qrAmount}.00&cu=INR&tn=${encodeURIComponent(`Booking #${booking.id} Payment`)}`
    : '';

  const submit = async () => {
    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setMessage('Enter a positive payment amount.');
      return;
    }

    setSaving(true);
    setMessage('');

    const payload: RentalPaymentCreatePayload = {
      payment_type: paymentType,
      amount: paymentAmount,
      status: 'paid',
      method: paymentMethod,
      reference_number: referenceNumber.trim() || undefined,
      paid_at: new Date().toISOString(),
    };

    try {
      await recordPayment(booking.id, payload);
      toast.success('Payment recorded successfully');
      onRecorded();
      onClose();
    } catch (err: unknown) {
      setMessage(rentalOSErrorMessage(err, 'Failed to record payment.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[color:var(--rl-ink)]">
            <Wallet className="h-5 w-5 text-[color:var(--rl-brand-deep)]" />
            Record payment
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            {customerName} · {vehicleName} · pending ₹{currency.format(booking.balance_due || 0)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Payment type</label>
              <select value={paymentType} onChange={(event) => setPaymentType(event.target.value as RentalPaymentType)} className={inputClass}>
                {PAYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Method</label>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as RentalPaymentMethod)} className={inputClass}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Amount"
              autoFocus
              className={`${inputClass} text-lg`}
            />
          </div>

          <div>
            <label className={labelClass}>Reference number</label>
            <input
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
              placeholder="Optional reference number"
              className={inputClass}
            />
          </div>

          {paymentMethod === 'upi' && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <h4 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                <QrCode className="h-3.5 w-3.5" />
                Scan to pay
              </h4>
              {upiUrl ? (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="rl-num text-xl font-bold text-[color:var(--rl-ink)]">₹{currency.format(Number(qrAmount) || 0)}</p>
                    <p className="mt-1 text-[11px] font-semibold text-[color:var(--rl-muted)]">{shop?.upi_id}</p>
                  </div>
                  <div className="shrink-0 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                    <QRCodeSVG value={upiUrl} size={92} level="L" />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-[13px] font-semibold text-red-600">
                  <XCircle className="h-4 w-4 shrink-0" />
                  UPI ID is not configured for this shop.
                </div>
              )}
            </div>
          )}

          <p className="text-[12px] text-[color:var(--rl-muted)]">
            {loadingPayments ? 'Loading payments...' : `${payments.length} payment(s) recorded`}
          </p>

          {message && (
            <div className="flex items-center gap-2 rounded-lg bg-[color:var(--rl-danger-soft)] px-3 py-2 text-[13px] font-semibold text-[color:var(--rl-danger)]">
              <XCircle className="h-4 w-4 shrink-0" />
              {message}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} disabled={saving} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving} className={primaryButtonClass}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? 'Recording...' : 'Record payment'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
