import { Outlet } from 'react-router-dom';

function StaticLayoutOutlet() {
  return (
    <div className="">
      <Outlet />
    </div>
  );
}

export default StaticLayoutOutlet;
