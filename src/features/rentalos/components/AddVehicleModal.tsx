import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, Image as ImageIcon, Plus, Upload, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createVehicle, uploadVehicleImages } from '../services/rentalosService';
import { useRentalOS } from './RentalOSContext';

const CONDITIONS = ['excellent', 'good', 'fair'];
const MAINTENANCES = ['available', 'repair', 'cleaning'];
const TYPES = [
  { id: 'scooty', label: 'Scooter' },
  { id: 'bike', label: 'Motorcycle' },
  { id: 'car', label: 'Car' },
  { id: 'electric', label: 'Electric' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'mountain', label: 'Mountain' },
  { id: 'road', label: 'Road' },
];

const customInput =
  'w-full bg-slate-50 border border-slate-200 text-slate-900 text-[14px] rounded-xl focus:ring-4 focus:ring-[#3bb881]/10 focus:border-[#3bb881] block px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 font-semibold shadow-sm';
const customLabel = 'block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5';

const initialForm = {
  name: '',
  model: '',
  bike_type: 'scooty',
  engine_cc: '',
  description: '',
  price_per_hour: '',
  price_per_day: '',
  condition: 'excellent',
  maintenance_status: 'available',
};

type VehiclePayload = {
  shop_id: number;
  name: string;
  model: string;
  bike_type: string;
  price_per_hour: number;
  price_per_day: number;
  condition: string;
  is_available: boolean;
  maintenance_status: string;
  engine_cc?: number;
  description?: string;
};

function apiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    return response?.data?.detail || fallback;
  }
  return fallback;
}

