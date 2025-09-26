import { useEffect, useState } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import dashboardService from '@/services/adminapp/admin';
import { MonitorCheck, Monitor, Users } from 'lucide-react';
import assets from '@/assets/images';

function Dashboard() {
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await dashboardService.activity();
      setData(activity.data);
    };
    fetchActivity();
  }, []);

  // helper to keep card style consistent
  const cardBase =
    'rounded-2xl shadow-sm ring-1 ring-black/5 px-4 py-3 sm:px-5 sm:py-4 h-36 sm:h-40 flex flex-col';
  const cardLight = 'bg-secondary-bg'; // light mint (matches mock)
  const cardDark = 'bg-secondary-bg'; // slightly darker mint (for alternates)
  const labelCls =
    'text-[14px] text-primary-bg flex items-center gap-2 font-semibold';

  return (
    <div className="" style={{ background: 'var(--body-background)' }}>
      <SidebarInset>
        {/* CONTENT WRAP */}
        <div className="w-full max-w-[2000px] px-4 sm:px-6 lg:px-8 py-6">
          {/* HERO ROW: left welcome, right image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-36 items-start mb-12">
            <div className="rounded-2xl px-6 py-8">
              <h1 className="text-primary-bg sm:text-4xl 2xl:text-5xl font-semibold leading-snug">
                Hello Fahad,
                <br />
                Welcome to your
                <br />
                dashboard overview.
              </h1>
              <p className="mt-3 text-sm text-primary-bg px-1">
                Track and manage the listed properties
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden m-3 flex justify-end">
              {/* Replace src with your actual image */}
              <img
                src={assets.images.dashboardHomeImg}
                alt="Building"
                className="w-[250px] h-[240px] object-contain object-right"
              />
            </div>
          </div>

          {/* METRIC CARDS: 4 x 2 grid */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* 1 */}
            <div className={`${cardBase} ${cardLight}`}>
              <Label className={labelCls}>ACTIVE TENANT USERS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.activeTenants ?? 0}
                </span>
              </div>
            </div>

            {/* 2 */}
            <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>ACTIVE REQUESTS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.activeRequests ?? 0}
                </span>
              </div>
            </div>

            {/* 3 */}
            <div className={`${cardBase} ${cardLight}`}>
              <Label className={labelCls}>CURRENT MONTH INVOICES</Label>
              <div className="flex-1 flex items-end justify-start mt-0">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.currentMonthUnpaidInvoices ?? 0}
                </span>
              </div>
            </div>

            {/* 4 */}
            <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>CURRENT MONTH RECEIPTS</Label>
              <div className="flex-1 flex items-end justify-start mt-0">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.currentMonthPaidReceipts ?? 0}
                </span>
              </div>
            </div>

            {/* 5 */}
            <div className={`${cardBase} ${cardLight}`}>
              <Label className={labelCls}>ACTIVE LANDLORDS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.activeLandlords ?? 0}
                </span>
              </div>
            </div>

            {/* 6 */}
            <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>ACTIVE MANAGERS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.activeManagers ?? 0}
                </span>
              </div>
            </div>

            {/* 7 */}
            <div className={`${cardBase} ${cardLight}`}>
              <Label className={labelCls}>PENDING INVOICES</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.pendingInvoices ?? 0}
                </span>
              </div>
            </div>

            {/* 8 */}
            <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>UNRESOLVED TICKETS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.unresolvedTickets ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default Dashboard;
