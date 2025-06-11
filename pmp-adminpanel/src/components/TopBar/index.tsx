import assets from '@/assets/images';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink } from 'react-router';

type Props = {
  title?: string;
};

export const TopBar = ({ title }: Props) => {
  return (
    <header className=" bg-[#1b46e0] w-full fixed top-0 left-50 z-50 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className='w-full fixed top-0 left-0 flex'>
        <div className="flex items-center gap-2 px-4 w-[50%] justify-center">
          <SidebarTrigger className="-ml-1 hidden max-[767.98px]:block" />
          <Separator orientation="vertical" className="mr-2 h-4 hidden max-[767.98px]:block" />
          {/* {title} */}

        </div>
        <div className='flex gap-4 w-[50%] justify-end pr-6 pt-2'>
          <NavLink to=''>
            <div className='w-[45px] h-[45px]'>
              <img src={assets.images.notifyIcon} alt='icon' className='w-full h-full object-contain' />
            </div>
          </NavLink>
          <NavLink to=''>
            <div className='w-[45px] h-[45px]'>
              <img src={assets.images.avatarIcon} alt='icon' className='w-full h-full object-contain' />
            </div>
          </NavLink>
        </div>
      </div>

    </header>
  );
};