export default function AddVehicleModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { shopId, isOwner, refreshBookings } = useRentalOS();
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOwner) return null;

  const updateField = (key: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const close = () => {
    onClose();
    setMessage('');
    setImageFile(null);
  };

  const submit = () => {
    if (!shopId || !form.name || !form.model || !form.price_per_hour || !form.price_per_day) {
      setMessage('Name, model, hourly price, and daily price are required.');
      return;
    }

    setSaving(true);
    setMessage('');
    const payload: VehiclePayload = {
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
      .then(async (res) => {
        const createdBikeId = res.data?.id || res.data?.bike_id;
        if (imageFile && createdBikeId) {
          try {
            const formData = new FormData();
            formData.append('files', imageFile);
            await uploadVehicleImages(createdBikeId, formData);
          } catch (err) {
            setForm(initialForm);
            setImageFile(null);
            setMessage(apiErrorMessage(err, 'Vehicle added, image upload failed.'));
            refreshBookings();
            setTimeout(() => close(), 1200);
            return;
          }
        }
        setForm(initialForm);
        setImageFile(null);
        refreshBookings();
        setMessage(imageFile ? 'Vehicle added with image.' : 'Vehicle added.');
        setTimeout(() => close(), 700);
      })
      .catch((err) => setMessage(apiErrorMessage(err, 'Failed to add vehicle.')))
      .finally(() => setSaving(false));
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={close}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-all duration-300"
              />
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
                role="dialog"
                aria-modal="true"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="w-full max-w-[600px] pointer-events-auto"
                >
                  <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh] relative z-50 w-full border border-slate-100">
                    {/* Hero Header */}
                    <div className="relative pt-10 pb-6 bg-slate-50 flex flex-col items-center justify-center border-b border-slate-100">
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          onClick={close}
                          className="p-2 bg-white/70 hover:bg-white backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 shadow-sm transition-all border border-slate-200/50"
                          aria-label="Close add vehicle dialog"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="relative z-10 text-center">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                          Add New Vehicle
                        </h2>
                        <p className="text-[13px] font-semibold text-slate-500 mt-1">
                          Register a new fleet asset
                        </p>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
                      <form className="flex flex-col gap-7">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div>
                            <label className={customLabel}>Brand & Name *</label>
                            <input
                              type="text"
                              value={form.name}
                              onChange={(e) => updateField('name', e.target.value)}
                              className={customInput}
                              placeholder="e.g. Honda Activa"
                              required
                            />
                          </div>
                          <div>
                            <label className={customLabel}>Model Year / Details *</label>
                            <input
                              type="text"
                              value={form.model}
                              onChange={(e) => updateField('model', e.target.value)}
                              className={customInput}
                              placeholder="e.g. 2023 6G"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className={customLabel}>Vehicle Type *</label>
                          <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {TYPES.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => updateField('bike_type', t.id)}
                                className={`py-3 px-2 text-[13px] font-bold rounded-xl transition-all border shadow-sm ${
                                  form.bike_type === t.id
                                    ? 'bg-[#3bb881]/10 border-[#3bb881]/30 text-[#3bb881] ring-2 ring-[#3bb881]/20'
                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                              >
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                              <label className={customLabel}>Condition Status</label>
                              <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                                {CONDITIONS.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => updateField('condition', c)}
                                    className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg capitalize transition-all duration-200 ${
                                      form.condition === c
                                        ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className={customLabel}>Maintenance Status</label>
                              <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shadow-inner overflow-x-auto">
                                {MAINTENANCES.map((m) => (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => updateField('maintenance_status', m)}
                                    className={`flex-1 min-w-max px-3 py-2.5 text-[13px] font-bold rounded-lg capitalize transition-all duration-200 ${
                                      form.maintenance_status === m
                                        ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                    }`}
                                  >
                                    {m === 'available' ? 'Avail' : m === 'maintenance' ? 'Maint' : m}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className={customLabel}>Pricing & Specs *</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-bold group-focus-within:text-[#3bb881] transition-colors">
                                  ₹
                                </span>
                              </div>
                              <input
                                type="number"
                                value={form.price_per_day}
                                onChange={(e) => updateField('price_per_day', e.target.value)}
                                required
                                min={0}
                                className={`${customInput} pl-9`}
                              />
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  / Day
                                </span>
                              </div>
                            </div>
                            <div className="relative group">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-bold group-focus-within:text-[#3bb881] transition-colors">
                                  ₹
                                </span>
                              </div>
                              <input
                                type="number"
                                value={form.price_per_hour}
                                onChange={(e) => updateField('price_per_hour', e.target.value)}
                                required
                                min={0}
                                className={`${customInput} pl-9`}
                              />
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  / Hr
                                </span>
                              </div>
                            </div>
                            <div className="relative group">
                              <input
                                type="number"
                                value={form.engine_cc}
                                onChange={(e) => updateField('engine_cc', e.target.value)}
                                placeholder="110"
                                className={`${customInput}`}
                              />
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  CC
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className={customLabel}>Description</label>
                          <textarea
                            className={`${customInput} min-h-[90px] py-3`}
                            value={form.description}
                            onChange={(e) => updateField('description', e.target.value)}
                            placeholder="Optional counter note or vehicle description"
                          />
                        </div>

                        <div className="pt-2">
                          <label className={customLabel}>Vehicle Image</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm">
                              <Upload className="w-4 h-4 text-slate-400" />
                              Upload Image
                              <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                              />
                            </label>
                            <label className="flex items-center justify-center gap-2 h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[13px] font-bold cursor-pointer border border-slate-200 border-dashed hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm">
                              <Camera className="w-4 h-4 text-slate-400" />
                              Capture Now
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                              />
                            </label>
                          </div>
                          {imageFile && (
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#3bb881]/20 bg-[#3bb881]/5 px-4 py-3 shadow-sm">
                              <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-[#3bb881]">
                                <ImageIcon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{imageFile.name}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setImageFile(null)}
                                className="shrink-0 rounded-full p-1.5 text-[#3bb881] hover:bg-[#3bb881]/10 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </form>
                    </div>

                    <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="w-full sm:w-auto text-left">
                        {message && (
                          <p
                            className={`text-[12px] font-bold px-3 py-1.5 rounded-lg inline-block ${
                              message.includes('added') ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                            }`}
                          >
                            {message}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={close}
                          className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-all text-[14px] w-full sm:w-auto text-center"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={submit}
                          className="px-8 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 text-[14px] w-full sm:w-auto"
                          disabled={saving}
                        >
                          {saving ? (
                            'Saving...'
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Add Vehicle
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
