'use client';
import * as React from 'react';

import { FooterNavUser } from '@/components/SideBar/footer-nav';
import { NavMain } from '@/components/SideBar/main-nav';
import { Contact, Contact2Icon } from 'lucide-react';
// import { NavProjects } from "@/components/nav-projects"
// import { NavUser } from "@/components/nav-user"
// import { TeamSwitcher } from "@/components/team-switcher"
import { PERMISSIONS } from '@/utils/constants';
import { hasPermission } from '@/utils/hasPermission';
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

  const rolePermissions = userRoles?.role?.permissions || [];

  const userRole = userRoles?.role?.name;

  const navItems = [
    {
      title: 'DASHBOARD',
      url: 'dashboard',
      icon: assets.images.homeIcon,
      items: [],
    },
    {
      title: 'USERS',
      url: 'users',
      icon: assets.images.usersIcon,
      permission: PERMISSIONS.USER.VIEW,
      items: [],
    },
    {
      title: 'REPORTS',
      url: 'reports/analytics',
      icon: assets.images.reportIcon,
      permission: PERMISSIONS.GRAPHICAL_REPORT.VIEW,
      items: [],
    },
    {
      title: 'BANK TRANSACTIONS',
      url: 'bank-transaction',
      icon: assets.images.bankTIcon,
      permission: PERMISSIONS.BANK_SETTLEMENT.VIEW,
      items: [],
    },
    {
      title: 'SUBSCRIBED LANDLORDS',
      url: 'subscribed-landlords',
      icon: assets.images.tenantIcon,
      permission: PERMISSIONS.SUBSCRIBED_USER.VIEW,
      items: [],
    },
    {
      title: 'LANDLORD PAYMENTS',
      url: 'landlord-payments',
      icon: assets.images.tenantIcon,
      permission: PERMISSIONS.LANDLORD_PAYMENT.VIEW,
      items: [],
    },
    {
      title: 'LANDLORD REQUESTS',
      url: 'landlord-request',
      icon: assets.images.tenantIcon,
      permission: PERMISSIONS.LANDLORD_REQUEST.VIEW,
      items: [],
    },
    {
      title: 'INVOICES',
      url: 'invoices',
      icon: assets.images.invoiceIcon,
      permission: PERMISSIONS.INVOICE.VIEW,
      items: [],
    },
    {
      title: 'RECEIPTS',
      url: 'reports/invoices',
      icon: assets.images.receiptIcon,
      permission: PERMISSIONS.FINANCIAL_REPORT.VIEW,
      items: [],
    },
    {
      title: 'PROPERTY MANAGEMENT',
      url: 'property-management',
      permission: PERMISSIONS.PROPERTY.VIEW,
      icon: assets.images.propIcon,
      items: [],
    },
    {
      title: 'SECURITY AND LOGS',
      url: 'security-and-logs',
      icon: assets.images.secLogsIcon,
      permission: PERMISSIONS.SECURITYLOGS.VIEW,
      items: [],
    },
    {
      title: 'CONTACT US SUBMISSIONS',
      url: 'contact-us',
      icon: assets.images.suppTicketIcon,
      permission: PERMISSIONS.CONTACTUS.VIEW,
      items: [],
    },
    {
      title: 'ROLES AND PERMISSIONS',
      url: 'role-permissions',
      icon: assets.images.secLogsIcon,
      permission: PERMISSIONS.ROLE.VIEW,
      items: [],
    },
    {
      title: 'SUPPORT TICKETS',
      url: 'support-and-feedback',
      icon: assets.images.suppTicketIcon,
      permission: PERMISSIONS.SUPPORT_TICKETS.VIEW,
      items: [],
    },
  ];

  const filteredNavItems = navItems
    .map((item) => {
      const hasSubItems = Array.isArray(item.items) && item.items.length > 0;

      const filteredItems = hasSubItems
        ? item.items.filter((subItem: any) => {
            const hasPermissionAccess =
              !subItem.permission ||
              hasPermission(rolePermissions, subItem.permission);

            const hasRoleAccess =
              !subItem.role ||
              (Array.isArray(subItem.role)
                ? subItem.role.includes(userRole)
                : subItem.role === userRole);

            return hasPermissionAccess && hasRoleAccess;
          })
        : item.items;

      return {
        ...item,
        items: filteredItems,
      };
    })
    .filter((item: any) => {
      const hasPermissionAccess =
        !item.permission || hasPermission(rolePermissions, item.permission);

      const hasRoleAccess =
        !item.role ||
        (Array.isArray(item.role)
          ? item.role.includes(userRole)
          : item.role === userRole);

      const hasVisibleSubItems =
        !Array.isArray(item.items) || item.items.length >= 0;

      return hasPermissionAccess && hasRoleAccess && hasVisibleSubItems;
    });

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
