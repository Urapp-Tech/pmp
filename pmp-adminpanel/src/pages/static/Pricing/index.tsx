// import { useEffect, useMemo, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import assets from '@/assets/images';
// import Footer from '@/components/Static/Footer';
// import Header from '@/components/Static/Header';
// import SelectedPlanModal from '@/components/Static/Model'; // keep your alias/path
// import plan from '@/services/adminapp/static';
// import { useToast } from '@/hooks/use-toast';
// import { cn } from '@/lib/utils';
// import { useSelector } from 'react-redux';
// import { motion, useScroll, useTransform } from 'framer-motion';
// import ReactLenis from 'lenis/react';

// type BillingCycle = 'annual' | 'monthly';

// type Plan = {
//   id: string;
//   code: string; // e.g., "building" | "house_villa" | "apartment"
//   name: string; // title for UI
//   description?: string;
//   currency: string; // e.g., "KWD"
//   monthlyPrice: number; // per property
//   annualPrice: number; // per property (billed annually)
//   features?: string[];
//   // You can extend with more fields if your API returns them
// };

// const defaultPlans: Plan[] = [
//   {
//     id: 'building',
//     code: 'building',
//     name: 'Building',
//     description:
//       'A bold structure built for purpose and scale—where design meets ambition in every floor.',
//     currency: 'KD',
//     monthlyPrice: 40, // UI says “/property per month (billed annually)”
//     annualPrice: 40, // same visual price, but you can discount if needed
//     features: [
//       'Post unlimited building listings',
//       'Highlighted placement for better reach',
//       'Dedicated support assistance',
//       'Advanced property analytics & insights',
//     ],
//   },
//   {
//     id: 'villa_house',
//     code: 'villa_house',
//     name: 'Villa/House',
//     description:
//       'A personal sanctuary wrapped in style and space, crafted for comfort and character.',
//     currency: 'KD',
//     monthlyPrice: 20,
//     annualPrice: 20,
//     features: [
//       'Post up to 5 house/villa listings',
//       'Priority in search results',
//       'Option to add high-quality photos/videos',
//       'Promote your property with “Featured” tag',
//     ],
//   },
//   {
//     id: 'apartment',
//     code: 'apartment',
//     name: 'Apartment',
//     description:
//       'Smart living stacked with convenience—urban rhythm in a compact, curated shell.',
//     currency: 'KD',
//     monthlyPrice: 10,
//     annualPrice: 10,
//     features: [
//       'Post up to 3 apartment listings',
//       'Standard placement in search results',
//       'Photo uploads included',
//       'Easy property management dashboard',
//     ],
//   },
// ];

// const Pricing = () => {
//   const navigate = useNavigate();
//   const authState: any = useSelector((state: any) => state.authState);

//   const { toast } = useToast();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual'); // default Annually
//   const [plans, setPlans] = useState<Plan[]>(defaultPlans);
//   const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
//   const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

//   const [showHeader, setShowHeader] = useState(true);
//   const lastYRef = useRef<number>(
//     typeof window !== 'undefined' ? window.scrollY : 0
//   );
//   const tickingRef = useRef(false);

//   const ToastHandler = (text: string, color = 'red') =>
//     toast({
//       description: text,
//       className: cn(
//         'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
//       ),
//       style: { backgroundColor: color, color: 'white' },
//     });

//   // helper: lowercase-only name key (aap ne "strlower" bola)
//   const nameKey = (s: string) => (s || '').trim().toLowerCase();

//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         const res = await plan.planService(); // GET subscriptions/list
//         if (!mounted) return;
//         // API result shapes handle: data.items | data.plans | data | []
//         const items = res?.data?.items ?? res?.data?.plans ?? res?.data ?? [];
//         const map: Record<string, string> = {};

//         (Array.isArray(items) ? items : []).forEach((it: any) => {
//           const nm = (it?.plan_name ?? '').toString();
//           const id = it?.id != null ? String(it.id) : '';
//           if (nm && id) map[nameKey(nm)] = id;
//         });

