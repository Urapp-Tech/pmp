import { SidebarInset } from '@/components/ui/sidebar';
import { TopBar } from '@/components/TopBar';
import {
  Building2,
  ClipboardCheck,
  Users,
  DollarSign,
  Plus,
} from 'lucide-react';

function ManagerDashboard() {
  const manager = {
    name: 'Sarah Khan',
    propertiesManaged: 1,
    totalUnits: 24,
    occupiedUnits: 2,
    vacantUnits: 22,
    tenants: 2,
    totalCollected: 'PKR 0',
    pendingPayments: 'PKR 0',
  };

  return (
    <div className="bg-white p-4 rounded-[20px] mt-5">
      <SidebarInset>
        <TopBar title="Manager Dashboard" />

        <div className="flex flex-col gap-6 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <Building2 className="inline mr-2" />
                Properties Managed
              </h2>
              <p className="text-3xl font-bold">{manager.propertiesManaged}</p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <ClipboardCheck className="inline mr-2" />
                Units Overview
              </h2>
              <p>
                Occupied: <strong>{manager.occupiedUnits}</strong>
              </p>
              <p>
                Vacant: <strong>{manager.vacantUnits}</strong>
              </p>
              <p>
                Total Units: <strong>{manager.totalUnits}</strong>
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <Users className="inline mr-2" />
                Tenants Assigned
              </h2>
              <p className="text-3xl font-bold">{manager.tenants}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <DollarSign className="inline mr-2" />
                Rent Summary
              </h2>
              <p>
                Total Collected: <strong>{manager.totalCollected}</strong>
              </p>
              <p>
                Pending Payments: <strong>{manager.pendingPayments}</strong>
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <Plus className="inline mr-2" />
                Quick Actions
              </h2>
              <ul className="list-disc ml-6 mt-2">
                <li>Add New Property</li>
                <li>Update Unit Info</li>
                <li>Track Rent Payments</li>
                <li>Manage Tenant Assignments</li>
              </ul>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default ManagerDashboard;
