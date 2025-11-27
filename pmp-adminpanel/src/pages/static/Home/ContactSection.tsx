// import assets from '@/assets/images';
// import { useToast } from '@/hooks/use-toast';
// import { cn } from '@/lib/utils';
// import contact from '@/services/adminapp/static';
// import { motion } from 'framer-motion';
// import { Loader } from 'lucide-react';
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';

// interface ContactFields {
//   email: string;
//   phone: string;
//   message: string;
//   fname: string;
//   lname: string;
//   agree: boolean;
// }
// function ContactSection() {
//   const { toast } = useToast();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//   } = useForm<ContactFields>({
//     defaultValues: {
//       email: '',
//       phone: '',
//       message: '',
//       fname: '',
//       lname: '',
//       agree: false,
//     },
//     mode: 'onBlur',
//   });
//   const [isLoader, setIsLoader] = useState(false);

//   const onSubmit = async (data: any) => {
//     setIsLoader(true);
//     try {
//       const res = await contact.contactService({
//         email: data.email,
//         phone: data.phone,
//         fname: data.fname,
//         lname: data.lname,
//         message: data.message,
//       });
//       console.log(res);

//       if (res?.data?.success) {
//         setIsLoader(false);
//         ToastHandler(res.data.message, 'green');
//         reset(); // clear the form
//       } else {
//         setIsLoader(false);
//         ToastHandler(res?.data?.message || 'Something went wrong');
//       }
//     } catch (e: any) {
//       setIsLoader(false);
//       ToastHandler(e?.message || 'Unexpected error');
//     } finally {
//       setIsLoader(false);
//     }
//   };
//   const ToastHandler = (text: string, color = 'red') =>
//     toast({
//       description: text,
//       className: cn(
//         'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
//       ),
//       style: { backgroundColor: color, color: 'white' },
//     });
//   return (
//     <motion.section
//       id="contact"
//       key="new-slide-section"
//       className="relative w-full min-h-screen bg-[#DFF4EC] flex flex-col items-center justify-center overflow-hidden"
//       initial={{ y: '100%' }}
//       animate={{ y: 0 }}
//       exit={{ y: '-100%' }}
//       transition={{ duration: 0.8, ease: 'easeInOut' }}
//     >
//       <motion.h2
//         className="text-primary font-normal top-10  left-1/2 -translate-x-1/2 text-[70px] mb-4 leading-normal text-center max-[1540px]:top-5 max-[1440px]:text-[30px] min-w-full"
//         initial={{ y: -100, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: -100, opacity: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut' }}
//       >
//         We’re here to help.
//       </motion.h2>
//       <motion.div
//         className="w-[95%] max-w-[1840px] bg-white pt-2 pb-4 rounded-3xl px-5 mt-15 max-[1260px]:bg-[#DFF4EC] max-[1260px]:shadow-2xl"
//         initial={{ y: 300, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: 300, opacity: 0 }}
//         transition={{ duration: 0.8, ease: 'easeInOut' }}
//       >
//         <form onSubmit={handleSubmit(onSubmit)} noValidate>
//           <div className="flex items-center justify-center h-full gap-3 pt-3 pb-3 relative z-11">
//             <div className="flex-1">
//               <div className="flex gap-3">
//                 <div className="mb-4 flex-1">
//                   <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
//                     Name
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Rashid Hamad"
//                     className={`w-full rounded-lg border font-light ${
//                       errors.fname ? 'border-red-400' : 'border-transparent'
//                     } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
//                       errors.fname
//                         ? 'focus:ring-red-400'
//                         : 'focus:ring-blue-400'
//                     }`}
//                     {...register('fname', {
//                       required: 'First name is required.',
//                       minLength: {
//                         value: 2,
//                         message: 'Please enter a valid first name.',
//                       },
//                     })}
//                     aria-invalid={!!errors.fname}
//                   />
//                   {errors.fname && (
//                     <p className="mt-1 text-xs text-red-600">
//                       {errors.fname.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="mb-4 flex-1">
//                   <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
//                     Last Name
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Rashid Hamad"
//                     className={`w-full rounded-lg border font-light ${
//                       errors.lname ? 'border-red-400' : 'border-transparent'
//                     } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
//                       errors.lname
//                         ? 'focus:ring-red-400'
//                         : 'focus:ring-blue-400'
//                     }`}
//                     {...register('lname', {
//                       required: 'Last name is required.',
//                       minLength: {
//                         value: 2,
//                         message: 'Please enter a valid last name.',
//                       },
//                     })}
//                     aria-invalid={!!errors.lname}
//                   />
//                   {errors.lname && (
//                     <p className="mt-1 text-xs text-red-600">
//                       {errors.lname.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4 flex gap-3">
//                 <div className="mb-4 flex-1">
//                   <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     placeholder="Faisal Khamees"
//                     className={`w-full rounded-lg border font-light ${
//                       errors.email ? 'border-red-400' : 'border-transparent'
//                     } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
//                       errors.email
//                         ? 'focus:ring-red-400'
//                         : 'focus:ring-blue-400'
//                     }`}
//                     {...register('email', {
//                       required: 'Email is required.',
//                       pattern: {
//                         value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
//                         message: 'Please enter a valid email address.',
//                       },
//                     })}
//                     aria-invalid={!!errors.email}
//                   />
//                   {errors.email && (
//                     <p className="mt-1 text-xs text-red-600">
//                       {errors.email.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="mb-4 flex-1">
//                   <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
//                     Phone No.
//                   </label>
//                   <input
//                     type="tel"
//                     placeholder="+971527992240"
//                     className={`w-full rounded-lg border font-light ${
//                       errors.phone ? 'border-red-400' : 'border-transparent'
//                     } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
//                       errors.phone
//                         ? 'focus:ring-red-400'
//                         : 'focus:ring-blue-400'
//                     }`}
//                     {...register('phone', {
//                       required: 'Phone is required.',
//                       validate: (v) =>
//                         /^(?:\+?\d{1,3})?\d{7,14}$/.test(
//                           (v || '').replace(/[^\d+]/g, '')
//                         ) || 'Please enter a valid phone number.',
//                     })}
//                     aria-invalid={!!errors.phone}
//                   />
//                   {errors.phone && (
//                     <p className="mt-1 text-xs text-red-600">
//                       {errors.phone.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="mb-4">
//                 <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
//                   Message
//                 </label>
//                 <textarea
//                   rows={4}
//                   placeholder="write a message"
//                   className={`w-full rounded-lg border font-light ${
//                     errors.message ? 'border-red-400' : 'border-transparent'
//                   } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
//                     errors.message
//                       ? 'focus:ring-red-400'
//                       : 'focus:ring-blue-400'
//                   }`}
//                   {...register('message', {
//                     required: 'Message is required.',
//                     minLength: {
//                       value: 10,
//                       message: 'Message must be at least 10 characters.',
//                     },
//                     maxLength: {
//                       value: 2000,
//                       message: 'Message is too long (max 2000 characters).',
//                     },
//                   })}
//                   aria-invalid={!!errors.message}
//                 />
//                 {errors.message && (
//                   <p className="mt-1 text-xs text-red-600">
//                     {errors.message.message}
//                   </p>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00D494] to-[#00B5E2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
//               >
//                 {isLoader ? (
//                   <div className="flex items-center justify-center">
//                     <Loader />
//                   </div>
//                 ) : (
//                   'Submit'
//                 )}
//               </button>
//             </div>

