import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
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

import authService from '@/services/adminapp/admin';
import { handleErrorMessage } from '@/utils/helper';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import assets from '@/assets/images';

interface LoginFields {
  password: string;
  confirmPassword: string;
}

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

const NewPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state } = useLocation(); // expecting email string in state
  const form = useForm<LoginFields>();

  const ToastHandler = (text: string) =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: 'red', color: 'white' },
    });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [isLoader, setIsLoader] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = form;

  // revalidate confirmPassword any time password changes
  useEffect(() => {
    const sub = watch((_values, { name }) => {
      if (name === 'password') trigger('confirmPassword');
    });
    return () => sub.unsubscribe();
  }, [watch, trigger]);

  const submitHandler = async (data: LoginFields) => {
    setIsLoader(true);

    // guard: must match
    if (data.password !== data.confirmPassword) {
      setIsLoader(false);
      ToastHandler('Passwords do not match.');
      return;
    }

    console.log('state', state);

    const rawEmail = typeof state === 'string' ? state : (state as any) || '';
    const email = rawEmail?.toString().trim().replace(/\s+/g, '');

    try {
      const user = await authService.newPassword({
        email,
        password: data.password,
      });
      if (user.data.success) {
        setIsLoader(false);
        navigate('/admin-panel/auth/login');
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
  const toggleNewPasswordVisibility = () => setNewPasswordVisible((s) => !s);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* background image */}
      <img
        src={assets.images.authBgTwo}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* subtle overlay */}
      <div className="absolute inset-0 bg-[#0B1437]/20" />

      {/* page frame */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] items-center justify-between px-6 md:px-10">
        {/* LEFT: logo + hero text */}
        <div className="hidden w-full max-w-[520px] md:block">
          <div className="mb-10">
            <img
              src={assets.images.whiteCompLogo}
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
                Set Password
              </h2>
              <span className="text-primary-bg text-sm">
                Enter New Password
              </span>
            </div>

            <Form {...form}>
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="space-y-5"
              >
                {/* New Password */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    New Password
                  </FormLabel>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      placeholder="⋆⋆⋆⋆⋆⋆⋆⋆⋆"
                      type={passwordVisible ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="
                        h-12 rounded-xl border-0 bg-white/50 pr-12 shadow-sm
                        placeholder:text-primary-bg/40 focus-visible:ring-[#A5F2DE]
                        focus-visible:ring-0 focus-visible:ring-offset-0
                      "
                      {...register('password', {
                        required: 'Please enter your password.',
                        pattern: {
                          value: PASSWORD_RULE,
                          message:
                            'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
                        },
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

                {/* Confirm Password */}
                <FormItem>
                  <FormLabel className="text-base font-medium text-primary-bg">
                    Confirm Password
                  </FormLabel>
                  <div className="relative mt-2">
                    <Input
                      id="confirmPassword"
                      placeholder="⋆⋆⋆⋆⋆⋆⋆⋆⋆"
                      type={newPasswordVisible ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="
                        h-12 rounded-xl border-0 bg-white/50 pr-12 shadow-sm
                        placeholder:text-primary-bg/40 focus-visible:ring-[#A5F2DE]
                        focus-visible:ring-0 focus-visible:ring-offset-0
                      "
                      {...register('confirmPassword', {
                        // required: 'Please confirm your password.',
                        validate: (val) =>
                          val === watch('password') ||
                          'Passwords do not match.',
                      })}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={toggleNewPasswordVisibility}
                      className="absolute right-1 top-1.5 h-9 w-9 rounded-full bg-transparent hover:bg-transparent text-primary-bg"
                    >
                      {newPasswordVisible ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
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
                  className="
                    mt-1 h-12 w-full rounded-xl bg-secondary-bg text-primary-bg hover:bg-scrollbar
                    font-semibold
                  "
                >
                  {isLoader && <Loader2 className="mr-2 animate-spin" />}
                  Save
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
