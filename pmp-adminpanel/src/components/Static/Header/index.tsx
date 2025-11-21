import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import assets from '@/assets/images';
import { useSelector } from 'react-redux';
import { ChevronDown } from 'lucide-react';
import { getItem } from '@/utils/storage';
import { logout } from '@/redux/features/authSlice';
import { useAppDispatch } from '@/redux/redux-hooks';
import { ASSET_BASE_URL } from '@/utils/constants';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

type Props = {
  customClass?: string;
};

export default function Header({ customClass }: Props) {
  const authState: any = useSelector((state: any) => state.authState);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const user: any = getItem('USER');
  const dispatch = useAppDispatch();
  const handleLogout = () => dispatch(logout());

  const name = user?.fname + ' ' + user?.lname || 'Admin';
  const role = user?.role.name == 'User' ? 'Tenant' : user?.role?.name || '';
  const email = user?.email || 'a2@gmail.com'; // replace with real email if available
  const initial = name?.trim()?.[0] ?? 'A';
  useEffect(() => {
    if (!authState.user) {
      setIsLogin(true);
    }
  });
  return (
    <header
      className={`absolute top-0 z-[111] w-full py-0 bg-neutral-400/20 backdrop-blur-[5px] ${
        customClass || ''
      }`}
    >
      <div className="max-w-full mx-auto px-10 max-lg:px-3">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img
                src={assets.images.darklogo}
                alt="Logo"
                className="w-[105px] h-[20px] object-contain max-lg:w-[90px] max-lg:h-[17px]"
                width={105}
                height={20}
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:block">
            <ul className="flex gap-8 items-center text-[20px] font-light text-primary max-lg:gap-5">
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/features"
                  className="hover:opacity-90 text-[18px] font-light max-lg:text-[16px]"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/pricing"
                  className="hover:opacity-90 text-[18px] font-light max-lg:text-[16px]"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/about-us"
                  className="hover:opacity-90 text-[18px] font-light max-lg:text-[16px]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => window.scrollTo(0, 0)}
                  to="/contact-us"
                  className="hover:opacity-90 text-[18px] font-light max-lg:text-[16px]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>

          {/* Desktop Login */}
          {isLogin ? (
            <div className="hidden md:flex items-center justify-end">
              <Link
                to="/admin-panel/auth/login"
                className="text-[18px] font-light no-underline text-primary border-[1px] border-solid border-primary px-6 py-2 rounded-lg max-lg:px-2 max-lg:py-1 hover:bg-primary-bg hover:text-white transition max-lg:outline-none "
              >
                Sign In
              </Link>
            </div>
          ) : (
            // <div className="hidden md:flex items-center justify-end">
            //   <Link
            //     to="/admin-panel/dashboard"
            //     className="text-[20px] font-light no-underline text-primary hover:underline"
            //   >
            //     Dashboard
            //   </Link>
            // </div>
            <>
              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group flex items-center gap-3 rounded-full  px-3 py-2 text-left max-lg:gap-1 max-md:absolute max-md:right-10 max-md:top-2   z-20">
                    <div className="grid h-9 w-9 place-items-center uppercase rounded-full bg-[#56C7A3] text-white text-xl font-semibold max-lg:h-8 max-lg:w-8 max-lg:text-[18px] max-lg:font-medium">
                        {initial}
                      </div>
                    <div className="hidden sm:block group-hover:opacity-50">
                      <div className="uppercase text-[#1b1b57] text-sm leading-tight mb-1 max-lg:hidden">
                        {name}
                      </div>
                      <div className="uppercase text-[#1b1b57]/70 text-xs leading-tight max-lg:hidden">
                        {role}
                      </div>
                    </div>
                    <ChevronDown className="text-[#1b1b57]  h-5 w-5 group-hover:opacity-70" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={12}
                  className="
                 max-[768px]:absolute max-[768px]:top-0 max-[768px]:right-[-40px] max-[768px]:z-50
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
                      className="px-4 py-3 rounded-xl cursor-pointer focus:bg-[#242460]/10 focus:text-[#242460] "
                    >
                      <Link
                        to="/admin-panel/dashboard"
                        className="flex items-center gap-3 text-[#242460]"
                      >
                        <img
                          src={assets.images.homeRento}
                          className="h-5 w-5"
                        />
                        {/* <User2 className="h-5 w-5" /> */}
                        <span className="font-semibold">View Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      asChild
                      className="px-4 py-3 rounded-xl cursor-pointer focus:bg-[#242460]/10 focus:text-[#242460]"
                    >
                      <Link
                        to="/pricing"
                        className="flex items-center gap-3 text-[#242460]"
                      >
                        <img
                          src={assets.images.tenantAssign}
                          className="h-5 w-5"
                        />
                        {/* <User2 className="h-5 w-5" /> */}
                        <span className="font-semibold">Subscriptions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="px-4 py-3 rounded-xl cursor-pointer focus:bg-[#242460]/10 focus:text-[#242460]  "
                    >
                      <Link
                        to="/admin-panel/profile"
                        className="flex items-center gap-3 text-[#242460]"
                      >
                        <img
                          src={assets.images.propManagers}
                          className="h-5 w-5"
                        />
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
            </>
          )}

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <span className="text-2xl">✖</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 border-t border-gray-200 py-5">
            <ul className="flex flex-col gap-4 text-[20px] font-light text-primary">
              <li>
                <Link to="/features" className="hover:opacity-90">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:opacity-90">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:opacity-90">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="hover:opacity-90">
                  Contact Us
                </Link>
              </li>
              {isLogin ? (
                <li>
                  <Link
                    to="/admin-panel/auth/login"
                    className="text-primary hover:underline"
                  >
                    Login
                  </Link>
                </li>
              ) : (
                ''
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
