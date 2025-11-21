import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import { useEffect, useRef, useState } from 'react';
import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';

const Features = () => {
  const [showHeader, setShowHeader] = useState(true);
  const lastYRef = useRef<number>(
    typeof window !== 'undefined' ? window.scrollY : 0
  );
  const tickingRef = useRef(false);

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
        <div className="h-[72px]" />
        <motion.section
          ref={heroRef}
          className="relative h-[100vh] flex justify-start max-xl:h-[650px] max-[1260px]:flex-col   max-[1260px]:items-center  "
          style={{ y: bgY }}
        >
          <img
            src={assets.images.featureBanner}
            className="w-full h-[100vh] object-cover absolute top-0 z-1 max-[1260px]:h-[900px] max-[992px]:h-[650px] max-[992px]:object-right  max-md:object-center"
          />
          <div className="relative h-full flex-1 flex w-full">
            <motion.div
              className="flex-1 flex absolute bottom-40 max-w-[1200px] gap-10 items-center justify-between px-4 max-xl:gap-y-1 max-[1260px]:flex-col max-[1260px]:items-start  "
              style={{ y: contentY }}
            >
              <motion.h1
                className="capitalize text-[100px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[40px]"
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
              >
                Features{' '}
              </motion.h1>
              <motion.p
                className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px] max-[768px]:text-[18px]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 1.0 }}
              >
                Smart tools to simplify property management and boost
                efficiency.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        <div className="w-full pb-10 bg-[#DFF4EC] px-5">
          <div className="max-w-[1700px] mr-auto">
            <motion.div
              {...reveal}
              className="flex items-center justify-between gap-x-10 max-[768px]:flex-col max-[768px]:items-start"
            >
              <div className="flex-1 max-w-[906px] translate-y-[-100px] max-[1260px]:translate-y-[-50px] ">
                <img
                  src={assets.images.Feature1}
                  alt=""
                  className="w-full h-full  "
                />
              </div>
              <div className="flex-1 max-w-[729px] mx-auto pl-10 max-[1260px]:pl-0 max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-5">
                <h2 className="py-4 text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
                  For Landlords
                </h2>
                <ul className="my-3 px-10 max-[1024px]:px-2">
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    {' '}
                    Add & manage unlimited properties
                  </li>
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Dashboard view of tenants, invoices & tickets
                  </li>
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Automated rent reminders & collections
                  </li>
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Download receipts & financial reports
                  </li>
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Assign property managers with ease
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            {...reveal}
            className="max-w-[1700px] my-10 ml-auto"
          >
            <div className="flex items-center justify-between gap-x-10 max-[768px]:flex-col-reverse max-[768px]:items-start">
              <div className="flex-1 max-w-[729px] mx-auto  max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-5">
                <h2 className="text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px] ">
                  For Managers
                </h2>

                <ul className="my-3 px-10 max-[1024px]:px-2">
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    {' '}
                    Tenant database with contact details & unit status
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Monitor managed properties & rent summary
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Handle invoices & receipts digitally
                  </li>

                  <li className=" my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Respond to maintenance requests
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    {' '}
                    Communicate directly with landlords & tenants
                  </li>
                </ul>
              </div>
              <div className="flex-1 max-w-[906px]  ">
                <img
                  src={assets.images.Feature2}
                  alt=""
                  className="w-full h-full"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            {...reveal}
            className="max-w-[1700px] my-10 mr-auto"
          >
            <div className="flex items-center justify-between gap-x-10 max-[768px]:flex-col max-[768px]:items-start">
              <div className="flex-1 max-w-[906px] xl:translate-y-[-50px]">
                <img
                  src={assets.images.Feature3}
                  alt=""
                  className="w-full h-full  "
                />
              </div>
              <div className="flex-1 max-w-[729px] mx-auto pl-10 max-[1260px]:pl-0 max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-5">
                <h2 className="text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px] ">
                  For Tenants
                </h2>

                <ul className="my-3 px-10 max-[1024px]:px-2">
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    {' '}
                    Pay rent online in KD securely
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    View contracts & download receipts
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Submit & track maintenance requests
                  </li>

                  <li className=" my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Access unit details & payment history
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    {' '}
                    Get reminders before due dates
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            {...reveal}
            className="max-w-[1700px] my-10 ml-auto"
          >
            <div className="flex items-center justify-between gap-x-10 max-[768px]:flex-col-reverse max-[768px]:items-start">
              <div className="flex-1 max-w-[729px] mx-auto  max-[768px]:max-w-full max-[768px]:mx-0 max-[768px]:px-5">
                <h2 className="text-[100px] text-primary font-normal max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px] ">
                  For Everyone
                </h2>

                <ul className="my-3 px-10 max-[1024px]:px-2">
                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    {' '}
                    Multi-portal access (Landlord, Manager, Tenant, Admin)
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    24/7 cloud-based access (desktop & mobile)
                  </li>

                  <li className="my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Arabic & English support
                  </li>

                  <li className=" my-4 text-[24px] font-light text-primary list-disc max-[1260px]:text-[18px]">
                    Bank-grade payment security
                  </li>
                </ul>
              </div>
              <div className="flex-1 max-w-[906px]  ">
                <img
                  src={assets.images.Feature2}
                  alt=""
                  className="w-full h-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Features;
