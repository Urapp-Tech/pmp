import React, { useEffect, useState } from 'react';
import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import contact from '@/services/adminapp/static';
import { useForm } from 'react-hook-form';

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

  return (
    <div>
      <Header />

      {/* Banner */}
      <div className="h-[540px] flex justify-start max-[1260px]:items-center">
        <img
          src={assets.images.contactBanner}
          className="w-full max-w-full h-[540px] object-cover object-right absolute top-0 z-[-1] max-[992px]:object-bottom max-[992px]:opacity-[0.3] max-[768px]:object-right"
          alt="Contact Banner"
        />
        <div className="relative h-full flex-1 flex">
          <div className="flex-1 flex absolute bottom-5 gap-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <h1 className="capitalize mr-10 text-[100px] font-normal leading-tight text-primary max-[1260px]:text-[50px] max-[1024px]:text-[50px] max-[768px]:text-[34px]">
              Contact Us
            </h1>
            <p className="max-w-[593px] font-light text-[24px] text-primary max-[1024px]:text-[20px] max-[768px]:text-[18px]">
              Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et
              nulla a eu netus libero
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="p-10 bg-[#DFF4EC] max-[768px]:px-5">
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
                  errors.email ? 'focus:ring-red-400' : 'focus:ring-blue-400'
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
                  errors.fname ? 'focus:ring-red-400' : 'focus:ring-blue-400'
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
                  errors.lname ? 'focus:ring-red-400' : 'focus:ring-blue-400'
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
                  errors.phone ? 'focus:ring-red-400' : 'focus:ring-blue-400'
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
                  errors.message ? 'border-red-400' : 'border-transparent'
                } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                  errors.message ? 'focus:ring-red-400' : 'focus:ring-blue-400'
                }`}
                {...register('message', {
                  required: 'Message is required.',
                  minLength: {
                    value: 10,
                    message: 'Message must be at least 10 characters.',
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Message is too long (max 2000 characters).',
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
              <label htmlFor="agree" className="ml-2 text-xs text-gray-600">
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

      <Footer />
    </div>
  );
};

export default Contact;
