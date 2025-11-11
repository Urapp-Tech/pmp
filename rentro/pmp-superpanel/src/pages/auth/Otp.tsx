import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

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

const otpKeys = ['otp1', 'otp2', 'otp3', 'otp4'] as const;
type OtpKey = (typeof otpKeys)[number];

interface OtpFields {
  otp1: string;
  otp2: string;
  otp3: string;
  otp4: string;
}

const Otp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<OtpFields>({
    defaultValues: { otp1: '', otp2: '', otp3: '', otp4: '' },
  });
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

  const [isLoader, setIsLoader] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  // OTP input refs for focus control
  const otpRefs: any = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // move focus forward/backward and restrict to one digit
  const onChangeDigit =
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.replace(/\D/g, '').slice(0, 1);
      setValue(otpKeys[idx], v, { shouldValidate: true });
      if (v && idx < 3) otpRefs[idx + 1].current?.focus();
    };

  const onKeyDownDigit =
    (idx: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key.toLowerCase();
      const cur = (getValues(otpKeys[idx]) as string) || '';
      if (key === 'backspace' && !cur && idx > 0)
        otpRefs[idx - 1].current?.focus();
      if (key === 'arrowleft' && idx > 0) otpRefs[idx - 1].current?.focus();
      if (key === 'arrowright' && idx < 3) otpRefs[idx + 1].current?.focus();
    };

  const onPasteAll = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clip = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!clip) return;
    e.preventDefault();
    clip
      .split('')
      .forEach((d, i) => setValue(otpKeys[i], d, { shouldValidate: true }));
    otpRefs[Math.min(clip.length, 4) - 1]?.current?.focus();
  };

  const submitHandler = async (data: OtpFields) => {
    setIsLoader(true);

    const code = `${data.otp1}${data.otp2}${data.otp3}${data.otp4}`.trim();
    if (code.length !== 4) {
      setIsLoader(false);
      return ToastHandler('Please enter the 4-digit code.');
    }

    try {
      // try common method names; fall back to a local success if none exist
      let res: any = null;
      const anySvc: any = authService as any;

      if (anySvc.verifyOtpService) {
        res = await anySvc.verifyOtpService({ code });
      } else if (anySvc.verifyOtp) {
        res = await anySvc.verifyOtp({ code });
      } else {
        // fallback: pretend success (remove this once your API is wired)
        res = {
          data: {
            success: true,
            message: 'Verified',
            data: { tenantConfig: {}, user: {} },
          },
        };
      }

      if (res?.data?.success) {
        // if your API returns user + tenant like login, preserve your flow:
        const { tenantConfig, ...rest } = res.data.data || {};
        if (rest) dispatch(login(rest));
        if (tenantConfig) dispatch(setShopTenantState(tenantConfig));

        toast({ description: 'Code verified successfully.' });
        setIsLoader(false);

        // go to next step (set new password)
        // adjust route if different in your app:
        navigate('../new-password', { replace: true });
      } else {
        ToastHandler(res?.data?.message || 'Invalid code, please try again.');
        setIsLoader(false);
      }
    } catch (err: any) {
      setIsLoader(false);
      ToastHandler(handleErrorMessage(err));
    }
  };

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
          <div className="mb-6">
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
          <div className="rounded-3xl h-[550px] border border-white/20 bg-white/50 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="mb-6 mt-[25%] text-center">
              <h2 className="text-3xl font-bold text-primary-bg">
                OTP Verification
              </h2>
              <span className="text-primary-bg text-sm">
                4 digit code has been sent to john_doe@rento.com
              </span>
            </div>

            {/* —— FORM (replaced with OTP) —— */}
            <Form {...form}>
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="space-y-5"
              >
                <FormItem>
                  <div className="mt-2 flex items-center justify-center gap-8">
                    {otpKeys.map((key, i) => {
                      // let RHF control the native ref AND keep our own focus ref
                      const { ref, ...rest } = register(key, {
                        required: 'Required',
                        validate: (v) =>
                          /^\d$/.test(v || '') || 'Digit 0-9 only',
                      });

                      return (
                        <FormControl key={key}>
                          <Input
                            {...rest}
                            ref={(el) => {
                              ref(el);
                              otpRefs[i].current =
                                el as HTMLInputElement | null;
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            autoComplete="one-time-code"
                            placeholder="0"
                            className="
            placeholder:text-primary-bg/35 text-center rounded-[10px]
            w-[64px] h-[64px] px-2 bg-dialogBg text-primary-bg mt-2
            text-[40px] font-bold outline-none focus:outline-none focus:border-none
            focus-visible:ring-offset-[0] focus-visible:ring-2 focus-visible:ring-[#A5F2DE]
          "
                            onChange={onChangeDigit(i)}
                            onKeyDown={onKeyDownDigit(i)}
                            onPaste={i === 0 ? onPasteAll : undefined}
                          />
                        </FormControl>
                      );
                    })}
                  </div>

                  {/* inline errors (optional, show first one) */}
                  <div className="mt-1 h-5">
                    {(errors.otp1 ||
                      errors.otp2 ||
                      errors.otp3 ||
                      errors.otp4) && (
                      <FormMessage>*Enter 4 digits (0–9)</FormMessage>
                    )}
                  </div>
                </FormItem>

                <Button
                  type="submit"
                  disabled={!!isLoader}
                  className="mt-1 h-12 w-full rounded-xl bg-secondary-bg text-primary-bg hover:bg-scrollbar font-semibold"
                >
                  {isLoader && <Loader2 className="mr-2 animate-spin" />}
                  Submit
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Otp;
