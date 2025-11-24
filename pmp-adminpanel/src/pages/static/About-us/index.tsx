import assets from '@/assets/images';
import CounterSection from '@/components/Static/Counter';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import Caorusel from '@/components/Static/Slider/Carousel';
import { motion, useScroll, useTransform } from 'framer-motion';
import ReactLenis from 'lenis/react';
import { useEffect, useRef, useState } from 'react';

const About = () => {
  // const [isToggled, setIsToggled] = useState(true);

  // const handleToggle = () => {
  //     setIsToggled(!isToggled);
  // };

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
  // const reveal = {
  //   initial: { opacity: 0, y: 50 },
  //   whileInView: { opacity: 1, y: 0 },
  //   viewport: { once: true, amount: 0.2 },
  //   transition: { duration: 0.6, ease: 'easeOut' },
  // };

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
            src={assets.images.aboutBanner}
            className="w-full h-[100vh] object-cover absolute top-0 z-1 max-[1260px]:h-[900px] max-[992px]:h-[650px] max-[992px]:object-right  max-md:object-center"
          />

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
                About{' '}
              </motion.h1>
              <motion.p
                className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px] max-[768px]:text-[18px]"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 1.0 }}
              >
                Delivering intelligent solutions for seamless and transparent
                property management.
              </motion.p>
            </motion.div>
          </div>
        </motion.section>
        <div className="w-full pb-10 bg-[#DFF4EC]">
          <motion.div
            initial={{ y: 0, opacity: 1 }}
            animate={{
              y: showHeader ? 0 : -90,
              opacity: showHeader ? 1 : 0.98,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <Caorusel />
          </motion.div>

          <CounterSection />
          <div className="my-20 max-w-[1530px] mx-auto px-4">
            <motion.div
              className="my-20 max-w-[1530px] mx-auto px-4 text-left"
              initial={{ opacity: 0, x: -80, y: 20, scale: 0.97 }} // left + slightly lower start
              whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                x: { type: 'spring', stiffness: 60, damping: 16 }, // left to right slide
                y: { type: 'spring', stiffness: 50, damping: 18 }, // subtle vertical lift
                scale: { type: 'spring', stiffness: 50, damping: 20 },
                opacity: { duration: 0.6, ease: 'easeOut' },
              }}
            >
              <p className="text-primary text-[96px] leading-tight font-normal text-center max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
                At Rento, we believe property management should be{' '}
                <span className="text-[96px]  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
                  simple, smart, and stress-free.
                </span>
              </p>
            </motion.div>
          </div>

          <div className="my-10 max-w-[1530px] ml-auto px-3">
            <motion.h4
              className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                type: 'spring',
                stiffness: 60,
                damping: 18,
              }}
            >
              our Story
            </motion.h4>

            {/* Paragraph */}
            <motion.p
              className="text-[24px] font-light text-primary mt-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: 'spring',
                stiffness: 50,
                damping: 18,
              }}
            >
              We built Rento to empower landlords, property managers, and
              tenants with a modern platform that brings everything into one
              easy-to-use solution. From managing properties and tenants to
              tracking payments, sending invoices, and keeping records secure,
              Rento keeps you in control with just a few clicks.
            </motion.p>
            <div className="my-5 max-w-[1530px]">
              <motion.img
                src={assets.images.aboutBanner1}
                className="w-full h-full max-w-full object-cover"
                alt="banner"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="my-15 max-w-[1530px] mr-auto px-3">
            {/* <h4 className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
              Our Mission
            </h4>
            <p className="text-[24px] font-light text-primary">
              Our mission is to transform the rental experience in Kuwait by
              combining technology, transparency, and trust. Whether you own a
              single villa or manage a large portfolio of buildings, Rento is
              designed to save you time, reduce paperwork, and improve
              communication.
            </p> */}
            <motion.h4
              className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                type: 'spring',
                stiffness: 60,
                damping: 18,
              }}
            >
              Our Mission
            </motion.h4>

            {/* Paragraph */}
            <motion.p
              className="text-[24px] font-light text-primary mt-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: 'spring',
                stiffness: 50,
                damping: 18,
              }}
            >
              Our mission is to transform the rental experience in Kuwait by
              combining technology, transparency, and trust. Whether you own a
              single villa or manage a large portfolio of buildings, Rento is
              designed to save you time, reduce paperwork, and improve
              communication.
            </motion.p>
            <div className="my-5 max-w-[1530px]">
              {/* <img
                src={assets.images.aboutBanner2}
                className="w-full h-full max-w-full"
                alt="banner"
              /> */}
              <motion.img
                src={assets.images.aboutBanner2}
                className="w-full h-full max-w-full object-cover"
                alt="banner"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="my-15 max-w-[1840px] mx-auto px-3">
            <motion.h4
              className="text-primary text-center text-[64px] font-medium max-[1440px]:text-[56px] max-[1260px]:text-[48px] max-[1024px]:text-[36px] max-[768px]:text-[28px]"
              initial={{ opacity: 0, scale: 0.8 }} // start smaller + invisible
              whileInView={{ opacity: 1, scale: 1 }} // zoom to full size
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                type: 'spring',
                stiffness: 70,
                damping: 20,
                duration: 0.8,
              }}
            >
              With Rento, you get:
            </motion.h4>
            <div className="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}

              <div className="group h-[500px] w-full [perspective:1000px]">
                <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                    {/* Image Section */}
                    <div className="h-[300px]">
                      <img
                        src={assets.images.card1}
                        alt="icon"
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                      <img
                        src={assets.images.Iconfront1}
                        alt="icon"
                        className="w-[40px] h-[40px]"
                      />
                      <p className=" mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                        Smart Property Management
                      </p>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <img
                      src={assets.images.back1}
                      alt="banner"
                      className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                    />
                    <div className="pt-4">
                      <img
                        src={assets.images.Iconback1}
                        className="w-[40px] h-[40px] mx-auto"
                      />
                      <h5 className="text-[28px] font-medium mt-4 text-[#DFF4EC] text-center max-[1440px]:text-[22px]">
                        Smart Property Management
                      </h5>
                    </div>

                    <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                      Organize leases, track occupancy, and manage renewals.
                    </p>
                  </div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="group h-[500px] w-full [perspective:1000px]">
                <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                    {/* Image Section */}
                    <div className="h-[300px]">
                      <img
                        src={assets.images.card2}
                        alt="icon"
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                      <img
                        src={assets.images.Iconfront2}
                        alt="icon"
                        className="w-[40px] h-[40px]"
                      />
                      <p className="  mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                        Automated Payments & Invoicing
                      </p>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <img
                      src={assets.images.back2}
                      alt="banner"
                      className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                    />
                    <div className="pt-4">
                      <img
                        src={assets.images.Iconback2}
                        className="w-[40px] h-[40px] mx-auto"
                      />
                      <h5 className="text-[28px] text-center font-medium mt-4 text-[#DFF4EC] max-[1440px]:text-[22px]">
                        Automated Payments & Invoicing
                      </h5>
                    </div>

                    <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                      Collect rent securely and on time.
                    </p>
                  </div>
                </div>
              </div>
              {/* Card 3 */}
              <div className="group h-[500px] w-full [perspective:1000px]">
                <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                    {/* Image Section */}
                    <div className="h-[300px]">
                      <img
                        src={assets.images.card3}
                        alt="icon"
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                      <img
                        src={assets.images.Iconfront3}
                        alt="icon"
                        className="w-[40px] h-[40px]"
                      />
                      <p className="  mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                        Seamless Communication
                      </p>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <img
                      src={assets.images.back3}
                      alt="banner"
                      className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                    />
                    <div className="pt-4">
                      <img
                        src={assets.images.Iconback3}
                        className="w-[40px] h-[40px] mx-auto"
                      />
                      <h5 className="text-[28px] font-medium mt-4 text-[#DFF4EC] text-center max-[1440px]:text-[22px]">
                        Seamless Communication
                      </h5>
                    </div>

                    <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                      Keep tenants informed with messaging and notifications.
                    </p>
                  </div>
                </div>
              </div>
              {/* Card 4 */}
              <div className="group h-[500px] w-full [perspective:1000px]">
                <div className="relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  {/* Front */}
                  <div className="absolute inset-0 h-full flex flex-col [backface-visibility:hidden]">
                    {/* Image Section */}
                    <div className="h-[300px]">
                      <img
                        src={assets.images.card4}
                        alt="icon"
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 bg-white rounded-b-lg flex justify-center items-center flex-col gap-3 p-4">
                      <img
                        src={assets.images.Iconfront4}
                        alt="icon"
                        className="w-[40px] h-[40px]"
                      />
                      <p className=" mx-auto text-primary text-[28px] font-medium leading-1.1 text-center max-[1440px]:text-[22px]">
                        Secure Cloud Access
                      </p>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 h-full z-[11] rounded-lg text-white px-3 flex flex-col items-center justify-between [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <img
                      src={assets.images.back4}
                      alt="banner"
                      className="w-full h-full absolute object-cover z-[-11] rounded-lg"
                    />
                    <div className="pt-4">
                      <img
                        src={assets.images.Iconback4}
                        className="w-[40px] h-[40px] mx-auto"
                      />
                      <h5 className="text-[28px] font-medium mt-4 text-[#DFF4EC] text-center max-[1440px]:text-[22px]">
                        Secure Cloud Access
                      </h5>
                    </div>

                    <p className="text-[20px] font-light text-center mb-4 text-[#DFF4EC]">
                      Manage your properties anytime, anywhere.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-15 mb-1 max-w-[1840px] mx-auto px-3">
            {/* <h4 className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
              Our Vision
            </h4>
            <p className="text-[24px] font-light text-primary">
              We’re passionate about helping property owners grow their business
              while giving tenants a smoother, more convenient renting
              experience. Rento is more than just software — it’s your trusted
              partner in property management.
            </p> */}
            <motion.h4
              className="capitalize text-[100px] font-normal text-primary max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                type: 'spring',
                stiffness: 60,
                damping: 18,
              }}
            >
              Our Vision
            </motion.h4>

            {/* Paragraph */}
            <motion.p
              className="text-[24px] font-light text-primary mt-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: 'spring',
                stiffness: 50,
                damping: 18,
              }}
            >
              We’re passionate about helping property owners grow their business
              while giving tenants a smoother, more convenient renting
              experience. Rento is more than just software — it’s your trusted
              partner in property management.
            </motion.p>
            <div className="my-5 max-w-full">
              {/* <img
                src={assets.images.aboutBanner3}
                className="w-full h-full max-w-full"
                alt="banner"
              /> */}
              <motion.img
                src={assets.images.aboutBanner3}
                className="w-full h-full max-w-full object-cover"
                alt="banner"
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default About;
