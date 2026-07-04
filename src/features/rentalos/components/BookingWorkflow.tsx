import { useEffect, useRef, useState } from 'react';
import { FileUp, NotebookPen, RefreshCcw, Wallet, XCircle, Image as ImageIcon, Phone, QrCode, Upload, Camera, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  addBookingNote,
  cancelBooking,
  getBooking,
  getBookingDocuments,
  getBookingNotes,
  getHandoverPhotos,
  getPayments,
  recordPayment,
  uploadBookingDocument,
  uploadHandoverPhoto,
} from '../services/rentalosService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { getShop } from '../../shops/services/shopService';
import { QRCodeSVG } from 'qrcode.react';
import { inputClass, EmptyState } from './ui';
import type {
  RentalBooking,
  RentalBookingNote,
  RentalDocument,
  RentalHandoverPhoto,
  RentalPayment,
  RentalPaymentCreatePayload,
  RentalPaymentMethod,
  RentalPaymentType,
} from '../types';
import { rentalOSErrorMessage, rentalOSKeys, useInvalidateRentalOS } from '../hooks/useRentalOSQueries';
import type { ManageBookingFocus } from './RentalOSContext';

interface BookingWorkflowProps {
  booking: RentalBooking | null;
  focusSection?: ManageBookingFocus;
  onFocusHandled?: () => void;
  onChanged?: () => void;
}

const sectionClass = 'border border-gray-200 rounded-lg p-4 space-y-3 bg-white scroll-mt-6';
const sectionTitleClass = 'text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2';
const actionButtonClass = 'w-full h-[44px] rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50';

type WorkflowShop = {
  name?: string;
  upi_id?: string;
};