//             <div className="flex-1 max-w-full h-full w-full max-[1260px]:absolute max-[1260px]:top-0 max-[1260px]:z-[-1]">
//               <img
//                 src={assets.images.phoneBanner}
//                 alt="banner"
//                 className="w-full h-full max-[1260px]:object-contain max-[1260px]:opacity-40 max-w-full"
//               />
//             </div>
//           </div>
//         </form>
//         <ul className="flex justify-between items-start  text-primary text-[14px] pb-3">
//           <li className="flex items-center gap-2 text-primary">
//             <img
//               src={assets.images.locationIcon}
//               alt="icon"
//               className="w-[28px] h-[28px] icn"
//             />
//             Kuwait
//           </li>
//           <li className="flex items-center gap-2 text-primary">
//             <img
//               src={assets.images.phoneIcon}
//               alt="icon"
//               className="w-[28px] h-[28px] icn "
//             />
//             +965 94051232
//           </li>
//           <li className="flex items-center gap-2 text-primary">
//             <img
//               src={assets.images.mailIcon}
//               alt="icon"
//               className="w-[28px] h-[28px] icn"
//             />
//             aljaser@rento.online
//           </li>
//         </ul>
//       </motion.div>
//     </motion.section>
//   );
// }

// export default ContactSection;

import assets from '@/assets/images';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import contact from '@/services/adminapp/static';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

