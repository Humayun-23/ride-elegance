import { useNavigate } from 'react-router-dom';
import VehicleCatalog from '../components/VehicleCatalog';
import { SectionCard } from '../components/ui';
import { useRentalOS } from '../components/RentalOSContext';
import type { CatalogVehicle } from '../types';

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { selectedVehicle, setSelectedVehicle } = useRentalOS();

  const handleSelect = (vehicle: CatalogVehicle) => {
    setSelectedVehicle(vehicle);
    navigate('/rentalos/bookings');
  };

  return (
    <SectionCard
      title="Vehicle availability"
      description="Choose a time range to see what's free, then pick a vehicle to start a booking."
    >
      <VehicleCatalog onVehicleSelect={handleSelect} selectedBikeId={selectedVehicle?.bike_id ?? null} />
    </SectionCard>
  );
}
