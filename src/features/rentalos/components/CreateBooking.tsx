import { useEffect, useState } from 'react';
import { Plus, User, CarFront, Wallet, CheckCircle2, FileUp, Camera } from 'lucide-react';
import { createBooking, uploadBookingDocument, uploadHandoverPhoto } from '../services/rentalosService';
import { useRentalOS } from './RentalOSContext';
import { inputClass, labelClass, primaryButtonClass } from './ui';
import type { RentalCustomerSearch } from '../types';

interface CreateBookingProps {
  initialCustomer?: RentalCustomerSearch;
  onCreated?: (booking: any) => void;
  onCancel?: () => void;
}

const toLocalDateTimeValue = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function FormGroup({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[color:var(--rl-brand-deep)]">{icon}</span>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
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
  const [firstname, setFirstname] = useState(initialCustomer?.firstname || '');
  const [lastname, setLastname] = useState(initialCustomer?.lastname || '');
  
  const [startTime, setStartTime] = useState(toLocalDateTimeValue(new Date()));
  const [endTime, setEndTime] = useState(toLocalDateTimeValue(new Date(Date.now() + 8 * 60 * 60 * 1000)));
  const [note, setNote] = useState('');

  // Documents
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [handoverFile, setHandoverFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const effectiveBikeId = selectedVehicle?.bike_id ? String(selectedVehicle.bike_id) : '';
  const isExisting = initialCustomer?.found;

  useEffect(() => {
    if (selectedVehicle?.price_per_day && startTime && endTime) {
      const ms = new Date(endTime).getTime() - new Date(startTime).getTime();
      const hours = ms / (1000 * 60 * 60);
      let days = Math.ceil(hours / 24);
      if (days < 1) days = 1; // Minimum 1 day charge
      setTotal(selectedVehicle.price_per_day * days);
    }
  }, [selectedVehicle, startTime, endTime]);

  const handleCreate = async () => {
    if (!shopId || !effectiveBikeId || !phone || !startTime || !endTime) {
      setMessage('Bike, phone, start time, and end time are required.');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 20) {
      setMessage('Please enter a valid 10-digit phone number');
      return;
    }
    if (total < 0 || advance < 0 || securityDeposit < 0) {
      setMessage('Amounts cannot be negative');
      return;
    }

    setLoading(true);
    setMessage('');

    const payload = {
      shop_id: shopId,
      bike_id: parseInt(effectiveBikeId),
      phone_number: phone,
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
        await uploadBookingDocument(bookingId, fd).catch(e => console.error(e));
      }
      
      if (idProofFile) {
        const fd = new FormData();
        fd.append('file', idProofFile);
        fd.append('document_type', 'id_proof');
        await uploadBookingDocument(bookingId, fd).catch(e => console.error(e));
      }
      
      if (handoverFile) {
        const fd = new FormData();
        fd.append('file', handoverFile);
        await uploadHandoverPhoto(bookingId, fd).catch(e => console.error(e));
      }

      setMessage('Booking created successfully!');
      onCreated?.(res.data);
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.includes('success');

  const FileUploader = ({ label, file, setFile }: { label: string, file: File | null, setFile: (f: File | null) => void }) => (
    <div className="flex-1">
      <label className={labelClass}>{label}</label>
      <div className="relative">
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div className={`h-10 px-3 flex items-center justify-between border rounded-lg text-[13px] ${file ? 'border-[color:var(--rl-brand)] bg-[color:var(--rl-brand-soft)] text-[color:var(--rl-brand-deep)]' : 'border-gray-200 bg-white text-gray-500'}`}>
          <span className="truncate pr-2">{file ? file.name : `Select ${label.toLowerCase()}`}</span>
          {file ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Camera className="w-4 h-4 shrink-0 opacity-50" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-6">
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-[12px] font-semibold text-[color:var(--rl-brand-deep)] hover:underline mb-2 block">
          &larr; Back to customer search
        </button>
      )}

      <FormGroup icon={<User className="w-4 h-4" />} title={isExisting ? "Existing Customer" : "New Customer"}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Phone number</label>
            <input type="text" value={phone} readOnly className={`${inputClass} bg-gray-50 text-gray-500`} />
          </div>
          <div>
            <label className={labelClass}>First name</label>
            <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} readOnly={isExisting} className={`${inputClass} ${isExisting ? 'bg-gray-50 text-gray-500' : ''}`} />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} readOnly={isExisting} className={`${inputClass} ${isExisting ? 'bg-gray-50 text-gray-500' : ''}`} />
          </div>
        </div>
      </FormGroup>

      <FormGroup icon={<CarFront className="w-4 h-4" />} title="Vehicle & dates">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Vehicle</label>
            <button
              type="button"
              onClick={openCatalogue}
              className={`${inputClass} flex items-center justify-between text-left ${!selectedVehicle ? 'text-[color:var(--rl-muted)]' : 'text-[color:var(--rl-ink)] font-semibold'}`}
            >
              <span className="truncate">{selectedVehicle ? selectedVehicle.name : 'Choose vehicle'}</span>
              <CarFront className="w-4 h-4 opacity-50 shrink-0" />
            </button>
          </div>
          <div>
            <label className={labelClass}>Start time</label>
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>End time</label>
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
          </div>
        </div>
      </FormGroup>

      <FormGroup icon={<Wallet className="w-4 h-4" />} title="Payment">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className={labelClass}>Total</label>
            <input type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Advance</label>
            <input type="number" value={advance} onChange={(e) => setAdvance(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Balance due</label>
            <input type="number" value={Math.max(total - advance, 0)} readOnly className={`${inputClass} bg-gray-50 text-gray-500`} />
          </div>
          <div>
            <label className={labelClass}>Deposit</label>
            <input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(Number(e.target.value))} className={inputClass} />
          </div>
        </div>
        <div className="mt-3">
          <label className={labelClass}>Note (optional)</label>
          <input type="text" placeholder="Counter note..." value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </div>
      </FormGroup>

      <FormGroup icon={<FileUp className="w-4 h-4" />} title="Documents (Optional)">
        <div className="flex flex-col sm:flex-row gap-3">
          <FileUploader label="Driving License" file={dlFile} setFile={setDlFile} />
          <FileUploader label="ID Proof" file={idProofFile} setFile={setIdProofFile} />
          <FileUploader label="Handover Photo" file={handoverFile} setFile={setHandoverFile} />
        </div>
      </FormGroup>

      {message && (
        <div className={`flex items-center gap-2 text-sm font-semibold p-3 rounded-lg ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isSuccess && <CheckCircle2 className="w-5 h-5" />}
          {message}
        </div>
      )}

      <button onClick={handleCreate} disabled={loading} className={`${primaryButtonClass} w-full h-12 text-[15px]`}>
        <Plus className="w-5 h-5 mr-1" />
        {loading ? 'Processing...' : 'Confirm booking'}
      </button>
    </div>
  );
}
