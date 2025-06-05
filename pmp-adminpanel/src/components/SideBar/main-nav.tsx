'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const [openCollapsibles, setOpenCollapsibles] = useState<Set<string>>(
    new Set()
  );
  const [openSubItemUrl, setOpenSubItemUrl] = useState<string>('');
  const handleToggleCollapsible = (url: string) => {
    setOpenCollapsibles((prevState) => {
      const newState = new Set(prevState);
      if (newState.has(url)) {
        newState.delete(url);
      } else {
        newState.add(url);
      }
      return newState;
    });
  };

  const handleSubItemClick = (url: string) => {
    const parentUrlTitle = ['Dashboard', 'Cabins'];
    if (parentUrlTitle.includes(url)) {
      setOpenSubItemUrl('');
    } else {
      setOpenSubItemUrl(url);
    }
    setOpenSubItemUrl(url);
  };
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item: any) => (
          <SidebarMenuItem className="my-1" key={item.title}>
            {/* If there are no sub-items, just show the button */}
            {item.items && item.items.length === 0 ? (
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <img src={item.icon} />}
                {/* <span>{item.title}</span> */}
                <NavLink
                  key={item.url}
                  to={item.url}
                  onClick={() => handleSubItemClick(item.title)}
                  className={({ isActive }) =>
                    `${isActive ? 'text-quinary-bg text-[12px] font-semibold' : ''}`
                  }
                >
                  <span className="text-mars-bg font-medium ">
                    {item.title}
                  </span>
                </NavLink>
              </SidebarMenuButton>
            ) : (
              <Collapsible
                open={openCollapsibles.has(item.title)}
                onOpenChange={() => handleToggleCollapsible(item.title)}
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <img src={item.icon} />}
                    {/* {item.icon && <item.icon />} */}
                    {/* <span>{item.title}</span> */}
                    <NavLink
                      key={item.url}
                      to={item.url}
                      // className={({ isActive }) =>
                      //   `${isActive ? 'text-blue-900 font-bold' : ''}`
                      // }
                    >
                      <span className="text-mars-bg">{item.title}</span>
                    </NavLink>
                    <ChevronRight className="ml-auto text-white transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {/* Render child items if available */}
                {item.items && item.items.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem: any) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink
                              key={subItem.url}
                              to={subItem.url}
                              onClick={() => handleSubItemClick(subItem.title)}
                              className={`${openSubItemUrl === subItem.title ? 'text-blue-900 font-bold' : ''}`}
                            >
                              <span className="text-mars-bg">
                                {subItem.title}
                              </span>
                            </NavLink>
                            {/* <a href={subItem.url}>
                            </a> */}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </Collapsible>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
