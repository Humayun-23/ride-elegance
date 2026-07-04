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
import { EmptyState } from './ui';
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

const customInput =
  'w-full bg-slate-50 border border-slate-200 text-slate-900 text-[14px] rounded-xl focus:ring-4 focus:ring-[#3bb881]/10 focus:border-[#3bb881] block px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100';
const customLabel = 'block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5';

const sectionClass = 'bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] scroll-mt-6';
const sectionTitleClass = 'text-[15px] font-black text-slate-800 tracking-tight flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-100/80';
const actionButtonClass = 'w-full px-8 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 text-[14px] mt-2';

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <h5 className={sectionTitleClass}>
    <div className="p-1.5 bg-slate-50 rounded-lg text-slate-600 border border-slate-100 shadow-sm">{icon}</div>
    {title}
  </h5>
);

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
    <div className="flex flex-col h-full space-y-6 pb-[env(safe-area-inset-bottom)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <h4 className="text-[16px] font-black text-slate-900 tracking-tight">
            Booking #{booking.id} · {detail?.customer?.firstname || 'Walk-in'} {detail?.customer?.lastname}
          </h4>
          <p className="text-[13px] text-slate-500 mt-1 font-bold">
            {detail?.bike?.name || `Bike ${booking.bike_id}`} · <span className="uppercase text-[10px] font-black tracking-widest px-2 py-0.5 bg-slate-100 rounded-md ml-1">{detail?.status}</span> · <span className="text-red-500">Balance ₹{detail?.balance_due ?? booking.balance_due}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={loadWorkflow} className="h-10 px-4 rounded-xl bg-slate-50 text-slate-700 text-[13px] font-bold flex items-center gap-2 hover:bg-slate-100 border border-slate-200 shadow-sm transition-all">
            <RefreshCcw className="w-4 h-4" /> <span className="hidden sm:inline">Refresh</span>
          </button>
          <button type="button" onClick={() => runAction(() => cancelBooking(booking.id), 'Booking cancelled')} className="h-10 px-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-[13px] font-bold flex items-center gap-2 hover:bg-red-100 transition-all shadow-sm">
            <XCircle className="w-4 h-4" /> <span className="hidden sm:inline">Cancel</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-[13px] font-bold px-4 py-3 rounded-xl shadow-sm border ${isError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-24">
        <section className={sectionClass}>
          <SectionHeader icon={<FileUp className="w-4 h-4" />} title="Documents" />
          <div className="space-y-4">
            <div>
              <label className={customLabel}>Document Type</label>
              <select
                value={documentType}
                onChange={(e) => {
                  setDocumentType(e.target.value);
                  setIsDocumentUpdateMode(false);
                  setDocumentFile(null);
                }}
                className={customInput}
              >
                <option value="driving_license">Driving license</option>
                <option value="id_proof">ID proof</option>
              </select>
            </div>

            {(() => {
              // Sort by created_at descending so we get the most recent one
              const currentDocs = documents.filter(d => d.document_type === documentType).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              const currentDoc = currentDocs.length > 0 ? currentDocs[0] : null;

              return (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={!currentDoc}
                      onClick={() => {
                        if (currentDoc?.file_url) window.open(currentDoc.file_url, '_blank');
                      }}
                      className={`flex-1 h-12 rounded-xl text-[13px] font-bold transition-all shadow-sm ${currentDoc ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      View Current
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDocumentUpdateMode(!isDocumentUpdateMode)}
                      className={`flex-1 h-12 rounded-xl text-[13px] font-bold border transition-all shadow-sm ${isDocumentUpdateMode ? 'border-[#3bb881]/30 bg-[#3bb881]/10 text-[#3bb881] ring-2 ring-[#3bb881]/20' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      Upload New
                    </button>
                  </div>

                  {isDocumentUpdateMode && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                      {!documentFile ? (
                        <div className="flex gap-3">
                          <label className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed hover:border-slate-300 transition-all shadow-sm">
                            <Upload className="w-4 h-4 text-slate-400" /> Choose file
                            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={e => setDocumentFile(e.target.files?.[0] || null)} />
                          </label>
                          <label className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed hover:border-slate-300 transition-all shadow-sm">
                            <Camera className="w-4 h-4 text-slate-400" /> Take photo
                            <input type="file" capture="environment" className="hidden" accept="image/*" onChange={e => setDocumentFile(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3.5 border border-[#3bb881]/30 rounded-xl bg-[#3bb881]/5 shadow-sm">
                          <span className="text-[13px] font-bold truncate flex-1 text-[#3bb881]">{documentFile.name}</span>
                          <button type="button" onClick={() => setDocumentFile(null)} className="p-1.5 text-[#3bb881] hover:bg-[#3bb881]/10 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <button type="button" disabled={loading || !documentFile} onClick={() => setShowConsentModal(true)} className={actionButtonClass}>
                        Upload Document
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHeader icon={<ImageIcon className="w-4 h-4" />} title="Handover Photo" />
          <div className="space-y-4">
            {!handoverFile ? (
              <div className="flex gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed transition-all shadow-sm">
                  <Upload className="w-4 h-4 text-slate-400" /> Choose file
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={e => setHandoverFile(e.target.files?.[0] || null)} />
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed transition-all shadow-sm">
                  <Camera className="w-4 h-4 text-slate-400" /> Take photo
                  <input type="file" capture="environment" className="hidden" accept="image/*" onChange={e => setHandoverFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 border border-[#3bb881]/30 rounded-xl bg-[#3bb881]/5 shadow-sm">
                <span className="text-[13px] font-bold truncate flex-1 text-[#3bb881]">{handoverFile.name}</span>
                <button type="button" onClick={() => setHandoverFile(null)} className="p-1.5 text-[#3bb881] hover:bg-[#3bb881]/10 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div>
              <label className={customLabel}>Location (Optional)</label>
              <input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="e.g. Airport Terminal 1" className={customInput} />
            </div>

            <button type="button" disabled={loading || !handoverFile} onClick={handleHandoverUpload} className={actionButtonClass}>
              Upload Handover Photo
            </button>
            <p className="text-[12px] font-bold text-slate-400 text-center">{photos.length} photo(s) uploaded</p>
          </div>
        </section>

        <section id="payment-section" className={sectionClass}>
          <SectionHeader icon={<Wallet className="w-4 h-4" />} title="Offline Payment" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={customLabel}>Payment Type</label>
                <select value={paymentType} onChange={(e) => setPaymentType(e.target.value as RentalPaymentType)} className={customInput}>
                  <option value="advance">Advance</option>
                  <option value="balance">Balance</option>
                  <option value="security_deposit">Security deposit</option>
                  <option value="refund">Refund</option>
                  <option value="extra_charge">Extra charge</option>
                </select>
              </div>
              <div>
                <label className={customLabel}>Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as RentalPaymentMethod)} className={customInput}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className={customLabel}>Amount</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold group-focus-within:text-[#3bb881] transition-colors">₹</span>
                </div>
                <input ref={paymentAmountRef} type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="0.00" className={`${customInput} pl-9 text-lg font-mono`} />
              </div>
            </div>
            
            <div>
              <label className={customLabel}>Reference Number (Optional)</label>
              <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Transaction ID..." className={customInput} />
            </div>

            <button type="button" disabled={loading} onClick={handlePayment} className={actionButtonClass}>
              Record Payment
            </button>
            <p className="text-[12px] font-bold text-slate-400 text-center">{payments.length} payment(s) recorded</p>

            {paymentMethod === 'upi' && detail && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <label className={customLabel}>Scan to Pay</label>
                {shop?.upi_id ? (
                  <div className="flex flex-col md:flex-row gap-5 items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <div className="flex flex-col gap-1.5 items-center md:items-start text-center md:text-left">
                      <span className="font-mono font-black text-2xl text-slate-800 tracking-tight">₹{paymentAmount || (detail.balance_due ?? booking.balance_due)}.00</span>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Scan via any UPI App</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 shrink-0">
                      <QRCodeSVG
                        value={`upi://pay?pa=${shop.upi_id}&pn=${encodeURIComponent(shop.name || "Shop Owner")}&am=${paymentAmount || (detail.balance_due ?? booking.balance_due)}.00&cu=INR&tn=${encodeURIComponent(`Booking #${booking.id} ${paymentAmount ? 'Payment' : 'Balance'}`)}`}
                        size={80}
                        level="L"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-bold shadow-sm">
                    <XCircle className="w-5 h-5 shrink-0" />
                    <p>UPI ID is not configured. Update it in Shop Settings to use QR codes.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className={sectionClass}>
          <SectionHeader icon={<NotebookPen className="w-4 h-4" />} title="Booking Notes" />
          <div className="space-y-4">
            <div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for this booking..." className={`${customInput} min-h-[100px] py-4`} />
            </div>
            <button type="button" disabled={loading} onClick={handleNote} className={actionButtonClass}>
              Add Note
            </button>
            {notes.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <label className={customLabel}>Recent Notes</label>
                <ul className="space-y-3 mt-2">
                  {notes.slice(0, 3).map((item) => (
                    <li key={item.id} className="text-[13px] font-semibold text-slate-700 bg-amber-50/50 border border-amber-100 p-3 rounded-xl shadow-sm">
                      {item.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 -mx-5 -mb-5 px-5 py-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-10 mt-auto">
        {detail?.customer?.phone_number && (
          <a
            href={`tel:${detail.customer.phone_number}`}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-white text-slate-800 font-bold text-[15px] hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
          >
            <Phone className="w-5 h-5 text-slate-500" />
            Call Customer
          </a>
        )}
      </div>

      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">Document Upload Consent</DialogTitle>
            <DialogDescription className="font-semibold text-slate-500">
              Please verify that you have obtained the customer's consent.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-[14px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              By proceeding, I confirm that the customer has explicitly consented to the collection, processing, and storage of this identity document solely for the purpose of this vehicle rental booking.
            </p>
          </div>
          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <button
              type="button"
              onClick={() => setShowConsentModal(false)}
              className="h-12 px-6 rounded-xl bg-slate-100 text-slate-700 text-[14px] font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDocumentUpload}
              disabled={loading}
              className="h-12 px-6 rounded-xl bg-slate-900 text-white text-[14px] font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:translate-y-0 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'I Agree & Upload'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
