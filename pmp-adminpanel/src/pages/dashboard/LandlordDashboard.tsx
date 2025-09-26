import { useEffect, useState } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import dashboardService from '@/services/adminapp/admin';
import assets from '@/assets/images';
import { getItem } from '@/utils/storage';

function LandlordDashboard() {
  const user: any = getItem('USER');
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchActivity = async () => {
      const activity = await dashboardService.activity(user?.landlordId);
      setData(activity.data);
    };
    fetchActivity();
  }, []);

  // helper to keep card style consistent
  const cardBase =
    'rounded-2xl shadow-sm ring-1 ring-black/5 px-4 sm:px-5 h-46 sm:h-50';
  const cardLight = 'bg-secondary-bg'; // light mint (matches mock)
  const cardDark = 'bg-secondary-bg'; // slightly darker mint (for alternates)
  const labelCls =
    'text-base text-primary-bg flex pb-6 items-center font-semibold';

  return (
    <div className="" style={{ background: 'var(--body-background)' }}>
      <SidebarInset>
        {/* CONTENT WRAP */}
        <div className="mx-auto w-full max-w-[2400px] px-4 sm:px-6 lg:px-8 py-6">
          {/* HERO ROW: left welcome, right image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-36 items-start mb-4">
            <div className="rounded-2xl px-6 py-8">
              <h1 className="text-primary-bg sm:text-4xl 2xl:text-5xl font-semibold leading-snug">
                Hello {user?.fname},
                <br />
                Welcome to your
                <br />
                dashboard overview.
              </h1>
              <p className="mt-4 px-1 text-sm 2xl:text-base text-primary-bg">
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
          <div className="grid gap-10 2xl::grid-cols-4 sm:grid-cols-2 2xl:mt-[3%]">
            {/* 1 */}
            <div className={`${cardBase} ${cardLight}`}>
              {/* <div className=""> */}
              <span className="text-[95px] leading-none mt-[5%] 2xl:mt-[4%] block font-semibold text-primary-bg">
                {data?.total_properties ?? 0}
              </span>
              {/* </div> */}
              <Label className={labelCls}>TOTAL PROPERTIES</Label>
            </div>

            {/* 2 */}
            <div className={`${cardBase} ${cardDark}`}>
              <div className="flex items-end justify-start">
                <span className="text-[95px] leading-none mt-[5%] 2xl:mt-[4%] block font-semibold text-primary-bg">
                  {data?.active_tenant_users ?? 0}
                </span>
              </div>
              <Label className={labelCls}>ACTIVE TENANTS</Label>
            </div>

            {/* 3 */}
            <div className={`${cardBase} ${cardLight}`}>
              <div className="flex items-end justify-start">
                <span className="text-[95px] leading-none mt-[5%] 2xl:mt-[4%] block font-semibold text-primary-bg">
                  {data?.pending_invoices ?? 0}
                </span>
              </div>
              <Label className={labelCls}>PENDING INVOICES</Label>
            </div>

            {/* 4 */}
            <div className={`${cardBase} ${cardDark}`}>
              <div className="flex items-end justify-start">
                <span className="text-[95px] leading-none mt-[5%] 2xl:mt-[4%] block font-semibold text-primary-bg">
                  {data?.unresolved_tickets ?? 0}
                </span>
              </div>
              <Label className={labelCls}>UNRESOLVED TICKETS</Label>
            </div>

            {/* 5 */}
            {/* <div className={`${cardBase} ${cardLight}`}>
              <Label className={labelCls}>ACTIVE LANDLORDS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.activeLandlords ?? 0}
                </span>
              </div>
            </div> */}

            {/* 6 */}
            {/* <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>ACTIVE MANAGERS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.activeManagers ?? 0}
                </span>
              </div>
            </div> */}

            {/* 7 */}
            {/* <div className={`${cardBase} ${cardLight}`}>
              <Label className={labelCls}>PENDING INVOICES</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.pendingInvoices ?? 0}
                </span>
              </div>
            </div> */}

            {/* 8 */}
            {/* <div className={`${cardBase} ${cardDark}`}>
              <Label className={labelCls}>UNRESOLVED TICKETS</Label>
              <div className="flex-1 flex items-end justify-start mt-6">
                <span className="text-[64px] font-semibold text-primary-bg">
                  {data?.unresolvedTickets ?? 0}
                </span>
              </div>
            </div> */}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default LandlordDashboard;
