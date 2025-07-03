import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { SidebarInset } from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import dashboardService from '@/services/adminapp/admin';
import { MonitorCheck, Monitor, Users } from 'lucide-react';

function Dashboard() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await dashboardService.activity();
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-xl" htmlFor="activeCabin">
                <Users /> Active Tenant Users
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl font-semibold">
                  {data?.activeTenants}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-xl" htmlFor="activeCabin">
                <MonitorCheck /> Active Requests
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl font-semibold">
                  {data?.activeRequests}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-xl" htmlFor="activeCabin">
                <Monitor /> Currnet Month Invoices
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl font-semibold">
                  {data?.currentMonthUnpaidInvoices}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-xl" htmlFor="activeCabin">
                <MonitorCheck /> Currnet Month Receipts
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl font-semibold">
                  {data?.currentMonthPaidReceipts}
                </span>
              </div>
            </div>
          </div>
          {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
        </div>
      </SidebarInset>
    </div>
  );
}

export default Dashboard;
