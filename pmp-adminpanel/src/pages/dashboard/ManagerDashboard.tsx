import { SidebarInset } from '@/components/ui/sidebar';
import { TopBar } from '@/components/TopBar';
import {
  Building2,
  ClipboardCheck,
  Users,
  DollarSign,
  Plus,
  User,
} from 'lucide-react';
import { getItem } from '@/utils/storage';
import dashboardService from '@/services/adminapp/admin';
import { useEffect, useState } from 'react';

function ManagerDashboard() {
  const [data, setData] = useState<any>();
  const userDetails: any = getItem('USER');

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await dashboardService.managerActivity(
        userDetails?.landlordId,
        userDetails?.id
      );
      // if (activity.data.success) {
      setData(activity.data.data);
      // }
    };
    fetchActivity();
  }, []);

  const manager = {
    name: 'Sarah Khan',
    propertiesManaged: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    tenants: 0,
    totalCollected: 'PKR 0',
    pendingPayments: 'PKR 0',
  };

  return (
    <div className="bg-white rounded-[20px] mt-5">
      <SidebarInset>
        <TopBar title="Manager Dashboard" />

        <div className="flex flex-col gap-6 p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <Building2 className="inline mr-2" />
                Properties Managed
              </h2>
              <p className="text-3xl font-bold">{data?.properties_managed}</p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <ClipboardCheck className="inline mr-2" />
                Units Overview
              </h2>
              <p>
                Occupied: <strong>{data?.units?.occupied}</strong>
              </p>
              <p>
                Vacant: <strong>{data?.units?.available}</strong>
              </p>
              <p>
                Total Units: <strong>{data?.units?.total}</strong>
              </p>
            </div>

            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2">
                <Users className="inline mr-2" />
                Tenants Assigned
              </h2>
              <p className="text-3xl font-bold">{data?.tenants_assigned}</p>
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
                <User className="inline mr-2" />
                Manager Info
              </h2>
              <ul className="list-disc ml-6 mt-2 capitalize">
                <li>
                  Name : {userDetails?.fname} {userDetails?.lname}
                </li>
                <li>Gender : {userDetails?.gender}</li>
                <li>Phone : {userDetails?.phone}</li>
                <li>Email : {userDetails?.email}</li>
              </ul>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default ManagerDashboard;
