'use client';
import { ChevronsUpDown, LogOut, User2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Facebook,
  Instagram,
  PhoneCall,
  Linkedin,
  Loader2,
  Twitter,
  Youtube,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/features/authSlice';
import { NavLink } from 'react-router';
import assets from '@/assets/images';

export function FooterNavUser({
  user,
  media,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  media: any;
}) {
  const { isMobile } = useSidebar();
  const dispatch = useDispatch();

  const handleSocialLinks = () => {
    const socialMediaMap = {
      facebook: <Facebook size={20} />,
      instagram: <Instagram size={20} />,
      twitter: <Twitter size={20} />,
      whatsapp: <PhoneCall size={20} />,
      linkedin: <Linkedin size={20} />,
      youtube: <Youtube size={20} />,
    };
    const logosToShow = [];
    for (const [key, logo] of Object.entries(socialMediaMap)) {
      if (media?.[key]) {
        logosToShow.push(logo);
      }
    }
    if (logosToShow.length === 0) {
      console.log('No social media links found');
      return null;
    }
    return (
      <div className="flex gap-2 p-1">
        {logosToShow?.map((logo, index) => (
          <span key={index} className="cursor-pointer">
            {logo}
          </span>
        ))}
      </div>
    );
  };

  const handleLogout = () => dispatch(logout());

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton tooltip="setting">
          <img src={assets.images.settingSidebarIcon} />
          <NavLink
            to={'/admin/settings'}
            className={({ isActive }) =>
              `${isActive ? 'text-quinary-bg text-[12px] font-semibold' : ''}`
            }
          >
            <span className="text-mars-bg font-medium ">Setting</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem onClick={() => handleLogout()}>
        <SidebarMenuButton tooltip="logout">
          <img src={assets.images.logoutSidebarIcon} />
          {/* <NavLink
            onClick={() => handleLogout()}
            className={({ isActive }) =>
              `${isActive ? 'text-quinary-bg text-[12px] font-semibold' : ''}`
            }
          > */}
          <span className="text-mars-bg font-medium ">Logout</span>
          {/* </NavLink> */}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
