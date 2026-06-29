import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createVehicle } from '../services/rentalosService';
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from './ui';
import { useRentalOS } from './RentalOSLayout';

const vehicleTypes = ['scooty', 'bike', 'car', 'mountain', 'road', 'hybrid', 'electric'];
const conditions = ['excellent', 'good', 'fair'];
const maintenanceStatuses = ['available', 'maintenance', 'repair', 'cleaning'];

const initialForm = {
  name: '',
  model: '',
  bike_type: 'bike',
  engine_cc: '',
  description: '',
  price_per_hour: '',
  price_per_day: '',
  condition: 'good',
  maintenance_status: 'available',
};

export default function AddVehicleModal() {
  const { shopId, isOwner } = useRentalOS();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOwner) return null;

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const close = () => {
    setOpen(false);
    setMessage('');
  };

  const submit = () => {
    if (!shopId || !form.name || !form.model || !form.price_per_hour || !form.price_per_day) {
      setMessage('Name, model, hourly price, and daily price are required.');
      return;
    }

    setSaving(true);
    setMessage('');
    const payload: any = {
      shop_id: shopId,
      name: form.name,
      model: form.model,
      bike_type: form.bike_type,
      price_per_hour: Number(form.price_per_hour),
      price_per_day: Number(form.price_per_day),
      condition: form.condition,
      is_available: true,
      maintenance_status: form.maintenance_status,
    };
    if (form.engine_cc) payload.engine_cc = Number(form.engine_cc);
    if (form.description) payload.description = form.description;

    createVehicle(payload)
      .then(() => {
        setForm(initialForm);
        setMessage('Vehicle added.');
        setTimeout(() => close(), 500);
      })
      .catch((err) => setMessage(err.response?.data?.detail || 'Failed to add vehicle.'))
      .finally(() => setSaving(false));
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={primaryButtonClass}>
        <Plus className="w-4 h-4" />
        Add vehicle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 p-0 sm:p-4" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close add vehicle dialog" className="absolute inset-0" onClick={close} />

          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Add vehicle</h3>
                <p className="text-xs text-gray-500">Adds a vehicle to the active shop inventory.</p>
              </div>
              <button type="button" onClick={close} className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Name *</label>
                  <input className={inputClass} value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Activa" />
                </div>
                <div>
                  <label className={labelClass}>Model *</label>
                  <input className={inputClass} value={form.model} onChange={(e) => updateField('model', e.target.value)} placeholder="6G" />
                </div>
                <div>
                  <label className={labelClass}>Type *</label>
                  <select className={inputClass} value={form.bike_type} onChange={(e) => updateField('bike_type', e.target.value)}>
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Engine CC</label>
                  <input className={inputClass} type="number" value={form.engine_cc} onChange={(e) => updateField('engine_cc', e.target.value)} placeholder="110" />
                </div>
                <div>
                  <label className={labelClass}>Price/hour *</label>
                  <input className={inputClass} type="number" value={form.price_per_hour} onChange={(e) => updateField('price_per_hour', e.target.value)} placeholder="100" />
                </div>
                <div>
                  <label className={labelClass}>Price/day *</label>
                  <input className={inputClass} type="number" value={form.price_per_day} onChange={(e) => updateField('price_per_day', e.target.value)} placeholder="800" />
                </div>
                <div>
                  <label className={labelClass}>Condition</label>
                  <select className={inputClass} value={form.condition} onChange={(e) => updateField('condition', e.target.value)}>
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Maintenance status</label>
                  <select className={inputClass} value={form.maintenance_status} onChange={(e) => updateField('maintenance_status', e.target.value)}>
                    {maintenanceStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    className={`${inputClass} min-h-[90px]`}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Optional counter note or vehicle description"
                  />
                </div>
              </div>

              {message && (
                <p className={`text-sm ${message.includes('added') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button type="button" onClick={close} className={secondaryButtonClass}>Cancel</button>
                <button type="button" onClick={submit} disabled={saving} className={primaryButtonClass}>
                  {saving ? 'Saving...' : 'Add vehicle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
