/* eslint-disable react-refresh/only-export-components */
import AppLayout from '@/layout/AppLayout';
import AuthLayout from '@/layout/AuthLayout';
import LayoutOutlet from '@/layout/LayoutOutlet';
import Login from '@/pages/auth/Login';
import Employees from '@/pages/employees/Employees';
import EmployeeCabinHistory from '@/pages/employees/EmployeeCabinHistory';
import PanelSetting from '@/pages/setting/panelSetting';
import SystemConfiguration from '@/pages/setting/systemConfiguration';
import { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router';
import Otp from './pages/auth/Otp';
import AddRolePermissionsPage from '@/pages/role-permissions/AddRolePermissionsPage';
import CreatePropertyPage from '@/pages/property/CreatePropertyPage';
import UpdatePropertyPage from '@/pages/property/UpdatePropertyPage';
import UpdateRolePermissionPage from '@/pages/role-permissions/UpdateRolePermissionPage';
import PropertyManagers from '@/pages/property-managers/List';
import Property from '@/pages/property/List';
import TenantUsers from './pages/tenant-users/users-list/List';
import Invoices from './pages/Invoices/List';
import Receipts from './pages/receipts/List';
import SupportMaintenance from './pages/support-maintenance/List';
import RentalCollection from './pages/rental-collection/List';
import TenantRental from './pages/tenant-rental/List';
import ContractRequest from './pages/tenant-users/contracts-request/List';
import ApprovedContracts from './pages/tenant-users/approved-contracts/List';
import ReportedTicketsList from './pages/support-maintenance/ReportedList';
import InvoiceReport from './pages/reports/InvoiceReport';
// const LandlordDashboard = lazy(
//   () => import('@/pages/dashboard/LandlordDashboard')
// );

const RoleBasedDashboard = lazy(() => import('@/pages/dashboard/index'));
const TenantDashboard = lazy(() => import('@/pages/dashboard/TenantDashboard'));

const OfficeUsers = lazy(() => import('@/pages/property-managers/List'));
const RolePermissions = lazy(
  () => import('@/pages/role-permissions/RolePermissions')
);
const Blogs = lazy(() => import('@/pages/blogs/Blogs'));

export const routeObjects: RouteObject[] = [
  {
    path: '/admin-panel',
    element: <LayoutOutlet />,
    children: [
      {
        index: true,
        element: <Navigate to="auth" replace />,
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="login" replace />,
          },
          {
            path: 'login',
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Login />
              </Suspense>
            ),
          },

          {
            path: 'otp',
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <Otp />
              </Suspense>
            ),
          },
        ],
      },
      {
        // path: '',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                <RoleBasedDashboard />
              </Suspense>
            ),
          },
          {
            path: 'property-managers',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <PropertyManagers />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'property',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <Property />
                  </Suspense>
                ),
              },
              {
                path: 'add',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <CreatePropertyPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:id',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <UpdatePropertyPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'tenant-users',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <TenantUsers />
                  </Suspense>
                ),
              },
              {
                path: 'pending',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <ContractRequest />
                  </Suspense>
                ),
              },
              {
                path: 'approved',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <ApprovedContracts />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'invoices',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <Invoices />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'receipts',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <Receipts />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'reports',
            children: [
              {
                index: true,
                element: <Navigate to="invoices" replace />,
              },
              {
                path: 'invoices',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <InvoiceReport />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'support-maintenance',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <SupportMaintenance />
                  </Suspense>
                ),
              },
              {
                path: 'tenant-tickets',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <ReportedTicketsList />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'rental-collection',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <RentalCollection />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'tenant-rental',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <TenantRental />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'role-permissions',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <RolePermissions />
                  </Suspense>
                ),
              },
              {
                path: 'add',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <AddRolePermissionsPage />
                  </Suspense>
                ),
              },
              {
                path: 'edit/:roleId',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <UpdateRolePermissionPage />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'setting',
            children: [
              {
                index: true,
                element: <Navigate to="panel-settings" replace />,
              },
              {
                path: 'panel-settings',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <PanelSetting />
                  </Suspense>
                ),
              },
              {
                path: 'system-configuration',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <SystemConfiguration />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/admin-panel/auth" replace />,
  },
];
