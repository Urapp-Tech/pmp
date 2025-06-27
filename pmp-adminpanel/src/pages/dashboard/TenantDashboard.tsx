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
import dashboardService from '@/services/adminapp/admin';
import { useEffect, useState } from 'react';
import { ASSET_BASE_URL } from '@/utils/constants';

function Dashboard() {
  const userDetails: any = getItem('USER');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        if (!userDetails?.id) return;
        const activity = await dashboardService.tenantActivity(userDetails.id);
        setData(activity.data);
      } catch (error) {
        console.error('Error fetching tenant activity:', error);
      }
    };

    fetchActivity();
  }, [userDetails?.id]);

  // if (!data) return <div className="p-6">Loading...</div>;

  const { user, properties } = data ? data : {};

  return (
    <div className="bg-white rounded-[20px] mt-5">
      <SidebarInset>
        <TopBar title="Tenant Dashboard" />

        <div className="flex flex-col gap-6 p-6">
          <div className="rounded-xl bg-muted/50 p-4">
            <h2 className="text-xl font-semibold underline underline-offset-4 mb-4">
              Personal Information
            </h2>
            <p>
              <strong className="capitalize">Full Name: </strong>{' '}
              {userDetails?.fname} {userDetails?.lname}
            </p>
            <p>
              <strong>Email:</strong> {userDetails?.email}
            </p>
            <p>
              <strong>Gender:</strong> {userDetails?.gender}
            </p>
            <p>
              <strong>Phone:</strong> {userDetails?.phone}
            </p>
          </div>

          {properties?.length > 0 ? (
            properties?.map((property: any, idx: number) => (
              <div key={property.id} className="rounded-xl bg-muted/50 p-4">
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
                  <h3 className="text-lg font-medium mb-2">Assigned Units:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {property?.units?.length > 0
                      ? property.units?.map((unit: any) => (
                          <div
                            key={unit.id}
                            className="border rounded-lg p-3 bg-white shadow"
                          >
                            <p>
                              <strong>Unit Name:</strong> {unit.name}
                            </p>
                            <p>
                              <strong>Unit No:</strong> {unit.unit_no}
                            </p>
                            <p>
                              <strong>Unit Type:</strong> {unit.unit_type}
                            </p>
                            <p>
                              <strong>Electricity Meter:</strong>{' '}
                              {unit.electricity_meter}
                            </p>
                            <p>
                              <strong>Water Meter:</strong> {unit.water_meter}
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

          {user?.tenants?.length > 0 ? (
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-xl font-semibold underline underline-offset-4 mb-4">
                Contracts Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {user.tenants.map((tenant: any, index: number) => (
                  <div
                    key={index}
                    className="border p-3 rounded-md bg-white shadow"
                  >
                    <p className="text-center text-2xl font-bold pb-4">
                      {tenant.unit_name}
                    </p>
                    <p>
                      <strong>Contract Number:</strong> {tenant.contract_number}
                    </p>
                    <p>
                      <strong>Contract Start:</strong>{' '}
                      {new Date(tenant.contract_start).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Contract End:</strong>{' '}
                      {new Date(tenant.contract_end).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Rent:</strong> ${tenant.rent_price}
                    </p>
                    <p>
                      <strong>Payment Day:</strong> {tenant.rent_pay_day}
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
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-xl font-semibold underline underline-offset-4 mb-4">
                Contracts Information
              </h2>
              <p className="text-center text-2xl font-bold pb-4">
                No Contracts Found
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </div>
  );
}

export default Dashboard;
