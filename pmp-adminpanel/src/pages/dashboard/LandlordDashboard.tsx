import { useEffect, useState } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { TopBar } from '@/components/TopBar';
import { Label } from '@/components/ui/label';
// import { Input } from '@/components/ui/input';
import dashboardService from '@/services/adminapp/admin';
import { Building2, Users, FileWarning, Wrench } from 'lucide-react';
import { getItem } from '@/utils/storage';

function LandlordDashboard() {
  const [data, setData] = useState<any>();
  const userDetails: any = getItem('USER');

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await dashboardService.activity(userDetails?.landlordId);
      // if (activity.data.success) {
      setData(activity.data);
      // }
    };
    fetchActivity();
  }, []);

  return (
    <div className="bg-white p-2 rounded-[20px] mt-5">
      <SidebarInset>
        <TopBar title="Dashboard" />
        <div className="flex flex-col gap-6 p-4 pt-0">
          {/* Search Bar */}
          <div className="w-full max-w-md">
            <Label htmlFor="propertySearch" className="text-lg font-medium">
              Activities
            </Label>
            {/* <Input
              id="propertySearch"
              placeholder="Enter property name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-1"
            /> */}
          </div>

          {/* Stats Cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <div className="aspect-video p-4 rounded-xl bg-muted/50">
              <Label className="text-lg flex items-center gap-2">
                <Building2 /> Total Properties
              </Label>
              <div className="flex justify-center items-center h-full text-4xl font-semibold">
                {data?.total_properties}
              </div>
            </div>

            <div className="aspect-video p-4 rounded-xl bg-muted/50">
              <Label className="text-lg flex items-center gap-2">
                <Users /> Active Tenants
              </Label>
              <div className="flex justify-center items-center h-full text-4xl font-semibold">
                {data?.active_tenant_users}
              </div>
            </div>

            <div className="aspect-video p-4 rounded-xl bg-muted/50">
              <Label className="text-lg flex items-center gap-2">
                <FileWarning /> Pending Invoices
              </Label>
              <div className="flex justify-center items-center h-full text-4xl font-semibold">
                {data?.pending_invoices}
              </div>
            </div>

            <div className="aspect-video p-4 rounded-xl bg-muted/50">
              <Label className="text-lg flex items-center gap-2">
                <Wrench /> Unresolved Tickets
              </Label>
              <div className="flex justify-center items-center h-full text-4xl font-semibold">
                {data?.unresolved_tickets}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default LandlordDashboard;