//         // 👉 sirf id override karo, baqi sab defaultPlans ka as-is
//         setPlans(
//           defaultPlans.map((p) => ({
//             ...p,
//             id: map[nameKey(p.name)] ?? p.id, // API id if match, else keep existing
//           }))
//         );
//         loadingPlans && setLoadingPlans(false);
//       } catch {
//         // API fail ho to defaults hi rehne do
//         setPlans(defaultPlans);
//       }
//     })();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleToggle = () => {
//     setBillingCycle((prev) => (prev === 'annual' ? 'monthly' : 'annual'));
//   };

//   const cycleNote = useMemo(
//     () =>
//       billingCycle === 'annual'
//         ? '/property per month (billed annually)'
//         : '/property per month',
//     [billingCycle]
//   );

//   const priceFor = (p: Plan) =>
//     billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice;

//   const openSubscribe = (p: Plan) => {
//     setSelectedPlan(p);
//     setIsModalOpen(true);
//   };

//   // animations
//   useEffect(() => {
//     const handle = () => {
//       const y = window.scrollY;
//       const dy = y - lastYRef.current;

//       if (Math.abs(dy) < 6) return;

//       if (y < 64) {
//         setShowHeader(true);
//         lastYRef.current = y;
//         return;
//       }

//       setShowHeader(dy <= 0);
//       lastYRef.current = y;
//     };

//     const onScroll = () => {
//       if (tickingRef.current) return;
//       tickingRef.current = true;
//       requestAnimationFrame(() => {
//         handle();
//         tickingRef.current = false;
//       });
//     };

//     window.addEventListener('scroll', onScroll, { passive: true });
//     return () => window.removeEventListener('scroll', onScroll);
//   }, []);

//   const slowScrollState = useRef({
//     targetY: typeof window !== 'undefined' ? window.scrollY : 0,
//     rafId: 0 as number | 0,
//     animating: false,
//     paused: false,
//   });
//   const includeSectionVariants = {
//     hidden: { opacity: 0, y: 60 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         ease: 'easeOut',
//         when: 'beforeChildren',
//         staggerChildren: 0.14,
//         delayChildren: 0.08,
//       },
//     },
//   };
//   const includeGridVariants = {
//     hidden: { opacity: 0, y: 20 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: { staggerChildren: 0.1, delayChildren: 0.04 },
//     },
//   };
//   const includeItemVariants = {
//     hidden: { opacity: 0, y: 24 },
//     show: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.45, ease: 'easeOut' },
//     },
//   };

//   const heroRef = useRef<HTMLElement | null>(null);
//   const { scrollYProgress } = useScroll({
//     target: heroRef,
//     offset: ['start start', 'end start'],
//   });
//   const contentY = useTransform(scrollYProgress, [0, 1], [0, -200]);
//   const bgY = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, -120]);
//   // const reveal = {
//   //   initial: { opacity: 0, y: 50 },
//   //   whileInView: { opacity: 1, y: 0 },
//   //   viewport: { once: true, amount: 0.2 },
//   //   transition: { duration: 0.6, ease: 'easeOut' },
//   // };

//   useEffect(() => {
//     const isHTMLElement = (el: any): el is HTMLElement =>
//       el && typeof el === 'object' && 'closest' in el;

//     const isManagedZone = (t: EventTarget | null) => {
//       if (!isHTMLElement(t)) return false;
//       return !!(t.closest(' ') || t.closest(''));
//     };

//     const stopAnimationIfRunning = () => {
//       const st = slowScrollState.current;
//       if (st.animating && st.rafId) {
//         cancelAnimationFrame(st.rafId);
//         st.rafId = 0;
//         st.animating = false;
//       }
//     };

//     const step = () => {
//       const st = slowScrollState.current;
//       if (st.paused) {
//         stopAnimationIfRunning();
//         return;
//       }
//       const { targetY } = st;
//       const currentY = window.scrollY;
//       const nextY = currentY + (targetY - currentY) * 0.12;
//       window.scrollTo(0, nextY);

//       if (Math.abs(targetY - nextY) > 0.5) {
//         st.rafId = requestAnimationFrame(step);
//         st.animating = true;
//       } else {
//         window.scrollTo(0, targetY);
//         st.animating = false;
//         if (st.rafId) cancelAnimationFrame(st.rafId);
//         st.rafId = 0;
//       }

//       const onEnterManaged = () => {
//         slowScrollState.current.paused = true;

