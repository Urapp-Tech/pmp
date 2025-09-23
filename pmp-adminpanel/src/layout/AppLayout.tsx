import { MainSidebar } from '@/components/SideBar/index';
import { TopBar } from '@/components/TopBar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

function AppLayout() {
  const authState: any = useSelector((state: any) => state.authState);
  if (!authState.user) {
    return <Navigate to="/admin-panel/auth" />;
  }

  return (
    <SidebarProvider className="bg-panel">
      <MainSidebar />
      <SidebarInset>
        <TopBar />
        <Toaster />
        <div className="w-full bg-panel">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
