import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useAppDispatch } from '@/redux/redux-hooks';
import { login } from '@/redux/features/authSlice';
import { setShopTenantState } from '@/redux/features/appSlice';

import authService from '@/services/adminapp/admin';
import { getItem } from '@/utils/storage';
import { handleErrorMessage } from '@/utils/helper';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import assets from '@/assets/images';

interface LoginFields {
  email: string;
  password: string;
}

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<LoginFields>();
  const dispatch = useAppDispatch();

  // keep your existing config pulls
  const localSysConfig: any = getItem('SYSTEM_CONFIG');
  const systemConfig = useSelector(
    (state: any) => state.authState.systemConfig
  );

  const ToastHandler = (text: string) =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: 'red', color: 'white' },
    });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const submitHandler = async (data: LoginFields) => {
    setIsLoader(true);
    const userData = {
      email: data.email.trim().replace(/\s+/g, ''),
    };
    try {
      const user = await authService.forgetPassword(userData);
      if (user.data.success) {
        console.log(user.data.data);

        setIsLoader(false);
        navigate('/admin-panel/auth/otp', { state: userData.email });
        // (optional) remember me handling (persist on your side if needed)
      } else {
        ToastHandler(user.data.message);
        setIsLoader(false);
      }
    } catch (err: any) {
      setIsLoader(false);
      ToastHandler(handleErrorMessage(err));
    }
  };

  const togglePasswordVisibility = () => setPasswordVisible((s) => !s);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* background image */}
      <img
        src={assets.images.authBgTwo}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* subtle overlay to match mock tone */}
      <div className="absolute inset-0 bg-[#0B1437]/20" />

      {/* page frame */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-between px-6 md:px-10">
        {/* LEFT: logo + hero text */}
        <div className="hidden w-full max-w-[520px] md:block">
          <div className="mb-10">
            <img
              src={assets.images.whiteCompLogo /* (image two: white logo) */}
              alt="logo"
              className="h-[40px] w-[210px] object-contain"
            />
          </div>

          <h1 className="font-semibold leading-tight text-dialogBg [font-size:48px] md:[font-size:56px]">
            Quick recovery.
            <br /> Simple steps.
          </h1>
        </div>

        {/* RIGHT: glass card */}
        <div className="w-full max-w-[500px]">
          <div
            className="
              rounded-3xl h-[550px] border border-white/20 bg-white/50 p-6 shadow-2xl backdrop-blur-xl
              md:p-8
            "
          >
            <div className="mb-6 text-center mt-[25%]">
              <h2 className="text-3xl font-semibold text-primary-bg">
                Forgot Password
              </h2>
              <span className="text-primary-bg text-sm">
                Enter registered email to receive password reset link
              </span>
            </div>

            <Form {...form}>
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="space-y-5"
              >
                {/* Email */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="text"
                      placeholder="example@gmail.com"
                      className="
                        mt-2 h-12 rounded-xl border-0 outline-none bg-white/50 shadow-sm
                        placeholder:text-primary-bg/40 focus-visible:ring-0 focus-visible:ring-offset-0
                      "
                      {...register('email', {
                        required: 'Please enter your email or phone.',
                      })}
                    />
                  </FormControl>
                  {errors.email && (
                    <FormMessage>*{errors.email.message}</FormMessage>
                  )}
                </FormItem>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!!isLoader}
                  className="
                    mt-1 h-12 w-full rounded-xl bg-secondary-bg text-primary-bg hover:bg-scrollbar
                    font-semibold
                  "
                >
                  {isLoader && <Loader2 className="mr-2 animate-spin" />}
                  Get Code
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
