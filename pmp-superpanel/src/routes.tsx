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
import AddRolePermissionsPage from '@/pages/role-permissions/AddRolePermissionsPage';
import UpdateRolePermissionPage from '@/pages/role-permissions/UpdateRolePermissionPage';
import PropertyManagers from '@/pages/property-management/List';
import Users from './pages/landlord-users/List';
import Invoices from './pages/subscriptions-management/List';
import Receipts from './pages/security-logs/List';
import UnverifiedUsers from './pages/landlord-users/UnverifiedList';

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const RolePermissions = lazy(
  () => import('@/pages/role-permissions/RolePermissions')
);
const Blogs = lazy(() => import('@/pages/support-feedback/List'));

export const routeObjects: RouteObject[] = [
  {
    path: '/super-admin',
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
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: 'users',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <Users />
                  </Suspense>
                ),
              },
              {
                path: 'request-list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <UnverifiedUsers />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: 'property-management',
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
            path: 'subscription-management',
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
            path: 'security-and-logs',
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
            path: 'support-and-feedback',
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: 'list',
                element: (
                  <Suspense fallback={<div>Loading...</div>}>
                    <Blogs />
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
    element: <Navigate to="/super-admin/auth" replace />,
  },
];
