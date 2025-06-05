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

export function MainSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const authState: any = useSelector((state: any) => state.authState);
  const appState: any = useSelector((state: any) => state.appState);
  const shop: any = getItem('SHOP_TENANT');
  const { logo, media } = appState;
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
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: assets.images.dashboardSidebarIcon,
        items: [],
      },
      {
        title: 'Users',
        url: '/admin/users/employees',
        icon: assets.images.usersSidebarIcon,
        items: [],
      },
      {
        title: 'Admin Users',
        url: '/admin/users/admin-users',
        icon: assets.images.adminUsersSidebarIcon,
        items: [],
      },
      {
        title: 'Roles & permissions',
        url: '/admin/role-permissions',
        icon: assets.images.rolePermissionsSidebarIcon,
        items: [],
      },
      {
        title: 'Blogs',
        url: '/admin/blogs',
        icon: assets.images.rolePermissionsSidebarIcon,
        items: [],
      },
      {
        title: 'Pages',
        url: '/admin/pages',
        icon: assets.images.pagesSidebarIcon,
        items: [],
      },
      {
        title: 'Help & Feedback',
        url: '/admin/feedback',
        icon: assets.images.helpFeedbackSidebarIcon,
        items: [],
      },
      {
        title: 'Notifications',
        url: '/admin/notifications',
        icon: assets.images.notificationSidebarIcon,
        items: [],
      },
      {
        title: 'Reports',
        url: '/admin/reports',
        icon: assets.images.reportSidebarIcon,
        items: [
          {
            title: 'Operational',
            url: '/admin/operational',
          },
        ],
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
    <Sidebar className="bg-transparent" collapsible="icon" {...props}>
      <SidebarHeader className=" flex items-center justify-center mt-0 mb-2  bg-[#1b46e0]">
        <div className="max-w-[110px] ml-5 mr-auto mt-2 py-3">
          <img
            src={assets.images.whiteLogo}
            className="max-w-full w-full h-full object-contain"
          />
        </div>
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