//         if (
//           slowScrollState.current.animating &&
//           slowScrollState.current.rafId
//         ) {
//           cancelAnimationFrame(slowScrollState.current.rafId);
//           slowScrollState.current.rafId = 0;
//           slowScrollState.current.animating = false;
//         }
//       };
//       const onLeaveManaged = () => {
//         slowScrollState.current.paused = false;
//         slowScrollState.current.targetY = window.scrollY;
//       };

//       window.addEventListener(
//         'rento:enterManaged',
//         onEnterManaged as EventListener
//       );
//       window.addEventListener(
//         'rento:leaveManaged',
//         onLeaveManaged as EventListener
//       );

//       return () => {
//         window.removeEventListener(
//           'rento:enterManaged',
//           onEnterManaged as EventListener
//         );
//         window.removeEventListener(
//           'rento:leaveManaged',
//           onLeaveManaged as EventListener
//         );
//       };
//     };

//     const onWheel = (e: WheelEvent) => {
//       if (e.defaultPrevented) return;

//       if (isManagedZone(e.target)) {
//         stopAnimationIfRunning();
//         return;
//       }

//       if (slowScrollState.current.paused) return;

//       e.preventDefault();

//       const scale = 0.18;

//       const dy = e.deltaY;
//       const moderated = Math.sign(dy) * Math.min(Math.abs(dy), 140);

//       const docHeight = Math.max(
//         document.body.scrollHeight,
//         document.documentElement.scrollHeight
//       );
//       const viewport = window.innerHeight;

//       const nextTarget = Math.max(
//         0,
//         Math.min(
//           docHeight - viewport,
//           slowScrollState.current.targetY + moderated * scale
//         )
//       );

//       slowScrollState.current.targetY = nextTarget;

//       if (!slowScrollState.current.animating) {
//         slowScrollState.current.animating = true;
//         slowScrollState.current.rafId = requestAnimationFrame(step);
//       }
//     };

//     window.addEventListener('wheel', onWheel, { passive: false });
//     slowScrollState.current.targetY = window.scrollY;

//     return () => {
//       window.removeEventListener('wheel', onWheel as any);
//       stopAnimationIfRunning();
//     };
//   }, []);

//   return (
//     <>
//       <ReactLenis root />
//       <div className="w-full relative bg-[#DFF4EC]">
//         <motion.div
//           initial={{ y: 0, opacity: 1 }}
//           animate={{ y: showHeader ? 0 : -90, opacity: showHeader ? 1 : 0.98 }}
//           transition={{ duration: 0.9, ease: 'easeOut' }}
//           className="fixed top-0 left-0 right-0 z-[1000] will-change-transform py-0"
//         >
//           <Header customClass="bg-white/80 backdrop-blur-xl shadow-sm py-0" />
//         </motion.div>
//         <div className="h-[62px]" />
//         <motion.section
//           ref={heroRef}
//           className="relative h-[100vh] flex justify-start max-xl:h-[650px] max-[1260px]:flex-col   max-[1260px]:items-center  "
//           style={{ y: bgY }}
//         >
//           {/* <img
//             src={assets.images.priceBanner}
//             className="w-full h-[100vh] object-cover absolute top-0 z-1 max-[1260px]:h-[900px] max-[992px]:h-[650px] max-[992px]:object-right  max-md:object-center"
//           /> */}
//           <img
//             src={assets.images.priceBanner}
//             className="w-full h-[100vh] object-cover absolute top-0 z-1 max-[1260px]:h-[900px] max-[992px]:h-[650px] max-[992px]:object-right  max-md:object-center"
//           />
//           {/* <img
//             src={assets.images.contactBanner}
//             className="w-full max-w-full h-[540px] object-cover object-right absolute top-0 z-[-1] max-[992px]:object-bottom max-[992px]:opacity-[0.3] max-[768px]:object-right"
//             alt="Contact Banner"
//           /> */}
//           <div className="relative h-full flex-1 flex w-full">
//             <motion.div
//               className="flex-1 flex absolute bottom-40 max-w-[1200px] gap-10 items-center justify-between px-4 max-xl:gap-y-1 max-[1260px]:flex-col max-[1260px]:items-start  "
//               style={{ y: contentY }}
//             >
//               <motion.h1
//                 className="capitalize text-[95px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[40px]"
//                 initial={{ opacity: 0, y: 80 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
//               >
//                 Pricing{' '}
//               </motion.h1>
//               <motion.p
//                 className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px] max-[768px]:text-[18px]"
//                 initial={{ opacity: 0, y: 50 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.7, ease: 'easeOut', delay: 1.0 }}
//               >
//                 Simple pricing. No hidden fees. Pay only for the properties you
//                 manage.
//               </motion.p>
//             </motion.div>
//           </div>
//         </motion.section>

