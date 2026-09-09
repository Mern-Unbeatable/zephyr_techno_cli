import MaintenanceGate from '../components/MaintenanceGate';
import UserDashboardLayoutInner from './UserDashboardLayoutInner';

/**
 * Customer dashboard is blocked during maintenance — only admin panel stays open.
 */
export default function UserDashboardLayout() {
  return (
    <MaintenanceGate>
      <UserDashboardLayoutInner />
    </MaintenanceGate>
  );
}
