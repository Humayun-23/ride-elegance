import { useState } from 'react';
import { Plus } from 'lucide-react';
import { createBooking } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import type { CatalogVehicle } from '../types';

interface CreateBookingProps {
  selectedVehicle?: CatalogVehicle | null;
  onCreated?: () => void;
}

const toLocalDateTimeValue = (date: Date) => {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function CreateBooking({ selectedVehicle, onCreated }: CreateBookingProps) {
  const { shopId } = useRentalOS();
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

  const handleCreate = () => {
    if (!shopId || !effectiveBikeId || !phone || !startTime || !endTime) {
      setMessage('Shop, Bike ID, phone, start time, and end time are required');
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
      .catch(err => setMessage(err.response?.data?.detail || 'Failed to create booking'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Bike ID</label>
          <input 
            type="number" 
            value={effectiveBikeId}
            onChange={(e) => setBikeId(e.target.value)}
            placeholder="e.g. 1"
            readOnly={Boolean(selectedVehicle)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Phone Number</label>
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9999999999"
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">First Name</label>
          <input 
            type="text" 
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Last Name</label>
          <input 
            type="text" 
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Start Time</label>
          <input 
            type="datetime-local" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">End Time</label>
          <input 
            type="datetime-local" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Total Amount</label>
          <input 
            type="number" 
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Advance Paid</label>
          <input 
            type="number" 
            value={advance}
            onChange={(e) => setAdvance(Number(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Balance Due</label>
          <input 
            type="number" 
            value={total - advance}
            readOnly
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm text-gray-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Security Deposit</label>
          <input 
            type="number" 
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(Number(e.target.value))}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-400 mb-1">Note</label>
        <input 
          type="text" 
          placeholder="Optional counter note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
        />
      </div>
      
      {message && (
        <div className={`text-sm mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </div>
      )}

      <button 
        onClick={handleCreate}
        disabled={loading}
        className="w-full h-10 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-auto disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        {loading ? 'Processing...' : 'Confirm Booking'}
      </button>
    </div>
  );
}
