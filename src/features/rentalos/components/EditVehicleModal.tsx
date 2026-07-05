import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRentalOS } from './RentalOSContext';
import { updateVehicle } from '../services/rentalosService';
import type { CatalogVehicle } from '../types';
import { useInvalidateRentalOS } from '../hooks/useRentalOSQueries';
import { toast } from 'sonner';

interface EditVehicleModalProps {
  vehicle: CatalogVehicle;
  isOpen: boolean;
  onClose: () => void;
}

const customInput =
  'w-full bg-slate-50 border border-slate-200 text-slate-900 text-[14px] rounded-xl focus:ring-4 focus:ring-[#3bb881]/10 focus:border-[#3bb881] block px-4 py-3.5 outline-none transition-all placeholder:text-slate-400 font-semibold shadow-sm';
const customLabel = 'block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5';

const CONDITIONS = ['excellent', 'good', 'fair'];
const MAINTENANCES = ['available', 'repair', 'cleaning'];
const TYPES = [
  { id: 'scooty', label: 'Scooter' },
  { id: 'bike', label: 'Motorcycle' },
  { id: 'car', label: 'Car' },
  { id: 'electric', label: 'Electric' },
  { id: 'hybrid', label: 'Hybrid' },
];

export default function EditVehicleModal({ vehicle, isOpen, onClose }: EditVehicleModalProps) {
  const { shopId } = useRentalOS();
  const invalidateRentalOS = useInvalidateRentalOS();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: vehicle.name,
    model: vehicle.model,
    bike_type: vehicle.bike_type,
    engine_cc: vehicle.engine_cc ?? '',
    description: vehicle.description ?? '',
    price_per_day: vehicle.price_per_day,
    price_per_hour: vehicle.price_per_hour,
    condition: vehicle.condition,
    maintenance_status: vehicle.maintenance_status ?? 'available',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      // Ensure engine_cc is converted to number or null correctly
      if (payload.engine_cc === '') {
        (payload as any).engine_cc = null;
      } else {
        payload.engine_cc = Number(payload.engine_cc);
      }

      await updateVehicle(vehicle.bike_id, payload);
      invalidateRentalOS(shopId);
      toast.success('Vehicle updated successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to update vehicle');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-all duration-300"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[600px] pointer-events-auto"
            >
              <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh] relative z-50 w-full border border-slate-100">
                {/* Hero Header */}
                <div className="relative h-36 bg-slate-50 flex flex-col items-center justify-end pb-4">
                  {vehicle.image_url && (
                    <div className="absolute inset-0 overflow-hidden">
                      <img
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="w-full h-full object-cover opacity-60 mix-blend-multiply"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                    </div>
                  )}

                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={onClose}
                      className="p-2 bg-white/70 hover:bg-white backdrop-blur-md rounded-full text-slate-500 hover:text-slate-800 shadow-sm transition-all border border-slate-200/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white shadow-sm rounded-full text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2 border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3bb881]" />
                      Vehicle #{vehicle.bike_id}
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                      {vehicle.name}
                    </h2>
                    <p className="text-[13px] font-semibold text-slate-500 mt-0.5">{vehicle.model}</p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
                  <form id="edit-vehicle-form" onSubmit={handleSave} className="flex flex-col gap-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={customLabel}>Brand & Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className={customInput}
                          placeholder="e.g. Honda Activa"
                        />
                      </div>
                      <div>
                        <label className={customLabel}>Model Year / Details *</label>
                        <input
                          type="text"
                          name="model"
                          value={formData.model}
                          onChange={handleChange}
                          required
                          className={customInput}
                          placeholder="e.g. 2023 6G"
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
                            onClick={() => setFormData((prev) => ({ ...prev, bike_type: t.id }))}
                            className={`py-3 px-2 text-[13px] font-bold rounded-xl transition-all border shadow-sm ${
                              formData.bike_type === t.id
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
                                onClick={() => setFormData((prev) => ({ ...prev, condition: c }))}
                                className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg capitalize transition-all duration-200 ${
                                  formData.condition === c
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
                                onClick={() => setFormData((prev) => ({ ...prev, maintenance_status: m }))}
                                className={`flex-1 min-w-max px-3 py-2.5 text-[13px] font-bold rounded-lg capitalize transition-all duration-200 ${
                                  formData.maintenance_status === m
                                    ? 'bg-white text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}
                              >
                                {m === 'available' ? 'Avail' : m}
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
                            name="price_per_day"
                            value={formData.price_per_day}
                            onChange={handleChange}
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
                            name="price_per_hour"
                            value={formData.price_per_hour}
                            onChange={handleChange}
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
                            name="engine_cc"
                            value={formData.engine_cc}
                            onChange={handleChange}
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
                        name="description"
                        className={`${customInput} min-h-[90px] py-3`}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Optional counter note or vehicle description"
                      />
                    </div>
                  </form>
                </div>

                <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3.5 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-all text-[14px] w-full sm:w-auto text-center"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-vehicle-form"
                    className="px-8 py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 text-[14px] w-full sm:w-auto"
                    disabled={saving}
                  >
                    {saving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
