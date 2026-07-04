import { useState } from 'react';
import { SectionCard, EmptyState } from '../components/ui';
import { useRentalOS } from '../components/RentalOSContext';
import { useRentalOSCatalog } from '../hooks/useRentalOSQueries';
import { Edit, CarFront } from 'lucide-react';
import type { CatalogVehicle } from '../types';
import EditVehicleModal from '../components/EditVehicleModal';

const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export default function InventoryPage() {
  const { shopId, isOwner } = useRentalOS();
  const { data: vehicles = [], isLoading } = useRentalOSCatalog(shopId);
  const [editingVehicle, setEditingVehicle] = useState<CatalogVehicle | null>(null);

  if (!isOwner) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState message="You do not have permission to view this page." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5">
      <SectionCard
        title="Fleet Inventory"
        description="Manage your shop's vehicles, pricing, and details."
        className="flex-1 flex flex-col"
      >
        {isLoading ? (
          <p className="text-center py-10 text-[color:var(--rl-faint)] text-sm">Loading inventory...</p>
        ) : vehicles.length === 0 ? (
          <EmptyState icon={<CarFront className="w-6 h-6" />} message="No vehicles found in your shop." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.bike_id}
                className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col group"
                style={{ borderColor: 'var(--rl-border)' }}
              >
                <div className="h-32 bg-[color:var(--rl-hover)] relative flex items-center justify-center overflow-hidden">
                  {v.image_url ? (
                    <img src={v.image_url} alt={v.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <CarFront className="w-10 h-10 text-[color:var(--rl-faint)]" />
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-[color:var(--rl-ink)] shadow-sm">
                    {v.condition}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[14px] text-[color:var(--rl-ink)] truncate leading-tight">
                        {v.name}
                      </h3>
                      <p className="text-[12px] text-[color:var(--rl-muted)] truncate capitalize mt-0.5">
                        #{v.bike_id} · {v.model} · {v.bike_type}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingVehicle(v)}
                      className="p-1.5 rounded-full bg-white border border-[color:var(--rl-border)] text-[color:var(--rl-muted)] hover:text-[color:var(--rl-ink)] hover:bg-[color:var(--rl-hover)] transition-colors shrink-0 shadow-sm"
                      title="Edit Vehicle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-auto pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--rl-border)' }}>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[color:var(--rl-muted)] tracking-wider mb-0.5">Price/Day</p>
                      <p className="text-[14px] font-bold text-[color:var(--rl-ink)] rl-num">₹{currency.format(v.price_per_day)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-semibold text-[color:var(--rl-muted)] tracking-wider mb-0.5">Price/Hour</p>
                      <p className="text-[14px] font-bold text-[color:var(--rl-ink)] rl-num">₹{currency.format(v.price_per_hour)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {editingVehicle && (
        <EditVehicleModal
          vehicle={editingVehicle}
          isOpen={!!editingVehicle}
          onClose={() => setEditingVehicle(null)}
        />
      )}
    </div>
  );
}
