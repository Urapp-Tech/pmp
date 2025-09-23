'use client';
import * as React from 'react';

import { FooterNavUser } from '@/components/SideBar/footer-nav';
import { NavMain } from '@/components/SideBar/main-nav';
// import { NavProjects } from "@/components/nav-projects"
// import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import assets from '@/assets/images';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { getItem } from '@/utils/storage';
import { useAppSelector } from '@/redux/redux-hooks';

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const collapsedSidebar = useAppSelector(
    (state) => state.appState.collapsedSidebar
  );
  const authState: any = useAppSelector((state) => state.authState);
  const appState: any = useAppSelector((state) => state.appState);
  const userRoles: any = getItem('USER');
  // console.log('userRoles', userRoles);

  // const { logo, media } = appState;
  // console.log('authState', appState);

  const data = {
    user: {
      name: `${authState?.user?.firstName} ${authState?.user?.lastName}`,
      email: authState?.user?.email ?? '',
      avatar:
        authState?.user?.avatar ??
        `${authState?.user?.firstName?.charAt(0)}${authState?.user?.lastName?.charAt(0)}`,
    },
    navMain: [
      {
        title: 'DASHBOARD',
        url: '/super-admin/dashboard',
        icon: assets.images.homeIcon,
        items: [],
      },
      {
        title: 'USERS',
        url: '/super-admin/users',
        icon: assets.images.usersIcon,
        items: [],
      },
      {
        title: 'REPORTS',
        url: '/super-admin/reports/analytics',
        icon: assets.images.reportIcon,
        items: [],
      },
      {
        title: 'LANDLORD REQUESTS',
        url: '/super-admin/landlord-request',
        icon: assets.images.tenantIcon,
        items: [],
      },
      {
        title: 'INVOICES',
        url: '/super-admin/invoices',
        icon: assets.images.invoiceIcon,
        items: [],
      },
      {
        title: 'RECEIPTS',
        url: '/super-admin/reports/invoices',
        icon: assets.images.receiptIcon,
        items: [],
      },
      // {
      //   title: 'Landlord Management',
      //   url: '#',
      //   icon: assets.images.adminUsersSidebarIcon,
      //   items: [
      //     {
      //       title: 'Users',
      //       url: '/super-admin/l-users',
      //     },
      //     {
      //       title: 'Requests',
      //       url: '/super-admin/l-users/request-list',
      //     },
      //   ],
      // },
      // {
      //   title: 'Users',
      //   url: '/super-admin/users',
      //   icon: assets.images.adminUsersSidebarIcon,
      //   items: [],
      // },
      {
        title: 'PROPERTY MANAGEMENT',
        url: '/super-admin/property-management',
        icon: assets.images.propIcon,
        items: [],
      },
      // {
      //   title: 'Subscription Management',
      //   url: '/super-admin/subscription-management',
      //   icon: assets.images.rolePermissionsSidebarIcon,
      //   items: [],
      // },
      {
        title: 'SECURITY AND LOGS',
        url: '/super-admin/security-and-logs',
        icon: assets.images.secLogsIcon,
        items: [],
      },
      // {
      //   title: 'Role Permissions',
      //   url: '/super-admin/role-permissions',
      //   icon: assets.images.pagesSidebarIcon,
      //   items: [],
      // },
      {
        title: 'SUPPORT TICKETS',
        url: '/super-admin/support-and-feedback',
        icon: assets.images.suppTicketIcon,
        items: [],
      },
      // {
      //   title: 'Operations',
      //   url: '#',
      //   icon: Users,
      //   items: [
      //     {
      //       title: 'Categories',
      //       url: '/dashboard/operations/categories',
      //     },
      //     {
      //       title: 'Reports',
      //       url: '/dashboard/operations/reports',
      //     },
      //   ],
      // },
      // {
      //   title: 'Settings',
      //   url: '#',
      //   icon: Settings2,
      //   items: [
      //     {
      //       title: 'Panel Settings',
      //       url: '/admin/setting/panel-settings',
      //     },
      //   ],
      // },
    ],
  };

  return (
    <Sidebar
      contentEditable="false"
      className="bg-sidebar-background text-white"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="flex items-center justify-center mt-0 mb-2">
        {collapsedSidebar && (
          <div className="text-white max-w-[110px] ml-5 m-auto mt-8">
            <img
              src={assets.images.companyIcon}
              className="max-w-full w-full h-full object-contain"
            />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent
        className={`${collapsedSidebar ? 'mt-5 border-t' : 'mt-[72px] border-t'}`}
      >
        <NavMain items={data.navMain} />
      </SidebarContent>
      {/* <SidebarFooter className="my-3">
        <FooterNavUser
          // media={shop ? shop?.media : media ? media : {}}
          user={data.user}
        />
      </SidebarFooter> */}
      {/* <SidebarRail /> */}
    </Sidebar>
  );
}
