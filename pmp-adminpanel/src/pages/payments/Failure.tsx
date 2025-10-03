import assets from '@/assets/images';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

export default function FailurePage() {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <div className="m-auto">
        <div className="w-full max-w-[528px] min-h-[476px] mx-auto  p-[30px] rounded-[20px] sign-bg-wrap">
          <div className="w-full max-w-[122px] h-[40px] mx-auto">
            <img
              src={assets.images.companyIcon}
              alt="login avatar"
              className="w-full max-w-full h-full object-contain"
            />{' '}
          </div>
          <div className=" max-w-[242px] mx-auto mt-[100px] mb-10">
            <h1 className="text-[48px] font-semibold capitalize text-center leading-[normal] mb-4 text-primary-bg">
              Payment Failed
            </h1>
          </div>
          <div className="flex capitalize items-center text-primary-bg justify-center">
            payment Failed due to some reason
          </div>
          <div className="mt-8 w-full ">
            <Button
              className="btn-black-fill w-full p-0 py-2 text-quinary-bg bg-primary-bg/75 h-[60px] text-[16px] font-semibold rounded-[20px]"
              color="inherit"
              title="Login"
              onClick={() => navigate(-1)}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
