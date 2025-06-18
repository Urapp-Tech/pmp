import { MainSidebar } from '@/components/SideBar/index';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

function AppLayout() {
  const authState: any = useSelector((state: any) => state.authState);
  if (!authState.user) {
    return <Navigate to="/super-admin/auth" />;
  }

  return (
    <SidebarProvider className="bg-panel">
      <MainSidebar />
      <Toaster />
      <div className="w-full mt-10 p-5 bg-transparent">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
