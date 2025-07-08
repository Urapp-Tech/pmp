import assets from '@/assets/images';
import { Button } from '@/components/ui/button';

export default function FailurePage() {
  return (
    <div className="bg-wrap w-full">
      <div className="flex items-center">
        <div className="max-w-[695px] h-full">
          <img
            src={assets.images.signBanner}
            alt="banner"
            className="w-full max-w-full h-full object-contain"
          />
        </div>
        <div className="w-full max-w-[528px] min-h-[476px] mx-auto  p-[30px] bg-quinary-bg rounded-[20px] sign-bg-wrap">
          <div className="w-full max-w-[122px] h-[40px] mx-auto">
            {/* <img
              src={assets.images.mainLogo}
              alt="login avatar"
              className="w-full max-w-full h-full object-contain"
            /> */}{' '}
            PMP - LOGO
          </div>
          <div className=" max-w-[242px] mx-auto mt-[100px] mb-10">
            <h1 className="text-[48px] font-semibold capitalize text-center leading-[normal] mb-4 text-tertiary-bg">
              Payment Failed
            </h1>
          </div>
          <div className="flex capitalize items-center justify-center">
            payment Failed due to some reason
          </div>
          <div className="mt-8 w-full ">
            <Button
              className="btn-black-fill w-full p-0 py-2 text-quinary-bg bg-secondary-bg/75 h-[60px] text-[16px] font-semibold hover:bg-secondary-bg rounded-[20px]"
              color="inherit"
              title="Login"
              type="submit"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
