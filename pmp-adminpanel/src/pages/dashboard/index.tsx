import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ManagerDashboard from './ManagerDashboard';
import TenantDashboard from './TenantDashboard';
import LandlordDashboard from './LandlordDashboard';
import { getItem } from '@/utils/storage';

const RoleBasedDashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user: any = getItem('USER');
    if (user) {
      try {
        setRole(user.role.name);
      } catch (error) {
        console.error('Invalid USER in localStorage');
      }
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!role) return <Navigate to="/admin/auth/login" replace />;

  if (role === 'Manager') return <ManagerDashboard />;
  if (role === 'User') return <TenantDashboard />;
  if (role === 'Landlord') return <LandlordDashboard />;

  return <div>No dashboard available for your role.</div>;
};

export default RoleBasedDashboard;
