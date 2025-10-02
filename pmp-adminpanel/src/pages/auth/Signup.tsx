import { useState, useMemo } from 'react';
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

import authService from '@/services/adminapp/admin'; // must expose signupService
import { getItem } from '@/utils/storage';
import { handleErrorMessage } from '@/utils/helper';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import assets from '@/assets/images';

interface SignupFields {
  fname: string;
  lname: string;
  gender: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
// intl-ish: +CCC + 7–14 digits total
const phoneRe = /^(?:\+?\d{1,3})?\d{7,14}$/;
// Strip non-digits; if +965******** hai to last ke local 8 digits nikalo
const toLocalKWT8 = (v: string) => {
  const d = (v || '').replace(/\D/g, '');
  if (d.startsWith('965') && d.length >= 11) return d.slice(-8); // keep last 8
  return d;
};

// 8 digits, starts with 9/6/5/4
const kw8Re = /^[9654]\d{7}$/;
const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  // configs (optional roleId pick)
  const localSysConfig: any = getItem('SYSTEM_CONFIG');
  const systemConfig = useSelector(
    (state: any) => state.authState.systemConfig
  );

  // Try to get landlord role id if your API requires it
  const landlordRoleId = useMemo<string | undefined>(() => {
    return (
      systemConfig?.roles?.landlord?.id ||
      localSysConfig?.roles?.landlord?.id ||
      localSysConfig?.LANDLORD_ROLE_ID ||
      undefined
    );
  }, [systemConfig, localSysConfig]);

