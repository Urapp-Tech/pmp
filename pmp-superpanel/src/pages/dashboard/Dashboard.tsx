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
          <div className="grid auto-rows-min gap-4 md:grid-cols-4">
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <Users /> Active Tenant Users
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-lunar-bg font-semibold">
                  {data?.activeTenants}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <MonitorCheck /> Active Requests
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-neptune-bg font-semibold">
                  {data?.activeRequests}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <Monitor /> Current Month Invoices
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-mars-bg font-semibold">
                  {data?.currentMonthUnpaidInvoices}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <MonitorCheck /> Current Month Receipts
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-saturn-bg font-semibold">
                  {data?.currentMonthPaidReceipts}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <MonitorCheck /> Active Landlords
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-venus-bg font-semibold">
                  {data?.activeLandlords}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <MonitorCheck /> Active Managers
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-tertiary-bg font-semibold">
                  {data?.activeManagers}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <MonitorCheck /> Pending Invoices
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-quaternary-bg font-semibold">
                  {data?.pendingInvoices}
                </span>
              </div>
            </div>
            <div className="aspect-video p-3 rounded-xl bg-muted/50">
              <Label className="text-sm" htmlFor="activeCabin">
                <MonitorCheck /> Unresolved Tickets
              </Label>
              <div className="flex items-center justify-center mt-[15%]">
                <span className="text-4xl text-jupiter-bg font-semibold">
                  {data?.unresolvedTickets}
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
