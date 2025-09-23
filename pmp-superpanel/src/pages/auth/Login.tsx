// import { useToast } from '@/hooks/use-toast';
// import { cn } from '@/lib/utils';
// import { useState } from 'react';
// import { button } from '@/components/ui/button';
import { setShopTenantState } from '@/redux/features/appSlice';
import { login } from '@/redux/features/authSlice';
import { useAppDispatch } from '@/redux/redux-hooks';
import authService from '@/services/adminapp/admin';
import { getItem } from '@/utils/storage';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
// import { button } from '@/components/ui/button';
import assets from '@/assets/images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavLink } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { Button } from '@/components/ui/button';
// import authService from '@/services/adminapp/admin';
// import { login } from '@/redux/features/authSlice';
// import { useAppDispatch } from '@/redux/redux-hooks';
// import { setShopTenantState } from '@/redux/features/appSlice';
// import { useSelector } from 'react-redux';
// import { getItem } from '@/utils/storage';

interface LoginFields {
  email: string;
  password: string;
}

const Login = () => {
  const { toast } = useToast();
  const form = useForm<LoginFields>();
  const dispatch = useAppDispatch();
  const localSysConfig: any = getItem('SYSTEM_CONFIG');
  const systemConfig = useSelector(
    (state: any) => state.authState.systemConfig
  );

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: {
        backgroundColor: 'red',
        color: 'white',
      },
    });
  };
  // console.log('🚀 ~ Login ~ systemConfig:', systemConfig);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [remember, setRemember] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const loginHandler = async (data: LoginFields) => {
    setIsLoader(true);
    const userData = {
      email: data.email.trim().replace(/\s+/g, ''),
      password: data.password,
    };
    try {
      const user = await authService.loginService(userData);
      // console.log('user', user.data);

      if (user.data.success) {
        setIsLoader(false);
        const { tenantConfig, ...rest } = user.data.data;
        dispatch(login(rest));
        dispatch(setShopTenantState(tenantConfig));
      } else {
        ToastHandler(user.data.message);
        setIsLoader(false);
      }
    } catch (err: Error | any) {
      setIsLoader(false);
      ToastHandler(err?.response?.data?.message);
      // console.log('🚀 ~ loginHandler ~ error:', err?.response?.data?.message);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* background image */}
      <img
        src={assets.images.authBg}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* subtle overlay to match mock tone */}
      <div className="absolute inset-0 bg-[#0B1437]/20" />

      {/* page frame */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-between px-6 md:px-10">
        {/* LEFT: logo + hero text */}
        <div className="hidden w-full max-w-[520px] md:block">
          <div className="mb-6">
            <img
              src={assets.images.whiteCompLogo /* (image two: white logo) */}
              alt="logo"
              className="h-[40px] w-[210px] object-contain"
            />
          </div>

          <h1 className="font-bold leading-tight text-dialogBg [font-size:48px] md:[font-size:56px]">
            Your Gateway
            <br /> to Smarter
            <br /> Rentals
          </h1>

          <p className="mt-4 max-w-[420px] text-white/80">
            Where smart property management begins. Log in and elevate your
            workflow.
          </p>
        </div>

        {/* RIGHT: glass card */}
        <div className="w-full max-w-[500px]">
          <div
            className="
              rounded-3xl h-[550px] border border-white/20 bg-white/50 p-6 shadow-2xl backdrop-blur-xl
              md:p-8
            "
          >
            <div className="mb-6 text-center mt-12">
              <h2 className="text-3xl font-bold text-primary-bg">Sign-in</h2>
            </div>

            <Form {...form}>
              <form onSubmit={handleSubmit(loginHandler)} className="space-y-5">
                {/* Email */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="text"
                      placeholder="urapptech@gmail.com"
                      className="
                        mt-2 h-12 rounded-xl border-0 outline-none bg-white/50 shadow-sm
                        placeholder:text-primary-bg focus-visible:ring-0 focus-visible:ring-offset-0
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

                {/* Password */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    Password
                  </FormLabel>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      placeholder="⋆⋆⋆⋆⋆⋆⋆⋆⋆"
                      type={passwordVisible ? 'text' : 'password'}
                      className="
                        h-12 rounded-xl border-0 bg-white/50 pr-12 shadow-sm
                        placeholder:text-primary-bg focus-visible:ring-[#A5F2DE] focus-visible:ring-0 focus-visible:ring-offset-0
                      "
                      {...register('password', {
                        required: 'Please enter your password.',
                      })}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-1 top-1.5 h-9 w-9 rounded-full bg-transparent hover:bg-transparent text-primary-bg"
                    >
                      {passwordVisible ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <FormMessage>*{errors.password.message}</FormMessage>
                  )}
                </FormItem>

                {/* Remember + Reset */}
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center font-medium gap-2 text-sm text-[#1E2130]">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-primary-bg text-primary-bg focus:ring-primary-bg"
                    />
                    Remember me
                  </label>

                  <NavLink
                    to="../forgot-password"
                    className="text-sm text-primary-bg font-bold"
                  >
                    Reset Password?
                  </NavLink>
                </div>

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
                  Log in
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