interface ContactFields {
  email: string;
  phone: string;
  message: string;
  fname: string;
  lname: string;
  agree: boolean;
}
function ContactSection() {
  const { toast } = useToast();
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
  const [isLoader, setIsLoader] = useState(false);

  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 80%', 'end 20%'], // smooth enter & exit
  });

  //
  // SMOOTH heading animation
  //
  const headingY = useTransform(scrollYProgress, [0, 1], ['20%', '0%']);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  //
  // SMOOTH container animation
  //
  const boxY = useTransform(scrollYProgress, [0.1, 1], ['20%', '0%']);
  const boxOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);

  const onSubmit = async (data: ContactFields) => {
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
        setIsLoader(false);
        ToastHandler(res.data.message, 'green');
        reset(); // clear the form
      } else {
        setIsLoader(false);
        ToastHandler(res?.data?.message || 'Something went wrong');
      }
    } catch (e: any) {
      setIsLoader(false);
      ToastHandler(e?.message || 'Unexpected error');
    } finally {
      setIsLoader(false);
    }
  };
  const ToastHandler = (text: string, color = 'red') =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: color, color: 'white' },
    });
  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-[#DFF4EC] flex flex-col items-center justify-start overflow-hidden"
    >
      <motion.h2
        className="text-primary font-normal mt-20 text-[70px] text-center"
        style={{
          y: headingY,
          opacity: headingOpacity,
        }}
      >
        We’re here to help.
      </motion.h2>
      <motion.div
        className="w-[95%] max-w-[1840px] bg-white pt-2 pb-4 mb-[90px] rounded-3xl px-5  max-[1260px]:bg-[#DFF4EC] max-[1260px]:shadow-2xl"
        style={{
          y: boxY,
          opacity: boxOpacity,
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex items-center justify-center h-full gap-3 pt-3 pb-3 relative z-11">
            <div className="flex-1">

              <div className="mb-4 flex gap-3">
                <div className="mb-4 flex-1">
                  <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Faisal Khamees"
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

                <div className="mb-4 flex-1">
                  <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
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
              </div>

              <div className="mb-4">
                <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="write a message"
                  className={`w-full rounded-lg border font-light ${
                    errors.message ? 'border-red-400' : 'border-transparent'
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

              <button
                type="submit"
                className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00D494] to-[#00B5E2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
              >
                {isLoader ? (
                  <div className="flex items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>

            <div className="flex-1 max-w-full h-full w-full max-[1260px]:absolute max-[1260px]:top-0 max-[1260px]:z-[-1]">
              <img
                src={assets.images.phoneBanner}
                alt="banner"
                className="w-full h-full max-[1260px]:object-contain max-[1260px]:opacity-40 max-w-full"
              />
            </div>
          </div>
        </form>
        <ul className="flex justify-between items-start  text-primary text-[14px] pb-3">
          <li className="flex items-center gap-2 text-primary">
            <img
              src={assets.images.locationIcon}
              alt="icon"
              className="w-[28px] h-[28px] icn"
            />
            Kuwait
          </li>
          <li className="flex items-center gap-2  text-primary">
            <img
              src={assets.images.phoneIcon}
              alt="icon"
              className="w-[28px] h-[28px] icn "
            />
            +965 94051232
          </li>
          <li className="flex items-center gap-2 text-primary">
            <img
              src={assets.images.mailIcon}
              alt="icon"
              className="w-[28px] h-[28px] icn"
            />
            aljaser@rento.online
          </li>
        </ul>
      </motion.div>
    </section>
  );
}

export default ContactSection;
