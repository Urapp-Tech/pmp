import { useForm } from 'react-hook-form';
import { useState } from 'react';
import contact from '@/services/adminapp/static';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import assets from '@/assets/images';
import { Loader } from 'lucide-react';

interface ContactFields {
  email: string;
  phone: string;
  message: string;
  fname: string;
  lname: string;
  agree: boolean;
}

export default function ContactResposiveSection() {
  const { toast } = useToast();
  const [isLoader, setIsLoader] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  const ToastHandler = (text: string, color = 'red') =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: color, color: 'white' },
    });

  const onSubmit = async (data: ContactFields) => {
    setIsLoader(true);
    try {
      const res = await contact.contactService({
        fname: data.fname,
        lname: data.lname,
        email: data.email,
        phone: data.phone,
        message: data.message,
      });

      if (res?.data?.success) {
        ToastHandler(res.data.message, 'green');
        reset();
      } else {
        ToastHandler(res?.data?.message || 'Something went wrong');
      }
    } catch (err: any) {
      ToastHandler(err?.message || 'Unexpected error');
    } finally {
      setIsLoader(false);
    }
  };

  return (
    <div className="my-10 p-5">
      <h3 className="text-center text-[28px] leading-tight text-primary font-normal mb-6">
        We're here to help.
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="p-3 rounded-md">
          {/* Name */}

          <div className="mb-4 flex-1">
            <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
              Name
            </label>
            <input
              type="text"
              placeholder="Rashid Hamad"
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

          <div className="mb-4 flex-1">
            <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Rashid Hamad"
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
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className={`w-full rounded-lg border font-light ${
                errors.email ? 'border-red-400' : 'border-transparent'
              } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 
              focus:outline-none focus:ring-2 ${
                errors.email ? 'focus:ring-red-400' : 'focus:ring-blue-400'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                  message: 'Enter a valid email',
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Phone No.
            </label>
            <input
              type="tel"
              placeholder="+971527992240"
              className={`w-full rounded-lg border font-light ${
                errors.phone ? 'border-red-400' : 'border-transparent'
              } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 
              focus:outline-none focus:ring-2 ${
                errors.phone ? 'focus:ring-red-400' : 'focus:ring-blue-400'
              }`}
              {...register('phone', {
                required: 'Phone required',
                validate: (v) =>
                  /^(?:\+?\d{1,3})?\d{7,14}$/.test(
                    (v || '').replace(/[^\d+]/g, '')
                  ) || 'Invalid phone number',
              })}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">
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
              placeholder="write a message"
              className={`w-full rounded-lg border font-light ${
                errors.message ? 'border-red-400' : 'border-transparent'
              } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 
              focus:outline-none focus:ring-2 ${
                errors.message ? 'focus:ring-red-400' : 'focus:ring-blue-400'
              }`}
              {...register('message', {
                required: 'Message required',
                minLength: { value: 10, message: 'Minimum 10 characters' },
              })}
            ></textarea>
            {errors.message && (
              <p className="text-xs text-red-500 mt-1">
                {errors.message.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500 text-center flex items-center justify-center"
        >
          {isLoader ? <Loader className="animate-spin" /> : 'Submit'}
        </button>
      </form>

      <div className="mx-auto mt-4">
        <img
          src={assets.images.phoneBanner}
          alt="banner"
          className="max-w-full object-contain h-full w-full"
        />
      </div>
    </div>
  );
}
