// TopBar.tsx
import assets from '@/assets/images';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { setCollapsedSidebar } from '@/redux/features/appSlice';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import { Link, useNavigate } from 'react-router-dom';
import { User2, LogOut, ChevronDown } from 'lucide-react';
import { getItem } from '@/utils/storage';
import { logout } from '@/redux/features/authSlice';
import { ASSET_BASE_URL } from '@/utils/constants';

type Props = { title?: string };

export const TopBar = ({ title }: Props) => {
  const user: any = getItem('USER');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const collapsedSidebar = useAppSelector((s) => s.appState.collapsedSidebar);

  const handleLogout = () => dispatch(logout());

  const name = user?.fname + ' ' + user?.lname || 'Admin';
  const role = user?.role.name == 'User' ? 'Tenant' : user?.role?.name || '';
  const email = user?.email || 'a2@gmail.com'; // replace with real email if available
  const initial = name?.trim()?.[0] ?? 'A';

  return (
    <header className="sticky top-0 z-50 flex h-20 items-center gap-3 bg-sidebar-background pr-4">
      <div className="flex items-center gap-3">
        {!collapsedSidebar && (
          <div className="text-white -ml-4">
            <img
              onClick={() => navigate('/')}
              src={assets.images.companyIcon}
              className="h-6 w-auto object-contain cursor-pointer"
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
            <button className="group flex items-center gap-3 rounded-full  px-3 py-2 text-left">
              <img
                src={
                  user?.profilePic
                    ? ASSET_BASE_URL + user?.profilePic
                    : assets.images.avatarBg
                }
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:block group-hover:opacity-50">
                <div className="uppercase text-white text-sm leading-tight mb-1">
                  {name}
                </div>
                <div className="uppercase text-xs leading-tight text-sidebar-accent-foreground">
                  {role}
                </div>
              </div>
              <ChevronDown className="text-white h-8 w-8 group-hover:opacity-50" />
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
                <div className="grid h-16 w-16 place-items-center uppercase rounded-full bg-[#56C7A3] text-white text-2xl font-bold">
                  {initial}
                </div>
                <div className="text-center">
                  <div className="text-[#1b1b57] uppercase text-lg font-semibold tracking-wide">
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
                  to="/admin-panel/profile"
                  className="flex items-center gap-3 text-[#242460]"
                >
                  <img src={assets.images.propManagers} className="h-5 w-5" />
                  {/* <User2 className="h-5 w-5" /> */}
                  <span className="font-semibold">View Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl cursor-pointer focus:bg-[#242460]/10 focus:text-[#242460]"
              >
                <div className="flex items-center gap-3 text-[#242460]">
                  <img src={assets.images.signOut} className="h-5 w-5" />
                  {/* <LogOut className="h-5 w-5" /> */}
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