//         <div className="w-full pb-5 bg-[#DFF4EC]">
//           <div className="flex justify-center gap-3 items-center p-4 max-[992px]:flex-col translate-y-[-100px]">
//             {loadingPlans ? (
//               <div className="text-primary text-lg py-10">Loading plans…</div>
//             ) : (
//               plans.slice(0, 3).map((p, index) => (
//                 <motion.div
//                   key={p.id}
//                   className="flex-1 min-w-[280px]"
//                   initial={{ opacity: 0, x: -50 }} // start from left
//                   whileInView={{ opacity: 1, x: 0 }} // slide in to original position
//                   viewport={{ once: true, amount: 0.3 }}
//                   transition={{
//                     type: 'spring',
//                     stiffness: 70,
//                     damping: 20,
//                     delay: index * 0.2, // stagger effect
//                   }}
//                 >
//                   <div className="flex-1 min-w-[280px]">
//                     <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
//                       <div className="space-y-4 mb-8">
//                         <h2 className="text-[36px] m-0 font-medium">
//                           {p.name}
//                         </h2>
//                         <h1 className="text-[64px] m-0 font-medium tracking-tight">
//                           {priceFor(p)}
//                           {p.currency}
//                         </h1>
//                         <p className="text-[20px] font-normal text-white">
//                           {cycleNote}
//                         </p>
//                       </div>

//                       <ul className="space-y-4 mb-8 text-white">
//                         {(p.features?.length
//                           ? p.features
//                           : defaultPlans.find((d) => d.code === p.code)
//                               ?.features || []
//                         ).map((f, i) => (
//                           <li className="flex items-start" key={i}>
//                             <span className="text-xl mr-2 leading-none">•</span>
//                             <span>{f}</span>
//                           </li>
//                         ))}
//                       </ul>

//                       <p className="text-[20px] font-light text-white mb-8">
//                         {p.description ||
//                           defaultPlans.find((d) => d.code === p.code)
//                             ?.description ||
//                           'Flexible plan tailored for property managers and landlords.'}
//                       </p>

//                       <button
//                         className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
//                         onClick={() => {
//                           if (!authState.user) {
//                             navigate('/admin-panel/auth/login'); // 🔹 login page redirect
//                           } else {
//                             openSubscribe(p);
//                           }
//                         }}
//                       >
//                         Subscribe Now
//                       </button>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))
//             )}
//           </div>

