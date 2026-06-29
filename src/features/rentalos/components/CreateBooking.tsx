import { useEffect, useState } from 'react';
import { Plus, User, CarFront, Wallet, CheckCircle2 } from 'lucide-react';
import { createBooking } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import { inputClass, labelClass, primaryButtonClass } from './ui';

interface CreateBookingProps {
  onCreated?: () => void;
}

const toLocalDateTimeValue = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

function FormGroup({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-teal-600">{icon}</span>
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>
      {children}
    </section>
  );
}

export default function CreateBooking({ onCreated }: CreateBookingProps) {
  const { shopId, selectedVehicle } = useRentalOS();
  const [total, setTotal] = useState(1200);
  const [advance, setAdvance] = useState(200);
  const [securityDeposit, setSecurityDeposit] = useState(500);
  const [bikeId, setBikeId] = useState('');
  const [phone, setPhone] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [startTime, setStartTime] = useState(toLocalDateTimeValue(new Date()));
  const [endTime, setEndTime] = useState(toLocalDateTimeValue(new Date(Date.now() + 8 * 60 * 60 * 1000)));
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const effectiveBikeId = selectedVehicle?.bike_id ? String(selectedVehicle.bike_id) : bikeId;

  useEffect(() => {
    if (selectedVehicle?.price_per_day) {
      setTotal(selectedVehicle.price_per_day);
    }
  }, [selectedVehicle]);

  const handleCreate = () => {
    if (!shopId || !effectiveBikeId || !phone || !startTime || !endTime) {
      setMessage('Bike, phone, start time, and end time are required.');
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

    createBooking(payload)
      .then(() => {
        setMessage('Booking created successfully!');
        onCreated?.();
      })
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to create booking'))
      .finally(() => setLoading(false));
  };

  const isSuccess = message.includes('success');

  return (
    <div className="space-y-6">
      {selectedVehicle && (
        <div className="flex items-center gap-3 rounded-lg bg-teal-50 border border-teal-100 p-3">
          <span className="w-9 h-9 rounded-lg bg-white text-teal-600 flex items-center justify-center shrink-0">
            <CarFront className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{selectedVehicle.name}</p>
            <p className="text-xs text-gray-500">#{selectedVehicle.bike_id} · ₹{selectedVehicle.price_per_day}/day</p>
          </div>
        </div>
      )}

      <FormGroup icon={<User className="w-4 h-4" />} title="Customer">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Phone number</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9999999999" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>First name</label>
            <input type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Last name</label>
            <input type="text" value={lastname} onChange={(e) => setLastname(e.target.value)} className={inputClass} />
          </div>
        </div>
      </FormGroup>

      <FormGroup icon={<CarFront className="w-4 h-4" />} title="Vehicle & dates">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Bike ID</label>
            <input
              type="number"
              value={effectiveBikeId}
              onChange={(e) => setBikeId(e.target.value)}
              placeholder="e.g. 1"
              readOnly={Boolean(selectedVehicle)}
              className={`${inputClass} ${selectedVehicle ? 'bg-gray-50 text-gray-500' : ''}`}
            />
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

      {message && (
        <div className={`flex items-center gap-2 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
          {isSuccess && <CheckCircle2 className="w-4 h-4" />}
          {message}
        </div>
      )}

      <button onClick={handleCreate} disabled={loading} className={`${primaryButtonClass} w-full`}>
        <Plus className="w-4 h-4" />
        {loading ? 'Processing...' : 'Confirm booking'}
      </button>
    </div>
  );
}
