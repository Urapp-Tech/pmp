import assets from '@/assets/images';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

export default function SuccessPage() {
  const navigate = useNavigate();
  return (
    <div className="w-full m-auto">
      <div className="m-auto">
        <div className="w-full max-w-[528px] min-h-[476px] mx-auto  p-[30px] rounded-[20px]">
          <div className="w-full max-w-[122px] h-[40px] mx-auto">
            <img
              src={assets.images.companyIcon}
              alt="login avatar"
              className="w-full max-w-full h-full object-contain"
            />{' '}
          </div>
          <div className=" max-w-[242px] mx-auto mt-[100px] mb-10">
            <h1 className="text-[48px] font-semibold capitalize text-center leading-[normal] mb-4 text-primary-bg">
              Payment Success
            </h1>
          </div>
          <div className="flex capitalize text-primary-bg items-center justify-center">
            payment has been successfully made
          </div>
          <div className="mt-8 w-full ">
            <Button
              className="w-full p-0 py-2 text-quinary-bg bg-primary-bg/75 h-[60px] text-[16px] font-semibold  rounded-[20px]"
              color="inherit"
              onClick={() => navigate(`/admin-panel/dashboard`)}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
