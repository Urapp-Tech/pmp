import React, { useEffect, useRef, useState } from 'react';
import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import contact from '@/services/adminapp/static';
import { useForm } from 'react-hook-form';
import ReactLenis from 'lenis/react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ContactFields {
  email: string;
  phone: string;
  message: string; // <-- fixed (was "messsage")
  fname: string;
  lname: string;
  agree: boolean;
}

const Contact = () => {
  const [isLoader, setIsLoader] = useState(false);
  const { toast } = useToast();

  const [showHeader, setShowHeader] = useState(true);
  const lastYRef = useRef<number>(
    typeof window !== 'undefined' ? window.scrollY : 0
  );
  const tickingRef = useRef(false);

  const ToastHandler = (text: string, color = 'red') =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: color, color: 'white' },
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<ContactFields>({
    defaultValues: {
      email: '',
      phone: '',
      message: '',
      fname: '',
      lname: '',
      agree: false,
    },
    mode: 'onBlur',
  });

  // Final normalization + cross-field rules
  const validateContact = (raw: ContactFields) => {
    const data = {
      email: (raw.email || '').trim().replace(/\s+/g, ''),
      phone: (raw.phone || '').trim().replace(/\s+/g, ''),
      fname: (raw.fname || '').trim(),
      lname: (raw.lname || '').trim(),
      message: (raw.message || '').trim(),
      agree: !!raw.agree,
    };

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneDigits = data.phone.replace(/[^\d+]/g, '');
    const phoneRe = /^(?:\+?\d{1,3})?\d{7,14}$/;

    if (!data.fname || data.fname.length < 2)
      return { ok: false as const, msg: 'Please enter a valid first name.' };
    if (!data.lname || data.lname.length < 2)
      return { ok: false as const, msg: 'Please enter a valid last name.' };
    if (!data.email || !emailRe.test(data.email))
      return { ok: false as const, msg: 'Please enter a valid email address.' };
    if (!data.phone || !phoneRe.test(phoneDigits))
      return { ok: false as const, msg: 'Please enter a valid phone number.' };
    if (!data.message || data.message.length < 10)
      return {
        ok: false as const,
        msg: 'Message must be at least 10 characters.',
      };
    if (data.message.length > 2000)
      return {
        ok: false as const,
        msg: 'Message is too long (max 2000 characters).',
      };
    if (!data.agree)
      return {
        ok: false as const,
        msg: 'Please agree to receive communications.',
      };

    return { ok: true as const, data };
  };

  const onSubmit = async () => {
    const result = validateContact(getValues());
    if (!result.ok) {
      ToastHandler(result.msg);
      return;
    }

    const { data } = result;
    setIsLoader(true);
    try {
      const res = await contact.contactService({
        email: data.email,
        phone: data.phone,
        fname: data.fname,
        lname: data.lname,
        message: data.message,
      });
      console.log(res);

      if (res?.data?.success) {
        ToastHandler(res.data.message, 'green');
        reset(); // clear the form
      } else {
        ToastHandler(res?.data?.message || 'Something went wrong');
      }
    } catch (e: any) {
      ToastHandler(e?.message || 'Unexpected error');
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;

      if (Math.abs(dy) < 6) return;

      if (y < 64) {
        setShowHeader(true);
        lastYRef.current = y;
        return;
      }

      setShowHeader(dy <= 0);
      lastYRef.current = y;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        handle();
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slowScrollState = useRef({
    targetY: typeof window !== 'undefined' ? window.scrollY : 0,
    rafId: 0 as number | 0,
    animating: false,
    paused: false,
  });

  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const bgY = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, -120]);
  const reveal = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  useEffect(() => {
    const isHTMLElement = (el: any): el is HTMLElement =>
      el && typeof el === 'object' && 'closest' in el;

    const isManagedZone = (t: EventTarget | null) => {
      if (!isHTMLElement(t)) return false;
      return !!(t.closest(' ') || t.closest(''));
    };

    const stopAnimationIfRunning = () => {
      const st = slowScrollState.current;
      if (st.animating && st.rafId) {
        cancelAnimationFrame(st.rafId);
        st.rafId = 0;
        st.animating = false;
      }
    };

    const step = () => {
      const st = slowScrollState.current;
      if (st.paused) {
        stopAnimationIfRunning();
        return;
      }
      const { targetY } = st;
      const currentY = window.scrollY;
      const nextY = currentY + (targetY - currentY) * 0.12;
      window.scrollTo(0, nextY);

      if (Math.abs(targetY - nextY) > 0.5) {
        st.rafId = requestAnimationFrame(step);
        st.animating = true;
      } else {
        window.scrollTo(0, targetY);
        st.animating = false;
        if (st.rafId) cancelAnimationFrame(st.rafId);
        st.rafId = 0;
      }

      const onEnterManaged = () => {
        slowScrollState.current.paused = true;

        if (
          slowScrollState.current.animating &&
          slowScrollState.current.rafId
        ) {
          cancelAnimationFrame(slowScrollState.current.rafId);
          slowScrollState.current.rafId = 0;
          slowScrollState.current.animating = false;
        }
      };
      const onLeaveManaged = () => {
        slowScrollState.current.paused = false;
        slowScrollState.current.targetY = window.scrollY;
      };

      window.addEventListener(
        'rento:enterManaged',
        onEnterManaged as EventListener
      );
      window.addEventListener(
        'rento:leaveManaged',
        onLeaveManaged as EventListener
      );

      return () => {
        window.removeEventListener(
          'rento:enterManaged',
          onEnterManaged as EventListener
        );
        window.removeEventListener(
          'rento:leaveManaged',
          onLeaveManaged as EventListener
        );
      };
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented) return;

      if (isManagedZone(e.target)) {
        stopAnimationIfRunning();
        return;
      }

      if (slowScrollState.current.paused) return;

      e.preventDefault();

      const scale = 0.18;

      const dy = e.deltaY;
      const moderated = Math.sign(dy) * Math.min(Math.abs(dy), 140);

      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const viewport = window.innerHeight;

      const nextTarget = Math.max(
        0,
        Math.min(
          docHeight - viewport,
          slowScrollState.current.targetY + moderated * scale
        )
      );

      slowScrollState.current.targetY = nextTarget;

      if (!slowScrollState.current.animating) {
        slowScrollState.current.animating = true;
        slowScrollState.current.rafId = requestAnimationFrame(step);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    slowScrollState.current.targetY = window.scrollY;

    return () => {
      window.removeEventListener('wheel', onWheel as any);
      stopAnimationIfRunning();
    };
  }, []);

  return (
    <>
      <ReactLenis root />
      <div className="w-full relative bg-[#DFF4EC]">
        <motion.div
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: showHeader ? 0 : -90, opacity: showHeader ? 1 : 0.98 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-[1000] will-change-transform py-0"
        >
          <Header customClass="bg-white/80 backdrop-blur-xl shadow-sm py-0" />
        </motion.div>
        <div className="h-[62px]" />
        <motion.section
          ref={heroRef}
          className="relative h-[100vh] flex justify-start max-xl:h-[650px] max-[1260px]:flex-col   max-[1260px]:items-center  "
          style={{ y: bgY }}
        >
          <img
            src={assets.images.contactBanner}
            className="w-full h-[100vh] object-cover absolute top-0 z-1 max-[1260px]:h-[900px] max-[992px]:h-[650px] max-[992px]:object-right  max-md:object-center"
          />
          {/* <img
            src={assets.images.contactBanner}
            className="w-full max-w-full h-[540px] object-cover object-right absolute top-0 z-[-1] max-[992px]:object-bottom max-[992px]:opacity-[0.3] max-[768px]:object-right"
            alt="Contact Banner"
          /> */}
          <div className="relative h-full flex-1 flex w-full">
            <motion.div
              className="flex-1 flex absolute bottom-40 max-w-[1200px] gap-10 items-center justify-between px-4 max-xl:gap-y-1 max-[1260px]:flex-col max-[1260px]:items-start  "
              style={{ y: contentY }}
            >
              <motion.h1
                className="capitalize text-[95px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[40px]"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
              >
                Contact Us{' '}
              </motion.h1>
              <motion.p
                className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px] max-[768px]:text-[18px]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 1.0 }}
              >
                Let’s connect to make your property management smarter.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>
        <div className="w-full pb-10 bg-[#DFF4EC] px-5">
          <div className="max-w-[1700px] mr-auto">
            <motion.div {...reveal} className="w-full">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="p-10 mt-10 bg-[#DFF4EC] max-[768px]:px-5">
                  <div className="max-w-[923px] mx-auto bg-white rounded-[40px] p-8 shadow-sm">
                    {/* Email */}
                    <div className="mb-4">
                      <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full rounded-lg border font-light ${
                          errors.email ? 'border-red-400' : 'border-transparent'
                        } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.email
                            ? 'focus:ring-red-400'
                            : 'focus:ring-blue-400'
                        }`}
                        {...register('email', {
                          required: 'Email is required.',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                            message: 'Please enter a valid email address.',
                          },
                        })}
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* First Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        placeholder="Rashid"
                        className={`w-full rounded-lg border font-light ${
                          errors.fname ? 'border-red-400' : 'border-transparent'
                        } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.fname
                            ? 'focus:ring-red-400'
                            : 'focus:ring-blue-400'
                        }`}
                        {...register('fname', {
                          required: 'First name is required.',
                          minLength: {
                            value: 2,
                            message: 'Please enter a valid first name.',
                          },
                        })}
                        aria-invalid={!!errors.fname}
                      />
                      {errors.fname && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.fname.message}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="Hamad"
                        className={`w-full rounded-lg border font-light ${
                          errors.lname ? 'border-red-400' : 'border-transparent'
                        } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.lname
                            ? 'focus:ring-red-400'
                            : 'focus:ring-blue-400'
                        }`}
                        {...register('lname', {
                          required: 'Last name is required.',
                          minLength: {
                            value: 2,
                            message: 'Please enter a valid last name.',
                          },
                        })}
                        aria-invalid={!!errors.lname}
                      />
                      {errors.lname && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.lname.message}
                        </p>
                      )}
                    </div>

                    {/* Phone No */}
                    <div className="mb-4">
                      <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                        Phone No.
                      </label>
                      <input
                        type="tel"
                        placeholder="+971527992240"
                        className={`w-full rounded-lg border font-light ${
                          errors.phone ? 'border-red-400' : 'border-transparent'
                        } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? 'focus:ring-red-400'
                            : 'focus:ring-blue-400'
                        }`}
                        {...register('phone', {
                          required: 'Phone is required.',
                          validate: (v) =>
                            /^(?:\+?\d{1,3})?\d{7,14}$/.test(
                              (v || '').replace(/[^\d+]/g, '')
                            ) || 'Please enter a valid phone number.',
                        })}
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="mb-4">
                      <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                        Message
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Write a message"
                        className={`w-full rounded-lg border font-light ${
                          errors.message
                            ? 'border-red-400'
                            : 'border-transparent'
                        } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                          errors.message
                            ? 'focus:ring-red-400'
                            : 'focus:ring-blue-400'
                        }`}
                        {...register('message', {
                          required: 'Message is required.',
                          minLength: {
                            value: 10,
                            message: 'Message must be at least 10 characters.',
                          },
                          maxLength: {
                            value: 2000,
                            message:
                              'Message is too long (max 2000 characters).',
                          },
                        })}
                        aria-invalid={!!errors.message}
                      />
                      {errors.message && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center mb-6">
                      <input
                        id="agree"
                        type="checkbox"
                        className={`mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          errors.agree ? 'ring-1 ring-red-400' : ''
                        }`}
                        {...register('agree', {
                          validate: (v) =>
                            v || 'Please agree to receive communications.',
                        })}
                        aria-invalid={!!errors.agree}
                      />
                      <label
                        htmlFor="agree"
                        className="ml-2 text-xs text-gray-600"
                      >
                        I agree to receive other communications from Rento.
                      </label>
                    </div>
                    {errors.agree && (
                      <p className="mt-[-18px] mb-4 text-xs text-red-600">
                        {errors.agree.message as string}
                      </p>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoader}
                      className={cn(
                        'w-full rounded-md bg-gradient-to-r from-green-400 to-blue-600 py-3 text-white text-sm font-normal shadow-md hover:opacity-90 transition',
                        isLoader && 'opacity-70 cursor-not-allowed'
                      )}
                    >
                      {isLoader ? (
                        <span className="inline-flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              opacity="0.25"
                            />
                            <path
                              d="M22 12a10 10 0 00-10-10"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              opacity="0.75"
                            />
                          </svg>
                          Submitting…
                        </span>
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
