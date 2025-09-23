import { SidebarInset } from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
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
import assets from '@/assets/images';

function ManagerDashboard() {
  const user: any = getItem('USER');
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await dashboardService.managerActivity(
        user?.landlordId,
        user?.id
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

  // helper to keep card style consistent
  const cardBase =
    'rounded-2xl shadow-sm ring-1 ring-black/5 px-4 py-3 sm:px-5 sm:py-4 h-46 sm:h-50 flex flex-col';
  const cardLight = 'bg-secondary-bg'; // light mint (matches mock)
  const cardDark = 'bg-secondary-bg'; // slightly darker mint (for alternates)
  const labelCls = 'text-2xl text-primary-bg flex items-center gap-2 font-bold';

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--body-background)' }}
    >
      <SidebarInset>
        {/* CONTENT WRAP */}
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6">
          {/* HERO ROW: left welcome, right image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-36 items-start mb-6">
            <div className="rounded-2xl px-6 py-8">
              <h1 className="text-primary-bg text-3xl sm:text-4xl font-extrabold leading-snug">
                Hello {user?.fname},
                <br />
                Welcome to your
                <br />
                dashboard overview.
              </h1>
              <p className="mt-3 text-sm text-primary-bg px-10">
                Track and manage the listed properties
              </p>
            </div>

            <div className="rounded-2xl text-primary-bg overflow-hidden m-3">
              {/* Replace src with your actual image */}
              <div className={`${cardBase} ${cardLight}`}>
                <div className="rounded-xl p-1">
                  {' '}
                  <h2 className="text-xl font-bold mb-2">Manager Info </h2>{' '}
                  <p className="font-medium">
                    Name : {user?.fname} {user?.lname}{' '}
                  </p>
                  <p className="font-medium">Gender : {user?.gender}</p>
                  <p className="font-medium">Phone : {user?.phone}</p>
                  <p className="font-medium">Email : {user?.email}</p>{' '}
                </div>
              </div>
            </div>
          </div>

          {/* METRIC CARDS: 4 x 2 grid */}
          <div className="grid gap-6 2xl::grid-cols-4 sm:grid-cols-2">
            {/* 1 */}
            <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>Properties Managed</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[74px] font-semibold text-primary-bg">
                  {data?.properties_managed ?? 0}
                </span>
              </div>
            </div>
            {/* 2 */}
            <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>Tenants Assigned</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[74px] font-semibold text-primary-bg">
                  {data?.tenants_assigned ?? 0}
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-6 2xl::grid-cols-4 sm:grid-cols-2">
            <div className="rounded-2xl text-primary-bg overflow-hidden mt-6">
              {/* Replace src with your actual image */}
              <div className={`${cardBase} ${cardLight}`}>
                <div className="rounded-xl p-1">
                  {' '}
                  <h2 className="text-xl font-bold mb-10">
                    Units Overview
                  </h2>{' '}
                  <p className="font-medium italic">
                    Occupied : {data?.units?.occupied}
                  </p>
                  <p className="font-medium italic">
                    Vacant : {data?.units?.available}
                  </p>
                  <p className="font-medium italic">
                    Total Units : {data?.units?.total}
                  </p>{' '}
                </div>
              </div>
            </div>

            <div className="rounded-2xl text-primary-bg overflow-hidden mt-6">
              {/* Replace src with your actual image */}
              <div className={`${cardBase} ${cardLight}`}>
                <div className="rounded-xl p-1">
                  {' '}
                  <h2 className="text-xl font-bold mb-16">
                    Rent Summary{' '}
                  </h2>{' '}
                  <p className="font-medium italic">
                    Total Collected : {manager.totalCollected}{' '}
                  </p>
                  <p className="font-medium italic">
                    Pending Payments : {manager.pendingPayments}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default ManagerDashboard;
