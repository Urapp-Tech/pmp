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
          <div className=" max-w-[242px] mx-auto mt-[100px] mb-5">
            <h1 className="text-[48px] font-semibold capitalize text-center leading-[normal] mb-4 text-tertiary-bg">
              sign in
            </h1>
            <p className="text-[10px] leading-normal text-center font-normal text-quaternary-bg">
              By signing in, you agree to our{' '}
              <NavLink to="" className="font-semibold text-tertiary-bg">
                Privacy Policy
              </NavLink>{' '}
              and{' '}
              <NavLink to="" className="font-semibold text-tertiary-bg">
                Terms and Conditions
              </NavLink>
            </p>
          </div>
          <div className="">
            <Form {...form}>
              <form onSubmit={handleSubmit(loginHandler)}>
                <div className="">
                  <div className="form-group w-full">
                    <FormLabel
                      htmlFor="password"
                      className="text-[14px] font-medium ml-1 text-tertiary-bg"
                    >
                      Email / Phone
                    </FormLabel>
                    <FormControl className="m-1 w-full">
                      <div className="mb-2">
                        <Input
                          className="rounded-[20px] h-[60px] px-2 bg-primary-bg text-secondary-bg mt-2 text-[14px] font-medium outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[0] focus-visible:ring-0"
                          id="email"
                          placeholder="Enter email or phone"
                          type="text"
                          {...register('email', {
                            required: 'Please enter your email or phone.',
                          })}
                          //   disableUnderline
                        />
                        {errors.email && (
                          <FormMessage>*{errors.email.message}</FormMessage>
                        )}
                      </div>
                    </FormControl>
                  </div>
                  <div className="form-group w-full">
                    <FormItem>
                      <FormLabel
                        htmlFor="password"
                        className="text-[14px] font-medium ml-1 text-tertiary-bg"
                      >
                        Password
                      </FormLabel>
                      {/* <FormControl> */}
                      <div className="relative">
                        <Input
                          id="password"
                          placeholder="********"
                          type={passwordVisible ? 'text' : 'password'}
                          className="h-[60px] px-2 bg-primary-bg text-secondary-bg mt-2 text-[14px] font-medium outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[0] focus-visible:ring-0 rounded-[20px]"
                          {...register('password', {
                            required: 'Please enter your password.',
                          })}
                        />
                        <Button
                          variant="ghost"
                          type="button"
                          className="bg-transparent absolute inset-y-0 top-[6px] right-[6px] flex items-center pr-3 hover:bg-primary-bg"
                          onClick={togglePasswordVisibility}
                        >
                          {passwordVisible ? (
                            <EyeOff color="black" />
                          ) : (
                            <Eye color="black" />
                          )}
                        </Button>
                        {errors.password && (
                          <FormMessage>*{errors.password.message}</FormMessage>
                        )}
                      </div>
                      {/* </FormControl> */}
                    </FormItem>
                  </div>
                  <div className="form-group text-end">
                    <NavLink
                      className="font-open-sans text-[12px] font-medium text-tertiary-bg hover:underline"
                      to="../forgot-password"
                    >
                      Forget Password?
                    </NavLink>
                  </div>
                  <div className="mt-8 w-full ">
                    <Button
                      disabled={!!isLoader}
                      className="btn-black-fill w-full bg-primary p-0 py-2 text-quinary-bg bg-secondary-bg/75 h-[60px] text-[16px] font-semibold hover:bg-secondary-bg rounded-[20px]"
                      color="inherit"
                      title="Login"
                      type="submit"
                    >
                      {isLoader && <Loader2 className="animate-spin" />}
                      {'Login'}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* {notification && (
              <Notify
                isOpen
                setIsOpen={hideNotification}
                displayMessage={notification}
              />
            )} */}
      </div>
    </div>
    // <>
    //   <div className='bg-wrap w-full'>
    //     <div className='max-w-[795px] h-[889px]'>
    //       <img src={assets.images.signBanner} alt='banner' className='w-full max-w-full h-full object-contain' />
    //     </div>
    //     <div className='max-w-[528px] min-h-[776px]'>
    //       <div className='w-[122px] h-[40px]'>
    //         <img src={assets.images.mainLogo} alt='logo' />
    //       </div>
    //     </div>
    //   </div>
    // </>
  );
};

export default Login;
