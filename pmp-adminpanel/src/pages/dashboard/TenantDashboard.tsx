// import { useEffect, useState } from 'react';
// import { TopBar } from '@/components/TopBar';
// import { SidebarInset } from '@/components/ui/sidebar';
// import { Label } from '@/components/ui/label';
// import dashboardService from '@/services/adminapp/dashboard';
// import { MonitorCheck, Monitor, Users } from 'lucide-react';

// function Dashboard() {
//   const [data, setData] = useState<any>();

//   // useEffect(() => {
//   //   const fetchActivity = async () => {
//   //     const activity = await dashboardService.activity();
//   //     if (activity.data.success) {
//   //       setData(activity.data.data);
//   //     }
//   //   };
//   //   fetchActivity();
//   // }, []);

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

function Dashboard() {
  const tenant = {
    fullName: 'Test User',
    email: 'test@user.com',
    gender: 'male',
    property: '',
    unit: '',
    address: '',
    rentPrice: '',
    contractDuration: '',
  };
  const userDetails: any = getItem('USER');
  return (
    <div className="bg-white p-4 rounded-[20px] mt-5">
      <SidebarInset>
        <TopBar title="Tenant Dashboard" />

        <div className="flex flex-col gap-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2 underline underline-offset-3">
                Personal Information
              </h2>
              <p className="py-[2px]">
                <strong>Full Name:</strong> {userDetails?.fname}{' '}
                {userDetails?.lname}
              </p>
              <p>
                <strong>Email:</strong> {userDetails?.email}
              </p>
              <p>
                <strong>Gender:</strong> {userDetails?.gender}
              </p>
            </div>

            {/* <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="text-lg font-semibold mb-2 underline underline-offset-3">
                Rental Details
              </h2>
              <p className="py-[2px]">
                <strong>Property:</strong> {tenant.property}
              </p>
              <p>
                <strong>Unit:</strong> {tenant.unit}
              </p>
              <p className="py-[2px]">
                <strong>Address:</strong> {tenant.address}
              </p>
              <p>
                <strong>Rent Price:</strong> {tenant.rentPrice}
              </p>
              <p className="py-[2px]">
                <strong>Contract Duration:</strong> {tenant.contractDuration}
              </p>
            </div> */}
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}

export default Dashboard;
