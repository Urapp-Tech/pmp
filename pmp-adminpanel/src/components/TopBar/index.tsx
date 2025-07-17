import assets from '@/assets/images';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink } from 'react-router';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { getItem } from '@/utils/storage';
import { ASSET_BASE_URL } from '@/utils/constants';

type Props = {
  title?: string;
};

export const TopBar = ({ title }: Props) => {
  const user: any = getItem('USER');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <header className="bg-[#1b46e0] w-full fixed top-0 left-0 z-50 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="w-full fixed top-0 left-0 flex">
        <div className="flex items-center gap-2 px-4 w-[50%] justify-center">
          <SidebarTrigger className="-ml-1 hidden max-[767.98px]:block" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 hidden max-[767.98px]:block"
          />
          {/* {title} */}
        </div>
        <div className="flex gap-4 w-[50%] justify-end pr-6 pt-2 relative">
          <NavLink to="">
            <div className="w-[45px] h-[45px]">
              <img
                src={assets.images.notifyIcon}
                alt="icon"
                className="w-full h-full object-contain"
              />
            </div>
          </NavLink>
          <div className="relative">
            <div
              onClick={toggleDropdown}
              className="w-[45px] h-[45px] cursor-pointer"
            >
              <img
                src={
                  user?.profilePic
                    ? ASSET_BASE_URL + user?.profilePic
                    : assets.images.avatarIcon
                }
                alt="icon"
                className="w-full h-full object-contain rounded-full border border-white"
              />
            </div>

            {dropdownOpen && (
              <div
                className={cn(
                  'absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-50 transition-all duration-200',
                  dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                )}
              >
                <NavLink
                  to="/admin-panel/profile"
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-5 h-5" /> View Profile
                </NavLink>
                {/* <NavLink
                  to="/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </NavLink>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    // handle logout here
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