//           {/* --- All plans include --- */}
//           <motion.div
//             className="max-w-[1372px] mx-auto px-5"
//             variants={includeSectionVariants}
//             initial="hidden"
//             whileInView="show"
//             viewport={{ once: true, amount: 0.25 }}
//           >
//             <motion.h3
//               className="mt-5 text-primary text-[100px] font-normal leading-norma max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]"
//               variants={includeItemVariants}
//             >
//               All plans include
//             </motion.h3>
//             <motion.div
//               className="mt-18 mb-5 flex justify-between gap-x-5 gap-y-10  flex-wrap"
//               variants={includeGridVariants}
//             >
//               <motion.div
//                 className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
//                 variants={includeItemVariants}
//               >
//                 <div className="w-[50px] mb-4">
//                   <img
//                     src={assets.images.icon1}
//                     className="w-full h-full"
//                     alt="icon"
//                   />
//                 </div>
//                 <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                   Property Dashboard
//                 </h4>
//                 <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                   Manage all your properties in one place. From rent collection
//                   to tenant details, everything is organized in a clean,
//                   easy-to-use dashboard designed to save you time.
//                 </p>
//               </motion.div>
//               <motion.div
//                 className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
//                 variants={includeItemVariants}
//               >
//                 <div className="w-[50px] mb-4">
//                   <img
//                     src={assets.images.icon2}
//                     className="w-full h-full"
//                     alt="icon"
//                   />
//                 </div>
//                 <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                   Secure Listings
//                 </h4>
//                 <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                   Your property details are fully protected. You decide who has
//                   access whether it’s just you or selected managers with
//                   customized permissions.
//                 </p>
//               </motion.div>
//               <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
//                 <div className="w-[50px] mb-4">
//                   <img
//                     src={assets.images.icon3}
//                     className="w-full h-full"
//                     alt="icon"
//                   />
//                 </div>
//                 <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                   Multi-device Access
//                 </h4>
//                 <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                   Work the way you want. Whether you’re at your desk or on the
//                   go, you can access your account on mobile, tablet, or desktop.
//                 </p>
//               </div>
//               <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
//                 <div className="w-[50px] mb-4">
//                   <img
//                     src={assets.images.icon4}
//                     className="w-full h-full"
//                     alt="icon"
//                   />
//                 </div>
//                 <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                   Photo & Video Uploads
//                 </h4>
//                 <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                   Upload photos of your buildings and units so you always have a
//                   clear record of your properties right inside the platform.
//                 </p>
//               </div>
//               {/* <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
//                             <div className="w-[50px] mb-4">
//                                 <img src={assets.images.icon5} className="w-full h-full" alt="icon" />
//                             </div>
//                             <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                                 Location Maps
//                             </h4>
//                             <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                                 Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et nulla a eu netus libero neque. Tortor integer eu sed facilisis. Risus diam at eget enim eros condimentum. Nisi vestibulum diam in mattis morbi elit sed cursus ornare.
//                             </p>
//                         </div> */}
//               <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
//                 <div className="w-[50px] mb-4">
//                   <img
//                     src={assets.images.icon6}
//                     className="w-full h-full"
//                     alt="icon"
//                   />
//                 </div>
//                 <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                   Direct Inquiries
//                 </h4>
//                 <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                   Stay connected with your tenants. They can reach you directly
//                   through the platform, making communication simple and secure.
//                 </p>
//               </div>
//               {/* <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
//                             <div className="w-[50px] mb-4">
//                                 <img src={assets.images.icon7} className="w-full h-full" alt="icon" />
//                             </div>
//                             <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                                 Social Sharing
//                             </h4>
//                             <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                                 Lorem ipsum dolor sit amet consectetur. Placerat maecenas est et nulla a eu netus libero neque. Tortor integer eu sed facilisis. Risus diam at eget enim eros condimentum. Nisi vestibulum diam in mattis morbi elit sed cursus ornare.
//                             </p>
//                         </div> */}
//               <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
//                 <div className="w-[50px] mb-4">
//                   <img
//                     src={assets.images.icon8}
//                     className="w-full h-full"
//                     alt="icon"
//                   />
//                 </div>
//                 <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
//                   Property Insights
//                 </h4>
//                 <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
//                   Track rent income, expenses, and overall property performance
//                   to stay in control of your finances.
//                 </p>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         <SelectedPlanModal
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           plan={selectedPlan}
//           billingCycle={billingCycle}
//         />
//         <Footer />
//       </div>
//     </>
//   );
// };

// export default Pricing;

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import SelectedPlanModal from '@/components/Static/Model'; // keep your alias/path
import plan from '@/services/adminapp/static';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { motion, useScroll, useTransform } from 'framer-motion';
import ReactLenis from 'lenis/react';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type BillingCycle = 'annual' | 'monthly';

type Plan = {
  id: string;
  code: string; // e.g., "building" | "house_villa" | "apartment"
  name: string; // title for UI
  description?: string;
  currency: string; // e.g., "KWD"
  monthlyPrice: number; // per property
  annualPrice: number; // per property (billed annually)
  features?: string[];
};

