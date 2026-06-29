import { useEffect, useState } from 'react';
import { CheckCircle2, FileUp, Flag, NotebookPen, RefreshCcw, Wallet, XCircle } from 'lucide-react';
import {
  addBookingNote,
  addCustomerFlag,
  cancelBooking,
  completeBooking,
  getBooking,
  getBookingDocuments,
  getBookingNotes,
  getCustomerFlags,
  getHandoverPhotos,
  getPayments,
  recordPayment,
  uploadBookingDocument,
  uploadHandoverPhoto,
} from '../services/rentalosService';
import type {
  RentalBooking,
  RentalBookingNote,
  RentalCustomerFlag,
  RentalDocument,
  RentalHandoverPhoto,
  RentalPayment,
} from '../types';

interface BookingWorkflowProps {
  booking: RentalBooking | null;
  onChanged?: () => void;
}

const flagTypes = [
  'good_customer',
  'normal_customer',
  'late_return',
  'payment_issue',
  'damage_issue',
  'document_issue',
  'watchlist',
  'blocked',
];

export default function BookingWorkflow({ booking, onChanged }: BookingWorkflowProps) {
  const [detail, setDetail] = useState<RentalBooking | null>(booking);
  const [documents, setDocuments] = useState<RentalDocument[]>([]);
  const [photos, setPhotos] = useState<RentalHandoverPhoto[]>([]);
  const [payments, setPayments] = useState<RentalPayment[]>([]);
  const [notes, setNotes] = useState<RentalBookingNote[]>([]);
  const [flags, setFlags] = useState<RentalCustomerFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [documentType, setDocumentType] = useState('driving_license');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [handoverFile, setHandoverFile] = useState<File | null>(null);
  const [locationAddress, setLocationAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [paymentType, setPaymentType] = useState('advance');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');
  const [flagType, setFlagType] = useState('good_customer');
  const [flagSeverity, setFlagSeverity] = useState('info');
  const [flagNote, setFlagNote] = useState('');
  const [completionNote, setCompletionNote] = useState('');

  const bookingId = booking?.id;

  const loadWorkflow = () => {
    if (!bookingId) return;
    setLoading(true);
    setMessage('');
    getBooking(bookingId)
      .then(async (res) => {
        const current = res.data;
        setDetail(current);
        const [docsRes, photosRes, paymentsRes, notesRes, flagsRes] = await Promise.all([
          getBookingDocuments(bookingId),
          getHandoverPhotos(bookingId),
          getPayments(bookingId),
          getBookingNotes(bookingId),
          current.customer_id ? getCustomerFlags(current.customer_id) : Promise.resolve({ data: [] as RentalCustomerFlag[] }),
        ]);
        setDocuments(docsRes.data);
        setPhotos(photosRes.data);
        setPayments(paymentsRes.data);
        setNotes(notesRes.data);
        setFlags(flagsRes.data);
      })
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to load booking workflow'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setDetail(booking);
    loadWorkflow();
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
        Select a booking to upload documents, record payments, add notes, or complete the trip.
      </div>
    );
  }

  const runAction = (action: () => Promise<unknown>, success: string) => {
    setLoading(true);
    setMessage('');
    action()
      .then(() => {
        setMessage(success);
        loadWorkflow();
        onChanged?.();
      })
      .catch((err: any) => setMessage(err.response?.data?.detail || 'Action failed'))
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
    runAction(() => uploadBookingDocument(booking.id, formData), 'Document uploaded');
  };

  const handleHandoverUpload = () => {
    if (!handoverFile) {
      setMessage('Choose a handover photo first');
      return;
    }
    const formData = new FormData();
    formData.append('file', handoverFile);
    formData.append('location_permission_granted', String(Boolean(latitude || longitude || locationAddress)));
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
    if (locationAddress) formData.append('location_address', locationAddress);
    formData.append('captured_at', new Date().toISOString());
    runAction(() => uploadHandoverPhoto(booking.id, formData), 'Handover photo uploaded');
  };

  const handlePayment = () => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setMessage('Enter a positive payment amount');
      return;
    }
    runAction(
      () => recordPayment(booking.id, {
        payment_type: paymentType,
        amount,
        status: 'paid',
        method: paymentMethod,
        reference_number: referenceNumber || undefined,
        paid_at: new Date().toISOString(),
      }),
      'Payment recorded',
    );
  };

  const handleNote = () => {
    if (!note.trim()) {
      setMessage('Enter a note first');
      return;
    }
    runAction(() => addBookingNote(booking.id, note), 'Note added');
    setNote('');
  };

  const handleFlag = () => {
    if (!detail?.customer_id || !flagNote.trim()) {
      setMessage('Choose a booking customer and enter a flag note');
      return;
    }
    runAction(
      () => addCustomerFlag(detail.customer_id, {
        flag_type: flagType,
        severity: flagSeverity,
        note: flagNote,
        is_active: true,
      }),
      'Customer flag saved',
    );
  };

  const handleComplete = () => {
    runAction(
      () => completeBooking(booking.id, {
        completed_at: new Date().toISOString(),
        note: completionNote || undefined,
        customer_flag_type: flagNote ? flagType : undefined,
        customer_flag_severity: flagNote ? flagSeverity : undefined,
        customer_flag_note: flagNote || undefined,
      }),
      'Trip completed',
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-gray-800">
            Booking #{booking.id} • {detail?.customer?.firstname || 'Walk-in'} {detail?.customer?.lastname}
          </h4>
          <p className="text-xs text-gray-500">
            {detail?.bike?.name || `Bike ${booking.bike_id}`} • {detail?.status} • Balance ₹{detail?.balance_due ?? booking.balance_due}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadWorkflow} className="h-9 px-3 rounded-lg bg-gray-100 text-gray-700 text-xs font-bold flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button type="button" onClick={() => runAction(() => cancelBooking(booking.id), 'Booking cancelled')} className="h-9 px-3 rounded-lg bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>

      {message && (
        <div className={`text-sm ${message.includes('failed') || message.includes('Choose') || message.includes('Enter') ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="border border-gray-100 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><FileUp className="w-4 h-4" /> Documents</h5>
          <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
            <option value="driving_license">Driving license</option>
            <option value="id_proof">ID proof</option>
          </select>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          <button type="button" disabled={loading} onClick={handleDocumentUpload} className="w-full h-9 rounded-lg bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
            Upload Document
          </button>
          <ul className="space-y-1">
            {documents.map((doc) => (
              <li key={doc.id} className="text-xs text-gray-500">
                {doc.document_type.replace(/_/g, ' ')} • {doc.file_name || 'Uploaded file'}
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-gray-100 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><FileUp className="w-4 h-4" /> Handover Photo</h5>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setHandoverFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          <input value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="Optional handover location" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="button" disabled={loading} onClick={handleHandoverUpload} className="w-full h-9 rounded-lg bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
            Upload Handover Photo
          </button>
          <p className="text-xs text-gray-500">{photos.length} handover photo(s) uploaded</p>
        </section>

        <section className="border border-gray-100 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Wallet className="w-4 h-4" /> Offline Payment</h5>
          <div className="grid grid-cols-2 gap-2">
            <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="advance">Advance</option>
              <option value="balance">Balance</option>
              <option value="security_deposit">Security deposit</option>
              <option value="refund">Refund</option>
              <option value="extra_charge">Extra charge</option>
            </select>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Amount" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Optional reference number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button type="button" disabled={loading} onClick={handlePayment} className="w-full h-9 rounded-lg bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
            Record Payment
          </button>
          <p className="text-xs text-gray-500">{payments.length} payment(s) recorded</p>
        </section>

        <section className="border border-gray-100 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><NotebookPen className="w-4 h-4" /> Notes</h5>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional customer or trip note" className="w-full min-h-[76px] border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button type="button" disabled={loading} onClick={handleNote} className="w-full h-9 rounded-lg bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
            Add Note
          </button>
          <ul className="space-y-1">
            {notes.slice(0, 3).map((item) => (
              <li key={item.id} className="text-xs text-gray-500">{item.note}</li>
            ))}
          </ul>
        </section>

        <section className="border border-gray-100 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><Flag className="w-4 h-4" /> Customer Flag</h5>
          <div className="grid grid-cols-2 gap-2">
            <select value={flagType} onChange={(e) => setFlagType(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {flagTypes.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
            </select>
            <select value={flagSeverity} onChange={(e) => setFlagSeverity(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <textarea value={flagNote} onChange={(e) => setFlagNote(e.target.value)} placeholder="Required flag note" className="w-full min-h-[76px] border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button type="button" disabled={loading} onClick={handleFlag} className="w-full h-9 rounded-lg bg-teal-500 text-white text-xs font-bold disabled:opacity-50">
            Save Customer Flag
          </button>
          <p className="text-xs text-gray-500">{flags.length} customer flag(s)</p>
        </section>

        <section className="border border-gray-100 rounded-xl p-4 space-y-3">
          <h5 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Trip Completion</h5>
          <textarea value={completionNote} onChange={(e) => setCompletionNote(e.target.value)} placeholder="Optional completion note" className="w-full min-h-[76px] border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          <button type="button" disabled={loading || detail?.status === 'completed'} onClick={handleComplete} className="w-full h-9 rounded-lg bg-green-600 text-white text-xs font-bold disabled:opacity-50">
            Complete Trip
          </button>
        </section>
      </div>
    </div>
  );
}
