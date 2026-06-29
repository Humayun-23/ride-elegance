import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createStaff, getStaff, updateStaff } from '../services/rentalosService';
import { useRentalOS } from './RentalOSLayout';
import type { RentalStaff } from '../types';

export default function StaffManagement() {
  const { shopId, isOwner } = useRentalOS();
  const [staff, setStaff] = useState<RentalStaff[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadStaff = () => {
    if (!shopId || !isOwner) return;
    setLoading(true);
    getStaff(shopId)
      .then((res) => setStaff(res.data))
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to load staff'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStaff();
  }, [shopId, isOwner]);

  if (!isOwner) return null;

  const handleCreate = () => {
    if (!shopId || !email || !firstname || !lastname || !phoneNumber) {
      setMessage('Email, name, and phone are required');
      return;
    }
    setLoading(true);
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
        loadStaff();
      })
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to save staff'))
      .finally(() => setLoading(false));
  };

  const toggleActive = (item: RentalStaff) => {
    setLoading(true);
    updateStaff(item.id, { is_active: !item.is_active, role: 'staff' })
      .then(loadStaff)
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to update staff'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password for new user" type="password" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <input value={firstname} onChange={(e) => setFirstname(e.target.value)} placeholder="First name" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <input value={lastname} onChange={(e) => setLastname(e.target.value)} placeholder="Last name" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone" className="border border-gray-200 rounded-xl px-3 py-2 text-sm" />
      </div>
      <button type="button" disabled={loading} onClick={handleCreate} className="h-10 px-4 rounded-xl bg-teal-500 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50">
        <UserPlus className="w-4 h-4" /> Add Staff
      </button>
      {message && <p className="text-sm text-gray-500">{message}</p>}
      <div className="space-y-2">
        {staff.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
            <div>
              <p className="text-sm font-bold text-gray-800">{item.firstname} {item.lastname}</p>
              <p className="text-xs text-gray-500">{item.email} • {item.phone_number}</p>
            </div>
            <button type="button" onClick={() => toggleActive(item)} className="px-3 py-2 rounded-lg bg-gray-50 text-xs font-bold text-gray-700">
              {item.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
