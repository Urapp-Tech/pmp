import * as React from 'react';
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
import { ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

type NavItem = {
  title: string;
  url: string;
  icon?: string; // image src
  isActive?: boolean;
  items?: { title: string; url: string }[];
};

export function NavMain({ items }: { items: NavItem[] }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Treat "/admin-panel" as "/admin-panel/dashboard" for initial active state
  const effectivePath = useMemo(() => {
    const p = location.pathname.replace(/\/+$/, '');
    if (p === '/admin-panel') return '/admin-panel/dashboard';
    return p || '/admin-panel/dashboard';
  }, [location.pathname]);

  const isParentActive = (item: NavItem) => {
    const matchSelf =
      item.url === effectivePath || effectivePath.startsWith(item.url + '/');
    if (!item.items || item.items.length === 0) return matchSelf;

    const matchChild = item.items.some(
      (s) => s.url === effectivePath || effectivePath.startsWith(s.url + '/')
    );
    return matchSelf || matchChild;
  };

  // Open any collapsible that is active on load
  const [openCollapsibles, setOpenCollapsibles] = useState<Set<string>>(() => {
    const s = new Set<string>();
    items.forEach((it) => {
      if (isParentActive(it)) s.add(it.title);
    });
    return s;
  });

  const handleToggleCollapsible = (title: string) => {
    setOpenCollapsibles((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  // Shared classes to ensure identical hover/active visuals
  const rowBase =
    'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition';
  const hoverActive =
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground';
  const labelCls = 'truncate font-light';
  const iconCls = 'shrink-0 w-4 h-4';

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const parentActive = isParentActive(item);
          const isOpen = openCollapsibles.has(item.title) || parentActive;

          // ----- No children: simple link -----
          if (!item.items || item.items.length === 0) {
            const thisActive =
              parentActive ||
              item.url === effectivePath ||
              effectivePath.startsWith(item.url + '/');

            return (
              <SidebarMenuItem className="my-1" key={item.title}>
                <SidebarMenuButton
                  asChild
                  data-active={thisActive ? 'true' : undefined}
                  className={`${rowBase} ${hoverActive}`}
                >
                  <NavLink to={item.url}>
                    {item.icon && (
                      <img src={item.icon} alt="" className={iconCls} />
                    )}
                    <span className={labelCls}>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // ----- With children: collapsible + parent row -----
          return (
            <SidebarMenuItem className="my-1" key={item.title}>
              <div className="group/collapsible">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => handleToggleCollapsible(item.title)}
                  className="w-full"
                >
                  {/* Trigger row: clicking label navigates, chevron toggles */}
                  <div className="flex items-center">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        asChild
                        data-active={parentActive ? 'true' : undefined}
                        className={`${rowBase} ${hoverActive}`}
                      >
                        <NavLink
                          to={item.url}
                          onClick={() => {
                            // Ensure parent gets active style immediately
                            if (!isOpen) handleToggleCollapsible(item.title);
                            navigate(item.url);
                          }}
                        >
                          {item.icon && (
                            <img src={item.icon} alt="" className={iconCls} />
                          )}
                          <span className={labelCls}>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {/* Chevron: only toggles open/close, does not navigate */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleCollapsible(item.title);
                      }}
                      className="ml-auto mr-2 inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-sidebar-accent/60"
                      aria-label="Toggle"
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Children */}
                  <CollapsibleContent>
                    <SidebarMenuSub className="mt-1 pl-2">
                      {item.items.map((sub) => {
                        const subActive =
                          sub.url === effectivePath ||
                          effectivePath.startsWith(sub.url + '/');

                        return (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              asChild
                              data-active={subActive ? 'true' : undefined}
                              className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition
            text-sidebar-accent
            hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground`}
                            >
                              <NavLink to={sub.url}>
                                <span className={labelCls}>{sub.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
