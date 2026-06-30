import { SectionCard } from '../components/ui';
import StaffManagement from '../components/StaffManagement';
import { useRentalOS } from '../components/RentalOSContext';

export default function StaffPage() {
  const { isOwner } = useRentalOS();

  if (!isOwner) {
    return (
      <div className="p-6 text-center text-sm text-[color:var(--rl-muted)]">
        You do not have permission to view staff management.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <SectionCard
        title="Staff access"
        description="Add staff to this shop and manage who can take bookings."
      >
        <StaffManagement />
      </SectionCard>
    </div>
  );
}
