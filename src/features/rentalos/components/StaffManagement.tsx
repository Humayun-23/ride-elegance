import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createStaff, updateStaff } from '../services/rentalosService';
import { useRentalOS } from './RentalOSContext';
import { inputClass, labelClass, primaryButtonClass } from './ui';
import type { RentalStaff } from '../types';
import { useRentalOSStaff } from '../hooks/useRentalOSQueries';

export default function StaffManagement() {
  const { shopId, isOwner } = useRentalOS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { data: staff = [], isFetching, refetch } = useRentalOSStaff(shopId, isOwner);
  const loading = saving || isFetching;

  if (!isOwner) return null;

  const handleCreate = () => {
    if (!shopId || !email || !firstname || !lastname || !phoneNumber) {
      setMessage('Email, name, and phone are required');
      return;
    }
    setSaving(true);
    setMessage('');
    createStaff({
      shop_id: shopId,
      email,
      password: password || undefined,
      firstname,
      lastname,
      phone_number: phoneNumber,
      role: 'staff',
    })
      .then(() => {
        setMessage('Staff saved');
        setEmail('');
        setPassword('');
        setFirstname('');
        setLastname('');
        setPhoneNumber('');
        refetch();
      })
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to save staff'))
      .finally(() => setSaving(false));
  };

  const toggleActive = (item: RentalStaff) => {
    setSaving(true);
    updateStaff(item.id, { is_active: !item.is_active, role: 'staff' })
      .then(() => refetch())
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to update staff'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Password (new user)</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Optional" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="9999999999" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>First name</label>
          <input value={firstname} onChange={(e) => setFirstname(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Last name</label>
          <input value={lastname} onChange={(e) => setLastname(e.target.value)} className={inputClass} />
        </div>
      </div>

      <button type="button" disabled={loading} onClick={handleCreate} className={primaryButtonClass}>
        <UserPlus className="w-4 h-4" /> Add staff
      </button>

      {message && <p className="text-sm text-gray-500">{message}</p>}

      <div className="space-y-2">
        {staff.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.firstname} {item.lastname}</p>
              <p className="text-xs text-gray-500 truncate">{item.email} · {item.phone_number}</p>
            </div>
            <button
              type="button"
              onClick={() => toggleActive(item)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                item.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {item.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
