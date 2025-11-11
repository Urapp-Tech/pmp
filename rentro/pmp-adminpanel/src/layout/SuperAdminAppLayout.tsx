/* eslint-disable prettier/prettier */
import Box from '@mui/material/Box';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../redux/redux-hooks';
import { NotificationProvider } from '../Contexts/NotificationContext';
import Sidebar from '../common/Sidebar';

function SuperAdminAppLayout() {
  const authState = useAppSelector((state) => state?.authState);

  if ((authState.user && !authState.user.isSuperAdmin) || !authState.user) {
    return <Navigate to="/admin" />;
  }
  // if (!authState.user) {
  //     return <Navigate to="/admin" />;
  // }

  return (
    <Box className="flex">
      <Box component="nav" className="w-64 flex-shrink-0">
        <Sidebar />
      </Box>
      <Box
        component="main"
        className="main--csr min-h-screen w-full flex-grow bg-gray-50 p-3 px-4"
      >
        <NotificationProvider>
          <Outlet />
        </NotificationProvider>
      </Box>
    </Box>
  );
}

export default SuperAdminAppLayout;
