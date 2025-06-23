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
import { useSelector } from 'react-redux';
import { PERMISSIONS } from '@/utils/constants';
import { hasPermission } from '@/utils/hasPermission';

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const authState: any = useSelector((state: any) => state.authState);
  const appState: any = useSelector((state: any) => state.appState);
  const shop: any = getItem('SHOP_TENANT');
  const userRoles: any = getItem('USER');
  const { logo, media } = appState;
  console.log('authState', userRoles?.role);

  const rolePermissions = userRoles?.role?.permissions || [];

  const navItems = [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: assets.images.dashboardSidebarIcon,
      permission: null,
      items: [],
    },
    {
      title: 'Property Managers',
      url: '/admin/property-managers',
      icon: assets.images.usersSidebarIcon,
      permission: PERMISSIONS.MANAGER.VIEW,
      items: [],
    },
    {
      title: 'Tenant Users',
      url: '/admin/tenant-users',
      icon: assets.images.adminUsersSidebarIcon,
      permission: PERMISSIONS.USER.VIEW,
      items: [],
    },
    {
      title: 'Properties',
      url: '/admin/property',
      icon: assets.images.rolePermissionsSidebarIcon,
      permission: PERMISSIONS.PROPERTY.VIEW,
      items: [
        {
          title: 'Create Property',
          url: '/admin/property/add',
        },
        {
          title: 'List Properties',
          url: '/admin/property/list',
        },
      ],
    },
    {
      title: 'Landlord User Roles',
      url: '/admin/role-permissions',
      icon: assets.images.rolePermissionsSidebarIcon,
      permission: PERMISSIONS.ROLE.VIEW,
      items: [],
    },
    {
      title: 'Plan Flexibility',
      url: '/admin/feedback',
      icon: assets.images.helpFeedbackSidebarIcon,
      permission: PERMISSIONS.PLAN_FLEXIBILITY.VIEW,
      items: [],
    },
    {
      title: 'Maintenance and Dispute Requests',
      url: '/admin/support-maintenance',
      icon: assets.images.notificationSidebarIcon,
      permission: PERMISSIONS.MAINTENANCE_REQUEST.VIEW,
      items: [],
    },
    {
      title: 'Bank and Settlement Tracking',
      url: '/admin/feedback',
      icon: assets.images.helpFeedbackSidebarIcon,
      permission: PERMISSIONS.BANK_SETTLEMENT.VIEW,
      items: [],
    },
    {
      title: 'Financial Reports',
      url: '/admin/pages',
      icon: assets.images.pagesSidebarIcon,
      permission: PERMISSIONS.FINANCIAL_REPORT.VIEW,
      items: [],
    },
    {
      title: 'Receipts',
      url: '/admin/receipts',
      icon: assets.images.pagesSidebarIcon,
      permission: PERMISSIONS.RECEIPT.VIEW,
      items: [],
    },
    {
      title: 'Inovices',
      url: '/admin/invoices',
      icon: assets.images.rolePermissionsSidebarIcon,
      permission: PERMISSIONS.INVOICE.VIEW,
      items: [],
    },
    {
      title: 'Rental Collection',
      url: '/admin/rental-collection',
      icon: assets.images.rolePermissionsSidebarIcon,
      permission: PERMISSIONS.RENTAL_COLLECTION.VIEW,
      items: [],
    },
    {
      title: 'My Rents',
      url: '/admin/tenant-rental',
      icon: assets.images.rolePermissionsSidebarIcon,
      permission: PERMISSIONS.TENANT_RENTAL.VIEW,
      items: [],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) =>
      !item.permission || hasPermission(rolePermissions, item.permission)
  );

  const data = {
    user: {
      name: `${authState?.user?.firstName} ${authState?.user?.lastName}`,
      email: authState?.user?.email ?? '',
      avatar:
        authState?.user?.avatar ??
        `${authState?.user?.firstName?.charAt(0)}${authState?.user?.lastName?.charAt(0)}`,
    },
    navMain: filteredNavItems || [],
  };

  return (
    <Sidebar className="bg-transparent" collapsible="icon" {...props}>
      <SidebarHeader className=" flex items-center justify-center mt-0 mb-2  bg-[#1b46e0]">
        <div className="text-white max-w-[110px] ml-5 mr-auto mt-2 py-3">
          PMP - LOGO
          {/* <img
            src={assets.images.whiteLogo}
            className="max-w-full w-full h-full object-contain"
          /> */}
        </div>
        <div className="text-white">{userRoles?.role?.name} Panel</div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="my-3">
        <FooterNavUser
          media={shop ? shop?.media : media ? media : {}}
          user={data.user}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
