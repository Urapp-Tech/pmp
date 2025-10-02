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
import { useAppSelector } from '@/redux/redux-hooks';

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const collapsedSidebar = useAppSelector(
    (state) => state.appState.collapsedSidebar
  );
  const authState: any = useSelector((state: any) => state.authState);
  const appState: any = useSelector((state: any) => state.appState);
  const shop: any = getItem('SHOP_TENANT');
  const userRoles: any = getItem('USER');
  // console.log('authState', userRoles?.role);

  const rolePermissions = userRoles?.role?.permissions || [];

  const userRole = userRoles?.role?.name;

  const navItems = [
    {
      title: 'DASHBOARD',
      url: '/admin-panel/dashboard',
      icon: assets.images.homeIcon,
      permission: null,
      items: [],
    },
    {
      title: 'PROPERTY MANAGERS',
      url: '/admin-panel/property-managers',
      icon: assets.images.usersIcon,
      permission: PERMISSIONS.MANAGER.VIEW,
      items: [],
    },
    {
      title: 'TENANT',
      url: '/admin-panel/tenant-users',
      icon: assets.images.usersIcon,
      permission: PERMISSIONS.USER.VIEW,
      items: [
        {
          title: 'Tenants List',
          url: '/admin-panel/tenant-users/list',
          permission: PERMISSIONS.USER.VIEW,
        },
        {
          title: 'Contracts Request',
          url: '/admin-panel/tenant-users/pending',
          permission: PERMISSIONS.USER_CONTRACT.VIEW,
        },
        {
          title: 'Approved Contracts',
          url: '/admin-panel/tenant-users/approved',
          permission: PERMISSIONS.USER_CONTRACT.VIEW,
        },
      ],
    },
    {
      title: 'PROPERTIES',
      url: '/admin-panel/property',
      icon: assets.images.propIcon,
      permission: PERMISSIONS.PROPERTY.VIEW,
      items: [
        {
          title: 'Create Property',
          url: '/admin-panel/property/add',
          role: ['Landlord'],
          // permission: PERMISSIONS.PROPERTY.CREATE,
        },
        {
          title: 'List Properties',
          url: '/admin-panel/property/list',
          permission: PERMISSIONS.PROPERTY.VIEW,
        },
      ],
    },
    // {
    //   title: 'Landlord User Roles',
    //   url: '/admin-panel/role-permissions',
    //   icon: assets.images.rolePermissionsSidebarIcon,
    //   permission: PERMISSIONS.ROLE.VIEW,
    //   items: [],
    // },
    {
      title: 'PLAN FLEXIBILITY',
      url: '/admin-panel/feedback',
      icon: assets.images.helpFeedbackSidebarIcon,
      permission: PERMISSIONS.PLAN_FLEXIBILITY.VIEW,
      items: [],
    },
    {
      title:
        userRoles?.role?.name === 'User'
          ? 'MAINTENANCE REQUESTS'
          : 'SUPPORT TICKETS',
      url: '/admin-panel/support-tickets',
      icon: assets.images.suppTicketIcon,
      permission: PERMISSIONS.MAINTENANCE_REQUEST.VIEW,
      items: [],
    },
    {
      title: 'MAINTENANCE REQUESTS',
      url: '/admin-panel/reported-tickets',
      icon: assets.images.MaintenanceIcon,
      permission: PERMISSIONS.MAINTENANCE_REQUEST.VIEW,
      role: ['Landlord', 'Manager'],
      items: [],
    },
    {
      title: 'BANK AND SETTLEMENTS TRACKING',
      url: '/admin-panel/feedback',
      icon: assets.images.helpFeedbackSidebarIcon,
      permission: PERMISSIONS.BANK_SETTLEMENT.VIEW,
      items: [],
    },
    {
      title: 'RECEIPTS',
      url: '/admin-panel/receipts',
      icon: assets.images.receiptIcon,
      permission: PERMISSIONS.RECEIPT.VIEW,
      items: [],
    },
    {
      title: 'INVOICES',
      url: '/admin-panel/invoices',
      icon: assets.images.invoiceIcon,
      permission: PERMISSIONS.INVOICE.VIEW,
      items: [],
      role: ['Landlord', 'Manager'],
    },
    {
      title: 'RECEIPTS',
      url: '/admin-panel/reports/invoices',
      icon: assets.images.receiptIcon,
      permission: PERMISSIONS.FINANCIAL_REPORT.VIEW,
      items: [],
    },
    // {
    //   title: 'Rental Collection',
    //   url: '/admin/rental-collection',
    //   icon: assets.images.rolePermissionsSidebarIcon,
    //   permission: PERMISSIONS.RENTAL_COLLECTION.VIEW,
    //   items: [],
    // },
    {
      title: 'MY RENTAL INVOICES',
      url: '/admin-panel/invoices',
      icon: assets.images.invoiceIcon,
      permission: PERMISSIONS.TENANT_RENTAL.VIEW,
      items: [],
      role: ['User'],
    },
  ];

  // parent oriented
  // const filteredNavItems = navItems.filter(
  //   (item) =>
  //     !item.permission || hasPermission(rolePermissions, item.permission)
  // );

  // parent and their items oriented
  // const filteredNavItems = navItems
  //   .map((item) => {
  //     // Filter sub-items if they exist and have permission field
  //     const hasSubItems = Array.isArray(item.items) && item.items.length > 0;

  //     const filteredItems = hasSubItems
  //       ? item.items.filter(
  //           (subItem: any) =>
  //             !subItem.permission ||
  //             hasPermission(rolePermissions, subItem.permission)
  //         )
  //       : item.items; // keep empty [] or undefined as-is

  //     return {
  //       ...item,
  //       items: filteredItems,
  //     };
  //   })
  //   .filter((item) => {
  //     const hasPermissionForItem =
  //       !item.permission || hasPermission(rolePermissions, item.permission);

  //     // ⚠️ Keep items with no sub-items OR with valid sub-items
  //     const subItemsValid =
  //       !Array.isArray(item.items) || item.items.length >= 0;

  //     return hasPermissionForItem && subItemsValid;
  //   });

  // parent and their items oriented with role and permissions
  // const filteredNavItems = navItems
  //   .map((item) => {
  //     const hasSubItems = Array.isArray(item.items) && item.items.length > 0;

  //     const filteredItems = hasSubItems
  //       ? item.items.filter((subItem: any) => {
  //           // 🎯 Check permission OR role
  //           const hasPermissionAccess =
  //             !subItem.permission ||
  //             hasPermission(rolePermissions, subItem.permission);
  //           const hasRoleAccess = !subItem.role || subItem.role === userRole;

  //           return hasPermissionAccess && hasRoleAccess;
  //         })
  //       : item.items;

  //     return {
  //       ...item,
  //       items: filteredItems,
  //     };
  //   })
  //   .filter((item: any) => {
  //     const hasPermissionAccess =
  //       !item.permission || hasPermission(rolePermissions, item.permission);
  //     const hasRoleAccess = !item.role || item.role === userRole;

  //     const hasVisibleSubItems =
  //       !Array.isArray(item.items) || item.items.length >= 0;

  //     return hasPermissionAccess && hasRoleAccess && hasVisibleSubItems;
  //   });

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
