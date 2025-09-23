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
                    `${isActive ? 'text-white text-[12px] mx-2 font-semibold' : 'text-[12px] mx-2 text-white'}`
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
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="p-0 bg-transparent"
                  >
                    <NavLink
                      key={item.url}
                      to={item.url}
                      className={[
                        'group flex items-center gap-3 rounded-xl px-3 py-3 mx-2 my-2',
                        'transition-all duration-150',
                        'text-white/80 hover:text-white',
                        'hover:bg-white/10 hover:ring-1 hover:ring-white/10 hover:translate-x-[2px]',
                        openCollapsibles.has(item.title)
                          ? 'bg-white/10 ring-1 ring-white/15 text-white'
                          : '',
                      ].join(' ')}
                    >
                      {item.icon && (
                        <img
                          src={item.icon}
                          className="h-6 w-6 opacity-90 group-hover:opacity-100"
                        />
                      )}
                      <span className="text-sm font-medium tracking-wide">
                        {item.title}
                      </span>

                      <ChevronRight className="ml-auto h-4 w-4 text-white/80 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </NavLink>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {/* Render child items if available */}
                {item.items && item.items.length > 0 && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem: any) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="p-0 bg-transparent"
                          >
                            <NavLink
                              key={subItem.url}
                              to={subItem.url}
                              onClick={() => handleSubItemClick(subItem.title)}
                              className={({ isActive }) =>
                                [
                                  'group flex items-center gap-2 rounded-lg px-3 py-2 mx-4 my-1',
                                  'transition-all duration-150',
                                  'text-white/75 hover:text-white',
                                  'hover:bg-white/10 hover:ring-1 hover:ring-white/10 hover:translate-x-[2px]',
                                  isActive
                                    ? 'bg-white/10 ring-1 ring-white/15 text-white'
                                    : '',
                                ].join(' ')
                              }
                            >
                              <span className="text-sm">{subItem.title}</span>
                            </NavLink>
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
