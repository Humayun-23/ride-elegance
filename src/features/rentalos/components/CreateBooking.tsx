import { useEffect, useState } from 'react';
import { Plus, User, CarFront, Wallet, CheckCircle2, FileUp, Camera, Upload, X } from 'lucide-react';
import { createBooking, uploadBookingDocument } from '../services/rentalosService';
import { useRentalOS } from './RentalOSContext';
import { useToast } from '@/hooks/use-toast';
import type { RentalCustomerSearch } from '../types';

interface CreateBookingProps {
  initialCustomer?: RentalCustomerSearch;
  onCreated?: (booking: any) => void;
  onCancel?: () => void;
}

const toLocalDateTimeValue = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const customInput =
  'w-full bg-slate-50 border border-slate-200 text-slate-900 text-[14px] rounded-xl focus:ring-4 focus:ring-[#3bb881]/10 focus:border-[#3bb881] block px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 font-semibold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100';
const customLabel = 'block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5';

function FormGroup({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] mb-6">
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100/80">
        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-600 border border-slate-100 shadow-sm">{icon}</div>
        <h4 className="text-[15px] font-black text-slate-800 tracking-tight">{title}</h4>
      </div>
      {children}
    </section>
  );
}

export default function CreateBooking({ initialCustomer, onCreated, onCancel }: CreateBookingProps) {
  const { shopId, selectedVehicle, openCatalogue } = useRentalOS();

  const [total, setTotal] = useState(1200);
  const [advance, setAdvance] = useState(200);
  const [securityDeposit, setSecurityDeposit] = useState(500);

  const [phone, setPhone] = useState(initialCustomer?.phone_number || '');
  const [email, setEmail] = useState(initialCustomer?.email || '');
  const [firstname, setFirstname] = useState(initialCustomer?.firstname || '');
  const [lastname, setLastname] = useState(initialCustomer?.lastname || '');

  const [startTime, setStartTime] = useState(toLocalDateTimeValue(new Date()));
  const [endTime, setEndTime] = useState(toLocalDateTimeValue(new Date(Date.now() + 8 * 60 * 60 * 1000)));
  const [note, setNote] = useState('');

  // Documents
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [isFareEdited, setIsFareEdited] = useState(false);

  const effectiveBikeId = selectedVehicle?.bike_id ? String(selectedVehicle.bike_id) : '';
  const isExisting = initialCustomer?.found;

  useEffect(() => {
    if (selectedVehicle?.price_per_day && startTime && endTime && !isFareEdited) {
      const ms = new Date(endTime).getTime() - new Date(startTime).getTime();
      const hours = ms / (1000 * 60 * 60);
      let days = Math.ceil(hours / 24);
      if (days < 1) days = 1; // Minimum 1 day charge
      setTotal(selectedVehicle.price_per_day * days);
    }
  }, [selectedVehicle, startTime, endTime, isFareEdited]);

  const handleCreate = async () => {
    if (!shopId || !effectiveBikeId || !phone || !startTime || !endTime) {
      toast({ variant: 'destructive', title: 'Error', description: 'Bike, phone, start time, and end time are required.' });
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 20) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid 10-digit phone number' });
      return;
    }
    if (total < 0 || advance < 0 || securityDeposit < 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Amounts cannot be negative' });
      return;
    }

    setLoading(true);

    const payload = {
      shop_id: shopId,
      bike_id: parseInt(effectiveBikeId),
      phone_number: phone,
      email: email || undefined,
      firstname: firstname || undefined,
      lastname: lastname || undefined,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      total_amount: total,
      advance_paid: advance,
      balance_due: Math.max(total - advance, 0),
      security_deposit: securityDeposit,
      notes: note || undefined,
    };

    try {
      const res = await createBooking(payload);
      const bookingId = res.data.id;

      // Upload Documents
      if (dlFile) {
        const fd = new FormData();
        fd.append('file', dlFile);
        fd.append('document_type', 'driving_license');
        await uploadBookingDocument(bookingId, fd).catch((e) => console.error(e));
      }

      if (idProofFile) {
        const fd = new FormData();
        fd.append('file', idProofFile);
        fd.append('document_type', 'id_proof');
        await uploadBookingDocument(bookingId, fd).catch((e) => console.error(e));
      }

      toast({ title: 'Success', description: 'Booking created successfully!' });
      onCreated?.(res.data);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.response?.data?.detail || 'Failed to create booking' });
    } finally {
      setLoading(false);
    }
  };

  const FileUploader = ({
    label,
    file,
    setFile,
    uploadAccept = 'image/jpeg,image/png,image/webp,application/pdf',
  }: {
    label: string;
    file: File | null;
    setFile: (f: File | null) => void;
    uploadAccept?: string;
  }) => (
    <div className="flex-1">
      <label className={customLabel}>{label}</label>
      {!file ? (
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm">
            <Upload className="w-4 h-4 text-slate-400" />
            Upload
            <input
              type="file"
              accept={uploadAccept}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          <label className="flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm">
            <Camera className="w-4 h-4 text-slate-400" />
            Capture
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <div className="h-12 px-4 flex items-center justify-between gap-3 rounded-xl border border-[#3bb881]/20 bg-[#3bb881]/5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-[#3bb881]" />
          <span className="truncate flex-1 text-[13px] font-bold text-[#3bb881]">{file.name}</span>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="p-1.5 rounded-full text-[#3bb881] hover:bg-[#3bb881]/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-8">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-[12px] font-black tracking-wider uppercase text-slate-400 hover:text-slate-800 transition-colors mb-4 flex items-center gap-1"
        >
          &larr; Back to Search
        </button>
      )}

      <FormGroup icon={<User className="w-4 h-4" />} title={isExisting ? 'Existing Customer' : 'New Customer'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label className={customLabel}>First Name</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              readOnly={isExisting}
              autoFocus={!isExisting}
              className={customInput}
              placeholder="e.g. John"
            />
          </div>
          <div>
            <label className={customLabel}>Last Name</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              readOnly={isExisting}
              className={customInput}
              placeholder="e.g. Doe"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={customLabel}>Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              readOnly={isExisting}
              className={customInput}
              placeholder="10-digit number"
            />
          </div>
          <div>
            <label className={customLabel}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="For digital invoice"
              className={customInput}
            />
          </div>
        </div>
      </FormGroup>

      <FormGroup icon={<CarFront className="w-4 h-4" />} title="Vehicle & Duration">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-3">
            <label className={customLabel}>Selected Vehicle</label>
            <button
              type="button"
              onClick={openCatalogue}
              className={`${customInput} flex items-center justify-between text-left ${!selectedVehicle ? 'text-slate-400' : 'text-slate-900'
                }`}
            >
              <span className="truncate">
                {selectedVehicle ? `${selectedVehicle.name} - ${selectedVehicle.model}` : 'Tap to select vehicle'}
              </span>
              <CarFront className="w-5 h-5 text-slate-300 shrink-0" />
            </button>
          </div>
          <div className="sm:col-span-1">
            <label className={customLabel}>Pickup Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={customInput}
            />
          </div>
          <div className="sm:col-span-1">
            <label className={customLabel}>Dropoff Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={customInput}
            />
          </div>
        </div>
      </FormGroup>

      <FormGroup icon={<Wallet className="w-4 h-4" />} title="Payment Details">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-5 mb-5">
          <div className="relative group">
            <label className={customLabel}>Total Fare</label>
            <div className="absolute top-[34px] left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold group-focus-within:text-[#3bb881] transition-colors">₹</span>
            </div>
            <input
              type="number"
              value={total}
              onChange={(e) => {
                setTotal(Number(e.target.value));
                setIsFareEdited(true);
              }}
              className={`${customInput} pl-9`}
            />
          </div>
          <div className="relative group">
            <label className={customLabel}>Advance Paid</label>
            <div className="absolute top-[34px] left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold group-focus-within:text-[#3bb881] transition-colors">₹</span>
            </div>
            <input
              type="number"
              value={advance}
              onChange={(e) => setAdvance(Number(e.target.value))}
              className={`${customInput} pl-9`}
            />
          </div>
          <div className="relative group">
            <label className={customLabel}>Balance Due</label>
            <div className="absolute top-[34px] left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold">₹</span>
            </div>
            <input
              type="number"
              value={Math.max(total - advance, 0)}
              readOnly
              disabled
              className={`${customInput} pl-9 text-slate-500 bg-slate-100/70`}
            />
          </div>
          <div className="relative group">
            <label className={customLabel}>Security Deposit</label>
            <div className="absolute top-[34px] left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-400 font-bold group-focus-within:text-[#3bb881] transition-colors">₹</span>
            </div>
            <input
              type="number"
              value={securityDeposit}
              onChange={(e) => setSecurityDeposit(Number(e.target.value))}
              className={`${customInput} pl-9`}
            />
          </div>
        </div>
        <div>
          <label className={customLabel}>Booking Notes</label>
          <input
            type="text"
            placeholder="Special requests or notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={customInput}
          />
        </div>
      </FormGroup>

      <FormGroup icon={<FileUp className="w-4 h-4" />} title="Customer Documents (Optional)">
        <div className="flex flex-col sm:flex-row gap-5">
          <FileUploader label="Driving License" file={dlFile} setFile={setDlFile} />
          <FileUploader label="ID Proof (Aadhar/Passport)" file={idProofFile} setFile={setIdProofFile} />
        </div>
      </FormGroup>

      <button
        onClick={handleCreate}
        disabled={loading}
        className="h-14 w-full sm:w-auto px-8 rounded-xl bg-black text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-gray-900 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" /> Confirm Booking
          </>
        )}
      </button>
    </div>
  );
}
