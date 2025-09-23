// import { useEffect, useState } from 'react';
// import { TopBar } from '@/components/TopBar';
// import { SidebarInset } from '@/components/ui/sidebar';
// import { Label } from '@/components/ui/label';
// import dashboardService from '@/services/adminapp/dashboard';
// import { MonitorCheck, Monitor, Users } from 'lucide-react';

// function Dashboard() {

//   return (
//     <div className="bg-white p-2 rounded-[20px] mt-5">
//       <SidebarInset>
//         <TopBar title="Dashboard" />
//         <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
//           <div className="grid auto-rows-min gap-4 md:grid-cols-3">
//             <div className="aspect-video p-3 rounded-xl bg-muted/50">
//               <Label className="text-xl" htmlFor="activeCabin">
//                 <Monitor /> Active Managers
//               </Label>
//               <div className="flex items-center justify-center mt-[15%]">
//                 <span className="text-4xl font-semibold">
//                   {data?.totalActiveCabins}
//                 </span>
//               </div>
//             </div>
//             <div className="aspect-video p-3 rounded-xl bg-muted/50">
//               <Label className="text-xl" htmlFor="activeCabin">
//                 <MonitorCheck /> Active Tenants
//               </Label>
//               <div className="flex items-center justify-center mt-[15%]">
//                 <span className="text-4xl font-semibold">
//                   {data?.totalActiveAssignedCabins}
//                 </span>
//               </div>
//             </div>
//             <div className="aspect-video p-3 rounded-xl bg-muted/50">
//               <Label className="text-xl" htmlFor="activeCabin">
//                 <Users /> Pending Invoices
//               </Label>
//               <div className="flex items-center justify-center mt-[15%]">
//                 <span className="text-4xl font-semibold">
//                   {data?.totalActiveEmployees}
//                 </span>
//               </div>
//             </div>
//           </div>
//           {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
//         </div>
//       </SidebarInset>
//     </div>
//   );
// }

// export default Dashboard;

// tenant dashboard
import { SidebarInset } from '@/components/ui/sidebar';
import { TopBar } from '@/components/TopBar';
import { getItem } from '@/utils/storage';
import { Label } from '@/components/ui/label';
import dashboardService from '@/services/adminapp/admin';
import { useEffect, useState } from 'react';
import { ASSET_BASE_URL } from '@/utils/constants';
import { cn } from '@/lib/utils';

