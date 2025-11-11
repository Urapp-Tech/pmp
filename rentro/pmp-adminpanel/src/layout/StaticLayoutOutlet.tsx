import { Outlet } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';

function StaticLayoutOutlet() {
  return (
    <div className="">
      <Toaster />
      <Outlet />
    </div>
  );
}

export default StaticLayoutOutlet;
