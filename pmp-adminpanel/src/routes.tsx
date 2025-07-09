/* eslint-disable react-refresh/only-export-components */
import AppLayout from '@/layout/AppLayout';
import AuthLayout from '@/layout/AuthLayout';
import LayoutOutlet from '@/layout/LayoutOutlet';
import Login from '@/pages/auth/Login';
import PanelSetting from '@/pages/setting/panelSetting';
import SystemConfiguration from '@/pages/setting/systemConfiguration';
import { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router';
import Otp from './pages/auth/Otp';

const AddRolePermissionsPage = lazy(
  () => import('@/pages/role-permissions/AddRolePermissionsPage')
);
const CreatePropertyPage = lazy(
  () => import('@/pages/property/CreatePropertyPage')
);
const UpdatePropertyPage = lazy(
  () => import('@/pages/property/UpdatePropertyPage')
);
const UpdateRolePermissionPage = lazy(
  () => import('@/pages/role-permissions/UpdateRolePermissionPage')
);
const PropertyManagers = lazy(() => import('@/pages/property-managers/List'));
const Property = lazy(() => import('@/pages/property/List'));
const TenantUsers = lazy(() => import('@/pages/tenant-users/users-list/List'));
const Invoices = lazy(() => import('@/pages/Invoices/List'));
const Receipts = lazy(() => import('@/pages/receipts/List'));
const SupportMaintenance = lazy(
  () => import('@/pages/support-maintenance/List')
);
const RentalCollection = lazy(() => import('@/pages/rental-collection/List'));
const TenantRental = lazy(() => import('@/pages/tenant-rental/List'));
const ContractRequest = lazy(
  () => import('@/pages/tenant-users/contracts-request/List')
);
const ApprovedContracts = lazy(
  () => import('@/pages/tenant-users/approved-contracts/List')
);
const ReportedTicketsList = lazy(
  () => import('@/pages/support-maintenance/ReportedList')
);
const InvoiceReport = lazy(() => import('@/pages/reports/InvoiceReport'));
const InvoiceDetail = lazy(() => import('@/pages/reports/InvoiceDetail'));
const SuccessPage = lazy(() => import('@/pages/payments/Success'));
const FailurePage = lazy(() => import('@/pages/payments/Failure'));
const RoleBasedDashboard = lazy(() => import('@/pages/dashboard/index'));
const RolePermissions = lazy(
  () => import('@/pages/role-permissions/RolePermissions')
);

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
        path: 'payments/success',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SuccessPage />
          </Suspense>
        ),
      },
      {
        path: 'payments/failed',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FailurePage />
          </Suspense>
        ),
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
              {
                path: 'detail/:invoiceId',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <InvoiceDetail />
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
            path: 'support-tickets',
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
            ],
          },
          {
            path: 'reported-tickets',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
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
  {
    path: '/admin-panel/invoice/detail/:invoiceId',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <InvoiceDetail />
      </Suspense>
    ),
  },
];