const defaultPlans: Plan[] = [
  {
    id: 'building',
  code: 'building',
  name: 'Building',
  description:
    'A bold structure built for purpose and scale—where design meets ambition in every floor.',
  currency: 'KD',
  monthlyPrice: 40,
  annualPrice: 40,
  features: [
    'Post unlimited building listings',
    'Highlighted placement for better reach',
    'Dedicated support assistance',
    'Advanced property analytics & insights',
  ],
},
{
  id: 'villa_house',
  code: 'villa_house',
  name: 'Villa/House',
  description:
    'A personal sanctuary wrapped in style and space, crafted for comfort and character.',
  currency: 'KD',
  monthlyPrice: 20,
  annualPrice: 20,
  features: [
    'Post up to 5 house/villa listings',
    'Priority in search results',
    'Option to add high-quality photos/videos',
    'Promote your property with “Featured” tag',
  ],
},
{
  id: 'apartment',
  code: 'apartment',
  name: 'Apartment',
  description:
    'Smart living stacked with convenience—urban rhythm in a compact, curated shell.',
  currency: 'KD',
  monthlyPrice: 10,
  annualPrice: 10,
  features: [
    'Post up to 3 apartment listings',
    'Standard placement in search results',
    'Photo uploads included',
    'Easy property management dashboard',
  ],
},
];

const Pricing = () => {
const navigate = useNavigate();
const authState: any = useSelector((state: any) => state.authState);

const { toast } = useToast();
const [isModalOpen, setIsModalOpen] = useState(false);
const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
const [plans, setPlans] = useState<Plan[]>(defaultPlans);
const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

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

// helper: lowercase-only name key
const nameKey = (s: string) => (s || '').trim().toLowerCase();

/* ----------------- FETCH PLANS & MERGE IDs ----------------- */
useEffect(() => {
  let mounted = true;
  (async () => {
    try {
      const res = await plan.planService(); // GET subscriptions/list
      if (!mounted) return;

      const items = res?.data?.items ?? res?.data?.plans ?? res?.data ?? [];
      const map: Record<string, string> = {};

      (Array.isArray(items) ? items : []).forEach((it: any) => {
        const nm = (it?.plan_name ?? '').toString();
        const id = it?.id != null ? String(it.id) : '';
        if (nm && id) map[nameKey(nm)] = id;
      });

      setPlans(
        defaultPlans.map((p) => ({
          ...p,
          id: map[nameKey(p.name)] ?? p.id,
        }))
      );
      loadingPlans && setLoadingPlans(false);
    } catch {
      setPlans(defaultPlans);
      setLoadingPlans(false);
    }
  })();
  return () => {
    mounted = false;
  };
}, []);

/* ----------------- TOGGLE BILLING CYCLE ----------------- */
const handleToggle = () => {
  setBillingCycle((prev) => (prev === 'annual' ? 'monthly' : 'annual'));
};

const cycleNote = useMemo(
  () =>
    billingCycle === 'annual'
      ? '/property per month (billed annually)'
      : '/property per month',
  [billingCycle]
);

const priceFor = (p: Plan) =>
  billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice;

const openSubscribe = (p: Plan) => {
  setSelectedPlan(p);
  setIsModalOpen(true);
};

/* ----------------- HEADER SHOW/HIDE ON SCROLL ----------------- */
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

/* ----------------- SCROLL SMOOTHING STATE ----------------- */
const slowScrollState = useRef({
  targetY: typeof window !== 'undefined' ? window.scrollY : 0,
  rafId: 0 as number | 0,
  animating: false,
  paused: false,
});

/* ----------------- ANIMATION VARIANTS (ALL PLANS INCLUDE) ----------------- */

const includeSectionVariants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      when: 'beforeChildren',
      staggerChildren: 0.14,
      delayChildren: 0.08,
    },
  },
};

const includeGridVariants = {
  // hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
  },
};

const includeItemVariants = {
  // hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

/* ----------------- HERO PARALLAX ----------------- */

const heroRef = useRef<HTMLElement | null>(null);
const { scrollYProgress } = useScroll({
  target: heroRef,
  offset: ['start start', 'end start'],
});
const contentY = useTransform(scrollYProgress, [0, 1], [0, -200]);
const bgY = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, -120]);

/* ----------------- CUSTOM SMOOTH SCROLL (FIXED) ----------------- */