  const ToastHandler = (text: string, color = 'red') =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 z-[9999] flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: color, color: 'white' },
    });

  const [pwVisible, setPwVisible] = useState(false);
  const [cpwVisible, setCpwVisible] = useState(false);
  const [isLoader, setIsLoader] = useState(false);

  const form = useForm<SignupFields>({
    defaultValues: {
      fname: '',
      lname: '',
      gender: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = form;

  const passwordValue = watch('password');

  const onSubmit = async (data: SignupFields) => {
    // normalize + validate again (defensive)
    const payload = {
      fname: data.fname.trim(),
      lname: data.lname.trim(),
      gender: data.gender.trim(),
      phone: data.phone.trim().replace(/\s+/g, ''),
      email: data.email.trim().replace(/\s+/g, ''),
      password: data.password,
      // optionally include roleId if available
      ...(landlordRoleId ? { roleId: landlordRoleId } : {}),
    };

    if (payload.fname.length < 2)
      return ToastHandler('Please enter a valid first name.');
    if (payload.lname.length < 2)
      return ToastHandler('Please enter a valid last name.');
    if (!emailRe.test(payload.email))
      return ToastHandler('Please enter a valid email address.');
    // if (!phoneRe.test(payload.phone.replace(/[^\d+]/g, '')))
    //   return ToastHandler('Phone number must start with 9, 6, 5, or 4 and be exactly 8 digits long.');
    if (payload.password.length < 8)
      return ToastHandler('Password must be at least 8 characters.');
    if (!payload.gender) return ToastHandler('Please select your gender.');

    setIsLoader(true);
    try {
      // POST landlord-users/create
      const res = await authService.signupService(payload);
      if (res?.data?.success) {
        ToastHandler(
          'Your Account has been created successfully! please wait for admin approval.',
          'green'
        );
        navigate('/');
        // If your API returns tokens/user, you can auto-login; else comment out:
        const { tenantConfig, ...rest } = res.data.data ?? {};
        if (rest) dispatch(login(rest));
        if (tenantConfig) dispatch(setShopTenantState(tenantConfig));

        reset();
      } else {
        ToastHandler('Something went wrong.');
      }
    } catch (err: any) {
      ToastHandler(handleErrorMessage(err));
    } finally {
      setIsLoader(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* background image */}
      <img
        src={assets.images.authBg}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* overlay */}
      <div className="absolute inset-0 bg-[#0B1437]/20" />

      {/* frame */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-between px-6 md:px-10">
        {/* LEFT */}
        <div className="hidden w-full max-w-[520px] md:block">
          <div className="mb-10">
            <img
              src={assets.images.whiteCompLogo}
              alt="logo"
              className="h-[40px] w-[210px] object-contain"
            />
          </div>
          <h1 className="font-semibold leading-tight text-dialogBg [font-size:48px] md:[font-size:56px]">
            Create your
            <br /> Rento Account
          </h1>
          <p className="mt-4 max-w-[420px] text-white/80">
            Start managing properties smarter. Sign up in seconds.
          </p>
        </div>

        {/* RIGHT */}
        <div className="w-full max-w-[520px]">
          <div className="rounded-3xl min-h-[620px] border border-white/20 bg-white/50 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="mb-6 text-center mt-6">
              <h2 className="text-3xl font-semibold text-primary-bg">
                Sign up
              </h2>
            </div>

            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel className="text-base font-medium text-primary-bg">
                      First name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Faisal"
                        className="mt-2 h-12 rounded-xl border-0 bg-white/50 shadow-sm placeholder:text-primary-bg/40 focus-visible:ring-0"
                        {...register('fname', {
                          required: 'First name is required.',
                          minLength: {
                            value: 2,
                            message: 'Please enter a valid first name.',
                          },
                        })}
                      />
                    </FormControl>
                    {errors.fname && (
                      <FormMessage>*{errors.fname.message}</FormMessage>
                    )}
                  </FormItem>

                  <FormItem>
                    <FormLabel className="text-base font-medium text-primary-bg">
                      Last name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Hamad"
                        className="mt-2 h-12 rounded-xl border-0 bg-white/50 shadow-sm placeholder:text-primary-bg/40 focus-visible:ring-0"
                        {...register('lname', {
                          required: 'Last name is required.',
                          minLength: {
                            value: 2,
                            message: 'Please enter a valid last name.',
                          },
                        })}
                      />
                    </FormControl>
                    {errors.lname && (
                      <FormMessage>*{errors.lname.message}</FormMessage>
                    )}
                  </FormItem>
                </div>

                {/* Email */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="urapptech@gmail.com"
                      className="mt-2 h-12 rounded-xl border-0 bg-white/50 shadow-sm placeholder:text-primary-bg/40 focus-visible:ring-0"
                      {...register('email', {
                        required: 'Email is required.',
                        pattern: {
                          value: emailRe,
                          message: 'Please enter a valid email address.',
                        },
                      })}
                    />
                  </FormControl>
                  {errors.email && (
                    <FormMessage>*{errors.email.message}</FormMessage>
                  )}
                </FormItem>

                {/* Phone & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel className="text-base font-medium text-primary-bg">
                      Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="5xxxxxxx"
                        inputMode="numeric"
                        className="mt-2 h-12 rounded-xl border-0 bg-white/50 shadow-sm placeholder:text-primary-bg/40 focus-visible:ring-0"
                        {...register('phone', {
                          required: 'Phone is required.',
                          validate: (v) =>
                            kw8Re.test(toLocalKWT8(v)) ||
                            'Phone number must start with 9, 6, 5, or 4 and be exactly 8 digits long.',
                        })}
                      />
                    </FormControl>
                    {errors.phone && (
                      <FormMessage>*{errors.phone.message}</FormMessage>
                    )}
                  </FormItem>

                  <FormItem>
                    <FormLabel className="text-base font-medium text-primary-bg">
                      Gender
                    </FormLabel>
                    <FormControl>
                      <select
                        className="mt-2 h-12 w-full rounded-xl border-0 bg-white/50 px-3 shadow-sm text-sm text-primary-bg focus-visible:ring-0"
                        {...register('gender', {
                          required: 'Please select your gender.',
                        })}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    {errors.gender && (
                      <FormMessage>*{errors.gender.message}</FormMessage>
                    )}
                  </FormItem>
                </div>

                {/* Password */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    Password
                  </FormLabel>
                  <div className="relative mt-2">
                    <Input
                      placeholder="⋆⋆⋆⋆⋆⋆⋆⋆⋆"
                      type={pwVisible ? 'text' : 'password'}
                      className="h-12 rounded-xl border-0 bg-white/50 pr-12 shadow-sm placeholder:text-primary-bg/40 focus-visible:ring-0"
                      {...register('password', {
                        required: 'Password is required.',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters.',
                        },
                      })}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setPwVisible((s) => !s)}
                      className="absolute right-1 top-1.5 h-9 w-9 rounded-full bg-transparent hover:bg-transparent text-primary-bg"
                    >
                      {pwVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                  </div>
                  {errors.password && (
                    <FormMessage>*{errors.password.message}</FormMessage>
                  )}
                </FormItem>

                {/* Confirm Password */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    Confirm Password
                  </FormLabel>
                  <div className="relative mt-2">
                    <Input
                      placeholder="⋆⋆⋆⋆⋆⋆⋆⋆⋆"
                      type={cpwVisible ? 'text' : 'password'}
                      className="h-12 rounded-xl border-0 bg-white/50 pr-12 shadow-sm placeholder:text-primary-bg/40 focus-visible:ring-0"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password.',
                        validate: (v) =>
                          v === passwordValue || 'Passwords do not match.',
                      })}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setCpwVisible((s) => !s)}
                      className="absolute right-1 top-1.5 h-9 w-9 rounded-full bg-transparent hover:bg-transparent text-primary-bg"
                    >
                      {cpwVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <FormMessage>*{errors.confirmPassword.message}</FormMessage>
                  )}
                </FormItem>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!!isLoader}
                  className="mt-1 h-12 w-full rounded-xl bg-secondary-bg text-primary-bg hover:bg-scrollbar font-semibold"
                >
                  {isLoader && <Loader2 className="mr-2 animate-spin" />}
                  Create account
                </Button>

                {/* Footer link */}
                <p className="text-center text-xs text-primary-bg font-semibold">
                  Already have an account?{' '}
                  <NavLink to="../login" className="text-dialogBg">
                    Log in
                  </NavLink>
                </p>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
