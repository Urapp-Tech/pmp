import { Outlet } from 'react-router-dom';

function LayoutOutlet() {
  return (
    <div className="bg-super-admin-auth-background h-screen bg-[#f0f0f0]">
      <Outlet />
    </div>
  );
}

export default LayoutOutlet;