useEffect(() => {
  const isAppleDevice =
    typeof navigator !== 'undefined' &&
    /mac|iphone|ipod|ipad/i.test(
      (navigator.platform || navigator.userAgent || '').toLowerCase()
    );

  // Safari/macOS + trackpad were fighting the custom wheel handler; fall back to native scroll there
  if (isAppleDevice) {
    slowScrollState.current.targetY =
      typeof window !== 'undefined' ? window.scrollY : 0;
    return;
  }

  const isHTMLElement = (el: any): el is HTMLElement =>
    el && typeof el === 'object' && 'closest' in el;

  // NOTE: yahan future me tum koi specific container class/data-attr laga sakte ho
  // e.g. data-scroll-zone="managed"
  const isManagedZone = (t: EventTarget | null) => {
    if (!isHTMLElement(t)) return false;
    return !!t.closest('[data-scroll-zone="managed"]');
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

  const onEnterManaged = () => {
    slowScrollState.current.paused = true;
    stopAnimationIfRunning();
  };

  const onLeaveManaged = () => {
    slowScrollState.current.paused = false;
    slowScrollState.current.targetY = window.scrollY;
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('rento:enterManaged', onEnterManaged as EventListener);
  window.addEventListener('rento:leaveManaged', onLeaveManaged as EventListener);
  slowScrollState.current.targetY = window.scrollY;

  return () => {
    window.removeEventListener('wheel', onWheel as any);
    window.removeEventListener(
      'rento:enterManaged',
      onEnterManaged as EventListener
    );
    window.removeEventListener(
      'rento:leaveManaged',
      onLeaveManaged as EventListener
    );
    stopAnimationIfRunning();
  };
}, []);

/* ----------------- JSX ----------------- */

return (
  <>
    <ReactLenis root />
    <div className="w-full relative bg-[#DFF4EC]">
      {/* HEADER */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: showHeader ? 0 : -90, opacity: showHeader ? 1 : 0.98 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[1000] will-change-transform py-0"
      >
        <Header customClass="bg-white/80 backdrop-blur-xl shadow-sm py-0" />
      </motion.div>

      <div className="h-[62px]" />

      {/* HERO */}
      <motion.section
        ref={heroRef}
        className="relative h-[100vh] flex justify-start max-xl:h-[650px] max-lg:h-[500px] max-[1260px]:flex-col max-[1260px]:items-center"
        style={{ y: bgY }}
      >
        <img
          src={assets.images.priceBanner}
          className="w-full h-[100vh] object-cover absolute top-0 z-1 max-[1260px]:h-[900px] max-[992px]:h-[650px] max-[992px]:object-right max-md:object-center"
        />
        <div className="relative h-full flex-1 flex w-full">
          <motion.div
            className="flex-1 flex absolute bottom-40 max-w-[1200px] gap-10 items-center justify-between px-4 max-xl:gap-y-1 max-[1260px]:flex-col max-[1260px]:items-start"
            style={{ y: contentY }}
          >
            <motion.h1
              className="capitalize text-[95px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[40px]"
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
            >
              Pricing
            </motion.h1>
            <motion.p
              className="max-w-[593px] font-light text-[24px] text-primary max-[1024px]:text-[20px] max-[768px]:text-[18px]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 1.0 }}
            >
              Simple pricing. No hidden fees. Pay only for the properties you
              manage.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* PLANS */}
      <div className="w-full pb-5 bg-[#DFF4EC]">
        <div className="translate-y-[-100px] max-[992px]:translate-y-[-50px]">
          {loadingPlans ? (
            <div className="text-primary text-lg py-10 text-center">
              Loading plans…
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-3 items-center p-4 max-[992px]:hidden">
                {plans.slice(0, 3).map((p, index) => (
                  <motion.div
                    key={p.id}
                    className="flex-1 min-w-[280px]"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{
                      type: 'spring',
                      stiffness: 70,
                      damping: 20,
                      delay: index * 0.2,
                    }}
                  >
               
                      <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group  min-h-[800px]   max-xl:min-h-[850px] max-[992px]:max-w-full flex flex-col justify-between">
                        <div className="space-y-4 mb-8">
                          <h2 className="text-[36px] m-0 font-medium">
                            {p.name}
                          </h2>
                          <h1 className="text-[64px] m-0 font-medium tracking-tight">
                            {priceFor(p)}
                            {p.currency}
                          </h1>
                          <p className="text-[20px] font-normal text-white truncate text-ellipsis line-clamp-3 max-xl:text-[18px]">
                            {cycleNote}
                          </p>
                        </div>

                        <ul className="space-y-4 mb-8 text-white">
                          {(p.features?.length
                            ? p.features
                            : defaultPlans.find((d) => d.code === p.code)
                                ?.features || []
                          ).map((f, i) => (
                            <li className="flex items-start" key={i}>
                              <span className="text-xl mr-2 leading-none">
                                •
                              </span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <p className="text-[20px] font-light text-white mb-8">
                          {p.description ||
                            defaultPlans.find((d) => d.code === p.code)
                              ?.description ||
                            'Flexible plan tailored for property managers and landlords.'}
                        </p>

                        <button
                          className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
                          onClick={() => {
                            if (!authState.user) {
                              navigate('/admin-panel/auth/login');
                            } else {
                              openSubscribe(p);
                            }
                          }}
                        >
                          Subscribe Now
                        </button>
                      </div>
               
                  </motion.div>
                ))}
              </div>

              <div className="hidden max-[992px]:block px-4">
                <Swiper
                  slidesPerView={1}
                  spaceBetween={20}
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  className="pricing-swiper"
                >
                  {plans.slice(0, 3).map((p) => (
                    <SwiperSlide key={p.id}>
                      <div className="flex justify-center items-stretch py-4">
                        <div className="flex-1 min-w-[260px]">
                          <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-6 shadow-xl group">
                            <div className="space-y-3 mb-6">
                              <h2 className="text-[28px] m-0 font-medium">
                                {p.name}
                              </h2>
                              <h1 className="text-[42px] m-0 font-medium tracking-tight">
                                {priceFor(p)}
                                {p.currency}
                              </h1>
                              <p className="text-[18px] font-normal text-white">
                                {cycleNote}
                              </p>
                            </div>

                            <p className="text-[18px] font-light text-white mb-6">
                              {p.description ||
                                defaultPlans.find((d) => d.code === p.code)
                                  ?.description ||
                                'Flexible plan tailored for property managers and landlords.'}
                            </p>

                            <button
                              className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
                              onClick={() => {
                                if (!authState.user) {
                                  navigate('/admin-panel/auth/login');
                                } else {
                                  openSubscribe(p);
                                }
                              }}
                            >
                              Subscribe Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </>
          )}
        </div>

        {/* --- All plans include --- */}
        <motion.div
          className="max-w-[1372px] mx-auto px-5"
          variants={includeSectionVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0 }}
        >
          <motion.h3
            className="my-5 text-primary text-[100px] font-normal leading-norma max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]"
            variants={includeItemVariants}
          >
            All plans include
          </motion.h3>

          <motion.div
            className="mt-18 mb-5 flex justify-between gap-x-5 gap-y-10 flex-wrap"
            variants={includeGridVariants}
          >
            {/* 1 */}
            <motion.div
              className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
              variants={includeItemVariants}
            >
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon1}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[28px]">
                Property Dashboard
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Manage all your properties in one place. From rent collection to
                tenant details, everything is organized in a clean,
                easy-to-use dashboard designed to save you time.
              </p>
            </motion.div>

            {/* 2 */}
            <motion.div
              className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
              variants={includeItemVariants}
            >
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon2}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[28px]">
                Secure Listings
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Your property details are fully protected. You decide who has
                access whether it’s just you or selected managers with
                customized permissions.
              </p>
            </motion.div>

            {/* 3 */}
            <motion.div
              className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
              variants={includeItemVariants}
            >
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon3}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[28px]">
                Multi-device Access
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Work the way you want. Whether you’re at your desk or on the go,
                you can access your account on mobile, tablet, or desktop.
              </p>
            </motion.div>

            {/* 4 */}
            <motion.div
              className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
              variants={includeItemVariants}
            >
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon4}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[28px]">
                Photo & Video Uploads
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Upload photos of your buildings and units so you always have a
                clear record of your properties right inside the platform.
              </p>
            </motion.div>

            {/* 5 */}
            <motion.div
              className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
              variants={includeItemVariants}
            >
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon6}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[28px]">
                Direct Inquiries
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Stay connected with your tenants. They can reach you directly
                through the platform, making communication simple and secure.
              </p>
            </motion.div>

            {/* 6 */}
            <motion.div
              className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full"
              variants={includeItemVariants}
            >
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon8}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[28px]">
                Property Insights
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Track rent income, expenses, and overall property performance to
                stay in control of your finances.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <SelectedPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        billingCycle={billingCycle}
      />
      <Footer />
    </div>
  </>
);
};

export default Pricing;