export default function BookingWorkflow({ booking, focusSection, onFocusHandled, onChanged }: BookingWorkflowProps) {
  const queryClient = useQueryClient();
  const invalidateRentalOS = useInvalidateRentalOS();
  const paymentAmountRef = useRef<HTMLInputElement | null>(null);
  const [detail, setDetail] = useState<RentalBooking | null>(booking);
  const [documents, setDocuments] = useState<RentalDocument[]>([]);
  const [photos, setPhotos] = useState<RentalHandoverPhoto[]>([]);
  const [payments, setPayments] = useState<RentalPayment[]>([]);
  const [notes, setNotes] = useState<RentalBookingNote[]>([]);
  const [shop, setShop] = useState<WorkflowShop | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [documentType, setDocumentType] = useState('driving_license');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isDocumentUpdateMode, setIsDocumentUpdateMode] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [handoverFile, setHandoverFile] = useState<File | null>(null);
  const [locationAddress, setLocationAddress] = useState('');

  const [paymentType, setPaymentType] = useState<RentalPaymentType>('advance');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<RentalPaymentMethod>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');

  const bookingId = booking?.id;

  const loadWorkflow = () => {
    if (!bookingId) return;
    setLoading(true);
    setMessage('');
    queryClient.fetchQuery({
      queryKey: rentalOSKeys.booking(bookingId),
      queryFn: async () => (await getBooking(bookingId)).data,
      staleTime: 30 * 1000,
    })
      .then(async (res) => {
        const current = res;
        setDetail(current);
        const [docsRes, photosRes, paymentsRes, notesRes, shopRes] = await Promise.all([
          queryClient.fetchQuery({
            queryKey: rentalOSKeys.bookingDocuments(bookingId),
            queryFn: async () => (await getBookingDocuments(bookingId)).data,
            staleTime: 30 * 1000,
          }),
          queryClient.fetchQuery({
            queryKey: rentalOSKeys.bookingHandoverPhotos(bookingId),
            queryFn: async () => (await getHandoverPhotos(bookingId)).data,
            staleTime: 30 * 1000,
          }),
          queryClient.fetchQuery({
            queryKey: rentalOSKeys.bookingPayments(bookingId),
            queryFn: async () => (await getPayments(bookingId)).data,
            staleTime: 30 * 1000,
          }),
          queryClient.fetchQuery({
            queryKey: rentalOSKeys.bookingNotes(bookingId),
            queryFn: async () => (await getBookingNotes(bookingId)).data,
            staleTime: 30 * 1000,
          }),
          getShop(current.shop_id).catch(() => ({ data: null })),
        ]);
        setDocuments(docsRes);
        setPhotos(photosRes);
        setPayments(paymentsRes);
        setNotes(notesRes);
        setShop(shopRes.data);
      })
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to load booking workflow'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setDetail(booking);
    loadWorkflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  useEffect(() => {
    if (!booking || focusSection !== 'payment') return;

    setPaymentType('balance');
    if (booking.balance_due > 0) {
      setPaymentAmount(String(booking.balance_due));
    }

    const timer = window.setTimeout(() => {
      document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      paymentAmountRef.current?.focus();
      paymentAmountRef.current?.select();
      onFocusHandled?.();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [booking, focusSection, onFocusHandled]);

  if (!booking) {
    return (
      <EmptyState
        icon={<NotebookPen className="w-6 h-6" />}
        message="Select a booking to upload documents, record payments, add notes, or complete the trip."
      />
    );
  }

  const runAction = (action: () => Promise<unknown>, success: string, onSuccess?: () => void) => {
    setLoading(true);
    setMessage('');
    action()
      .then(() => {
        setMessage(success);
        void queryClient.invalidateQueries({ queryKey: rentalOSKeys.booking(booking.id) });
        invalidateRentalOS(booking.shop_id);
        loadWorkflow();
        onSuccess?.();
        onChanged?.();
      })
      .catch((err: unknown) => setMessage(rentalOSErrorMessage(err, 'Action failed')))
      .finally(() => setLoading(false));
  };

  const handleDocumentUpload = () => {
    if (!documentFile) {
      setMessage('Choose a document file first');
      return;
    }
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', documentFile);
    runAction(() => uploadBookingDocument(booking.id, formData), 'Document uploaded', () => {
      setDocumentFile(null);
      setIsDocumentUpdateMode(false);
      setShowConsentModal(false);
    });
  };

  const handleHandoverUpload = () => {
    if (!handoverFile) {
      setMessage('Choose a handover photo first');
      return;
    }
    const formData = new FormData();
    formData.append('file', handoverFile);
    formData.append('location_permission_granted', String(Boolean(locationAddress)));
    if (locationAddress) formData.append('location_address', locationAddress);
    formData.append('captured_at', new Date().toISOString());
    runAction(() => uploadHandoverPhoto(booking.id, formData), 'Handover photo uploaded', () => setHandoverFile(null));
  };

  const handlePayment = () => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setMessage('Enter a positive payment amount');
      return;
    }
    const payload: RentalPaymentCreatePayload = {
      payment_type: paymentType,
      amount,
      status: 'paid',
      method: paymentMethod,
      reference_number: referenceNumber || undefined,
      paid_at: new Date().toISOString(),
    };

    runAction(() => recordPayment(booking.id, payload), 'Payment recorded');
  };

  const handleNote = () => {
    if (!note.trim()) {
      setMessage('Enter a note first');
      return;
    }
    runAction(() => addBookingNote(booking.id, note), 'Note added');
    setNote('');
  };

  const isError = message.includes('failed') || message.includes('Choose') || message.includes('Enter');

  return (
    <div className="flex flex-col h-full space-y-5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h4 className="text-[15px] font-bold text-[color:var(--rl-ink)]">
            Booking #{booking.id} · {detail?.customer?.firstname || 'Walk-in'} {detail?.customer?.lastname}
          </h4>
          <p className="text-[13px] text-[color:var(--rl-muted)] mt-0.5 font-medium">
            {detail?.bike?.name || `Bike ${booking.bike_id}`} · <span className="uppercase text-[11px] font-bold tracking-wide">{detail?.status}</span> · Balance ₹{detail?.balance_due ?? booking.balance_due}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadWorkflow} className="h-10 px-3 rounded-lg bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] text-[13px] font-semibold flex items-center gap-1.5 hover:bg-gray-200 transition-colors">
            <RefreshCcw className="w-4 h-4" /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button type="button" onClick={() => runAction(() => cancelBooking(booking.id), 'Booking cancelled')} className="h-10 px-3 rounded-lg bg-[color:var(--rl-danger-soft)] text-[color:var(--rl-danger)] text-[13px] font-semibold flex items-center gap-1.5 hover:bg-red-100 transition-colors">
            <XCircle className="w-4 h-4" /> <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-[13px] font-semibold px-3 py-2 rounded-md ${isError ? 'bg-[color:var(--rl-danger-soft)] text-[color:var(--rl-danger)]' : 'bg-green-50 text-green-700'}`}>{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20">
        <section className={sectionClass}>
          <h5 className={sectionTitleClass}><FileUp className="w-4 h-4" /> Documents</h5>
          <select
            value={documentType}
            onChange={(e) => {
              setDocumentType(e.target.value);
              setIsDocumentUpdateMode(false);
              setDocumentFile(null);
            }}
            className={`${inputClass} min-h-[44px]`}
          >
            <option value="driving_license">Driving license</option>
            <option value="id_proof">ID proof</option>
          </select>

          {(() => {
            // Sort by created_at descending so we get the most recent one
            const currentDocs = documents.filter(d => d.document_type === documentType).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            const currentDoc = currentDocs.length > 0 ? currentDocs[0] : null;

            return (
              <>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!currentDoc}
                    onClick={() => {
                      if (currentDoc?.file_url) window.open(currentDoc.file_url, '_blank');
                    }}
                    className={`flex-1 h-11 rounded-lg text-[13px] font-semibold border transition-colors ${currentDoc ? 'border-gray-200 bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] hover:bg-gray-200' : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'}`}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDocumentUpdateMode(!isDocumentUpdateMode)}
                    className={`flex-1 h-11 rounded-lg text-[13px] font-semibold border transition-colors ${isDocumentUpdateMode ? 'border-[color:var(--rl-brand)] bg-[color:var(--rl-brand-soft)] text-[color:var(--rl-brand-deep)]' : 'border-gray-200 bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] hover:bg-gray-200'}`}
                  >
                    Update
                  </button>
                </div>

                {isDocumentUpdateMode && (
                  <>
                    <div className="flex flex-col gap-2">
                      {!documentFile ? (
                        <div className="flex gap-2">
                          <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] text-[13px] font-semibold cursor-pointer border border-gray-200 hover:bg-gray-200 transition-colors">
                            <Upload className="w-4 h-4" /> Choose file
                            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setDocumentFile(e.target.files?.[0] || null)} />
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] text-[13px] font-semibold cursor-pointer border border-gray-200 hover:bg-gray-200 transition-colors">
                            <Camera className="w-4 h-4" /> Take photo
                            <input type="file" capture="environment" className="hidden" accept="image/*" onChange={e => setDocumentFile(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 border border-[color:var(--rl-brand)] rounded-lg bg-green-50">
                          <span className="text-[13px] font-medium truncate flex-1 text-[color:var(--rl-ink)]">{documentFile.name}</span>
                          <button type="button" onClick={() => setDocumentFile(null)} className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button type="button" disabled={loading || !documentFile} onClick={() => setShowConsentModal(true)} className={actionButtonClass}>
                      Upload document
                    </button>
                  </>
                )}
              </>
            );
          })()}
        </section>

        <section className={sectionClass}>
          <h5 className={sectionTitleClass}><ImageIcon className="w-4 h-4" /> Handover photo</h5>
          <div className="flex flex-col gap-2">
            {!handoverFile ? (
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] text-[13px] font-semibold cursor-pointer border border-gray-200 hover:bg-gray-200 transition-colors">
                  <Upload className="w-4 h-4" /> Choose file
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={e => setHandoverFile(e.target.files?.[0] || null)} />
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] text-[13px] font-semibold cursor-pointer border border-gray-200 hover:bg-gray-200 transition-colors">
                  <Camera className="w-4 h-4" /> Take photo
                  <input type="file" capture="environment" className="hidden" accept="image/*" onChange={e => setHandoverFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border border-[color:var(--rl-brand)] rounded-lg bg-green-50">
                <span className="text-[13px] font-medium truncate flex-1 text-[color:var(--rl-ink)]">{handoverFile.name}</span>
                <button type="button" onClick={() => setHandoverFile(null)} className="p-1 text-gray-500 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="Optional handover location" className={`${inputClass} min-h-[44px]`} />
          <button type="button" disabled={loading || !handoverFile} onClick={handleHandoverUpload} className={actionButtonClass}>
            Upload handover photo
          </button>
          <p className="text-[12px] text-[color:var(--rl-muted)] mt-2">{photos.length} handover photo(s) uploaded</p>
        </section>

        <section id="payment-section" className={sectionClass}>
          <h5 className={sectionTitleClass}><Wallet className="w-4 h-4" /> Offline payment</h5>
          <div className="grid grid-cols-2 gap-2">
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as RentalPaymentType)} className={`${inputClass} min-h-[44px]`}>
              <option value="advance">Advance</option>
              <option value="balance">Balance</option>
              <option value="security_deposit">Security deposit</option>
              <option value="refund">Refund</option>
              <option value="extra_charge">Extra charge</option>
            </select>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as RentalPaymentMethod)} className={`${inputClass} min-h-[44px]`}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <input ref={paymentAmountRef} type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Amount" className={`${inputClass} min-h-[44px] text-lg font-mono`} />
          <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Optional reference number" className={`${inputClass} min-h-[44px]`} />
          <button type="button" disabled={loading} onClick={handlePayment} className={actionButtonClass}>
            Record payment
          </button>
          <p className="text-[12px] text-[color:var(--rl-muted)] mt-2">{payments.length} payment(s) recorded</p>

          {paymentMethod === 'upi' && detail && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h6 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" /> Scan to pay</h6>
              {shop?.upi_id ? (
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                    <span className="font-mono font-bold text-xl text-[color:var(--rl-ink)]">₹{paymentAmount || (detail.balance_due ?? booking.balance_due)}.00</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Scan or Click to Pay</span>
                  </div>

                  <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 shrink-0">
                    <QRCodeSVG
                      value={`upi://pay?pa=${shop.upi_id}&pn=${encodeURIComponent(shop.name || "Shop Owner")}&am=${paymentAmount || (detail.balance_due ?? booking.balance_due)}.00&cu=INR&tn=${encodeURIComponent(`Booking #${booking.id} ${paymentAmount ? 'Payment' : 'Balance'}`)}`}
                      size={80}
                      level="L"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <p>UPI ID is not configured for this shop. Please update it in Shop Settings to generate QR codes.</p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className={sectionClass}>
          <h5 className={sectionTitleClass}><NotebookPen className="w-4 h-4" /> Notes</h5>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional customer or trip note" className={`${inputClass} min-h-[88px] py-3`} />
          <button type="button" disabled={loading} onClick={handleNote} className={actionButtonClass}>
            Add note
          </button>
          <ul className="space-y-1 mt-2">
            {notes.slice(0, 3).map((item) => (
              <li key={item.id} className="text-[13px] text-[color:var(--rl-ink)] bg-[color:var(--rl-warn-soft)] p-2 rounded-md">{item.note}</li>
            ))}
          </ul>
        </section>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 -mx-6 -mb-6 px-4 py-3 bg-white/90 backdrop-blur-md border-t flex gap-2 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {detail?.customer?.phone_number && (
          <a
            href={`tel:${detail.customer.phone_number}`}
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-[color:var(--rl-hover)] text-[color:var(--rl-ink)] font-bold text-[14px] transition-colors border"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        )}
      </div>

      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Document Upload Consent</DialogTitle>
            <DialogDescription>
              Please verify that you have obtained the customer's consent before uploading their identity documents.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              By proceeding, I confirm that the customer has explicitly consented to the collection, processing, and storage of this identity document solely for the purpose of this vehicle rental booking.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setShowConsentModal(false)}
              className="h-10 px-4 rounded-md bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDocumentUpload}
              disabled={loading}
              className="h-10 px-4 rounded-md bg-black text-white text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'I Agree & Upload'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
