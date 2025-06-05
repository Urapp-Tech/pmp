import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

function AuthLayout() {
  const authState: any = useSelector((state: any) => state.authState);
  if (authState.user && authState.user.token) {
    return <Navigate to="../dashboard" replace />;
  }

  return (
    <div className="bg-super-admin-auth-background h-screen bg-[#f0f0f0]">
      {/* <NotificationProvider> */}
      <Toaster />
      <Outlet />
      {/* </NotificationProvider> */}
    </div>
  );
}

export default AuthLayout;
