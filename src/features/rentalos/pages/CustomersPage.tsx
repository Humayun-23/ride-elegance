import CustomerLookup from '../components/CustomerLookup';
import StaffManagement from '../components/StaffManagement';
import { SectionCard } from '../components/ui';
import { useRentalOS } from '../components/RentalOSLayout';

export default function CustomersPage() {
  const { isOwner } = useRentalOS();

  return (
    <div className="space-y-6">
      <SectionCard
        title="Customer lookup"
        description="Search by phone number to view history, or create a new customer record."
      >
        <CustomerLookup />
      </SectionCard>

      {isOwner && (
        <SectionCard
          title="Staff access"
          description="Add staff to this shop and manage who can take bookings."
        >
          <StaffManagement />
        </SectionCard>
      )}
    </div>
  );
}
