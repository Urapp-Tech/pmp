// TopBar.tsx
import assets from '@/assets/images';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { setCollapsedSidebar } from '@/redux/features/appSlice';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import { Link } from 'react-router-dom';
import { User2, LogOut } from 'lucide-react';
import { getItem } from '@/utils/storage';
import { logout } from '@/redux/features/authSlice';

type Props = { title?: string };

export const TopBar = ({ title }: Props) => {
  const user: any = getItem('USER');
  const dispatch = useAppDispatch();
  const collapsedSidebar = useAppSelector((s) => s.appState.collapsedSidebar);

  const handleLogout = () => dispatch(logout());

  const name = user?.name || 'Super Admin';
  const role = user?.roleName || 'SUPER ADMIN';
  const email = user?.email || 'a2@gmail.com'; // replace with real email if available
  const initial = name?.trim()?.[0] ?? 'A';

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center gap-3 bg-sidebar-background pr-4">
      <div className="flex items-center gap-3">
        {!collapsedSidebar && (
          <div className="text-white -ml-4">
            <img
              src={assets.images.companyIcon}
              className="h-6 w-auto object-contain"
            />
          </div>
        )}
        <SidebarTrigger
          onClick={() => dispatch(setCollapsedSidebar(!collapsedSidebar))}
          className="text-white"
        />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-3 rounded-full bg-white/10 px-3 py-2 text-left">
              <img
                src={assets.images.avatarBg}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <div className="text-white text-sm leading-tight">{name}</div>
                <div className="text-white/70 text-xs leading-tight">
                  {role}
                </div>
              </div>
              <svg
                className="ml-1 h-4 w-4 text-white/80 group-hover:text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.5 7.5l4.5 4.5 4.5-4.5" />
              </svg>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={12}
            className="
              p-0 min-w-[320px] rounded-3xl
              bg-white/60 backdrop-blur-md
              shadow-[0_8px_28px_rgba(0,0,0,0.18),-4px_4px_4px_rgba(0,0,0,0.25)]
              border border-white/70
            "
          >
            {/* header block */}
            <div className="px-6 pt-6 pb-4">
              <div className="mx-auto grid place-items-center gap-3">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-[#56C7A3] text-white text-2xl font-bold">
                  {initial}
                </div>
                <div className="text-center">
                  <div className="text-[#1b1b57] text-lg font-extrabold tracking-wide">
                    {name}
                  </div>
                  <div className="text-[#1b1b57]/70 text-xs font-semibold uppercase tracking-wide">
                    {email}
                  </div>
                </div>
              </div>
            </div>

            {/* divider (thin, centered like your mock) */}
            <div className="mx-6 h-px bg-[#242460]/40" />

            {/* actions */}
            <div className="px-2 py-2">
              <DropdownMenuItem
                asChild
                className="px-4 py-3 rounded-xl cursor-pointer focus:bg-[#242460]/10 focus:text-[#242460]"
              >
                <Link
                  to="/profile"
                  className="flex items-center gap-3 text-[#242460]"
                >
                  <img src={assets.images.propManagers} className="h-5 w-5" />
                  <span className="font-semibold">View Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl cursor-pointer focus:bg-[#242460]/10 focus:text-[#242460]"
              >
                <div className="flex items-center gap-3 text-[#242460]">
                  <img src={assets.images.signOut} className="h-5 w-5" />
                  <span className="font-semibold">Sign Out</span>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