function Dashboard() {
  const userDetail: any = getItem('USER');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        if (!userDetail?.id) return;
        const activity = await dashboardService.tenantActivity(userDetail.id);
        setData(activity.data);
      } catch (error) {
        console.error('Error fetching tenant activity:', error);
      }
    };

    fetchActivity();
  }, [userDetail?.id]);

  // helper to keep card style consistent
  const cardBase =
    'rounded-2xl shadow-sm ring-1 ring-black/5 px-4 py-3 sm:px-5 sm:py-4 w-full h-46 sm:h-50 flex flex-col';
  const cardLight = 'bg-secondary-bg'; // light mint (matches mock)
  // if (!data) return <div className="p-6">Loading...</div>;

  const { user, properties } = data ? data : {};

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--body-background)' }}
    >
      <SidebarInset>
        {/* CONTENT WRAP */}
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6">
          {/* HERO ROW: left welcome, right image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="rounded-2xl px-6 py-8">
              <h1 className="text-primary-bg text-3xl sm:text-4xl font-extrabold leading-snug">
                Hello {userDetail?.fname},
                <br />
                We hope all is well.
              </h1>
              <p className="mt-3 text-sm text-start text-primary-bg">
                Review your maintainance request, or download your receipts.
              </p>
            </div>
            <div className="rounded-2xl text-primary-bg overflow-hidden m-3">
              {/* Replace src with your actual image */}
              <div className={`${cardBase} ${cardLight}`}>
                <div className="rounded-xl p-1">
                  {' '}
                  <h2 className="text-xl font-bold pb-10">
                    PERSONAL INFORMATION{' '}
                  </h2>{' '}
                  <p className="font-medium">
                    Name : {userDetail?.fname} {userDetail?.lname}{' '}
                  </p>
                  <p className="font-medium">Gender : {userDetail?.gender}</p>
                  <p className="font-medium">Phone : {userDetail?.phone}</p>
                  <p className="font-medium">
                    Email : {userDetail?.email}
                  </p>{' '}
                </div>
              </div>
            </div>

            <div className="rounded-2xl text-primary-bg overflow-hidden m-3">
              {/* Replace src with your actual image */}
              <div className={`${cardBase} ${cardLight}`}>
                <div className="rounded-xl p-1">
                  {' '}
                  <h2 className="text-xl font-bold mb-2">
                    CONTRACT INFORMATION{' '}
                  </h2>{' '}
                  {user?.tenants?.length > 0 ? (
                    <div className="rounded-xl">
                      <div className="grid md:grid-cols-1 gap-4">
                        {user.tenants.map((tenant: any, index: number) => (
                          <div
                            key={index}
                            className="border-primary-bg border-2 p-3 rounded-md"
                          >
                            <div className="flex items-center justify-between pb-4">
                              <div>
                                <p className="text-center text-2xl font-bold">
                                  {tenant.unit_name}
                                </p>
                              </div>
                              <div>
                                {tenant.is_active === false && (
                                  <div className="flex justify-end items-center">
                                    <span
                                      className={cn(
                                        'text-xs font-semibold px-5 py-[5px] rounded-full',
                                        'bg-red-100 text-red-700'
                                      )}
                                    >
                                      {tenant.is_active === false
                                        ? 'Temporary Disabled'
                                        : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p>
                              <strong>Contract Number:</strong>{' '}
                              {tenant.contract_number}
                            </p>
                            <p>
                              <strong>Contract Start:</strong>{' '}
                              {new Date(
                                tenant.contract_start
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Contract End:</strong>{' '}
                              {new Date(
                                tenant.contract_end
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <strong>Rent:</strong> ${tenant.rent_price}
                            </p>
                            <p>
                              <strong>Payment Day:</strong>{' '}
                              {tenant.rent_pay_day}
                            </p>
                            {tenant.agreement_doc && (
                              <p>
                                <strong>Agreement Doc:</strong>{' '}
                                <a
                                  href={`${ASSET_BASE_URL}${tenant.agreement_doc}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  View
                                </a>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl p-4">
                      <p className="text-center text-lg font-semiBold pb-4">
                        No Contracts Found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-2xl text-primary-bg overflow-hidden m-3">
              {/* Replace src with your actual image */}
              <div className={`${cardBase} ${cardLight}`}>
                <div className="rounded-xl p-1">
                  {' '}
                  <h2 className="text-xl font-bold mb-2">PROPERTY </h2>{' '}
                  {properties?.length > 0 ? (
                    properties?.map((property: any, idx: number) => (
                      <div key={property.id} className="rounded-xl p-4 mt-4">
                        <h2 className="text-xl font-semibold underline underline-offset-4 mb-4">
                          Property #{idx + 1}: {property.name}
                        </h2>
                        <p>
                          <strong>Address:</strong> {property.address}
                        </p>
                        <p>
                          <strong>Type:</strong> {property.property_type}
                        </p>
                        {/* <p>
                 <strong>Status:</strong> {property.status}
               </p> */}

                        {/* 🔽 Units under this property */}
                        <div className="mt-4">
                          <h3 className="text-lg font-medium mb-2">
                            Assigned Units:
                          </h3>
                          <div className="grid md:grid-cols-1 gap-4">
                            {property?.units?.length > 0
                              ? property.units?.map((unit: any) => (
                                  <div
                                    key={unit.id}
                                    className="rounded-lg p-3 shadow border-2 border-primary-bg"
                                  >
                                    {unit.is_active === false && (
                                      <div className="flex justify-end items-center">
                                        <span
                                          className={cn(
                                            'text-xs font-semibold px-5 py-[5px] rounded-full',
                                            'bg-red-100 text-red-700'
                                          )}
                                        >
                                          {unit.is_active === false
                                            ? 'Temporary Disabled'
                                            : ''}
                                        </span>
                                      </div>
                                    )}
                                    <p>
                                      <strong>Unit Name:</strong> {unit.name}
                                    </p>
                                    <p>
                                      <strong>Unit No:</strong> {unit.unit_no}
                                    </p>
                                    <p>
                                      <strong>Unit Type:</strong>{' '}
                                      {unit.unit_type}
                                    </p>
                                    <p>
                                      <strong>Electricity Meter:</strong>{' '}
                                      {unit.electricity_meter}
                                    </p>
                                    <p>
                                      <strong>Water Meter:</strong>{' '}
                                      {unit.water_meter}
                                    </p>
                                    <p>
                                      <strong>Rent:</strong> {unit.rent}
                                    </p>
                                  </div>
                                ))
                              : 'No Units Found'}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl bg-muted/50 p-4">
                      <h2 className="text-xl font-semibold underline underline-offset-4 mb-4">
                        Assigned Units
                      </h2>
                      <p className="text-center text-2xl font-bold pb-4">
                        No Assigned Units
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default Dashboard;
