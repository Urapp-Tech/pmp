import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router';

function HeroSection() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const content = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const bgY = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, -120]);

  return (
    <motion.section
      id="hero"
      key="hero"
      ref={ref}
      className="relative w-full min-h-screen home-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ y: bgY }}
    >
      <div className="h-[72px]" />

      <motion.div
        className="flex justify-end px-20 max-[1260px]:justify-center max-[576px]:px-2 translate-y-[12%]"
        style={{ y: content }}
      >
        <motion.p
          className="text-[36px] font-light text-primary mt-10 max-w-[445px] leading-[45px] max-[1260px]:max-w-full max-[1260px]:text-[30px] max-[1260px]:text-center max-[992px]:text-[24px] max-[992px]:leading-tight max-[768px]:text-[19px] max-[576px]:max-w-full"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
        >
          From rent collection to maintenance requests manage everything in one
          place.
        </motion.p>
      </motion.div>
      <motion.div
        className="flex justify-between items-end pb-10 pl-10 pr-20 absolute bottom-0 left-0 right-0 max-[1260px]:flex-col max-[1260px]:items-center max-[576px]:px-0"
        style={{ y: content }}
      >
        <motion.h3
          className="text-[4vw] font-normal text-primary leading-tight max-w-[740px] max-[1260px]:text-center max-[768px]:text-[40px] max-[576px]:text-[24px]"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
        >
          Smarter Property <br /> Management in Kuwait
        </motion.h3>
        <motion.div
          className="flex gap-4 mt-6 justify-end md:justify-start max-[576px]:flex-col"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 1.0 }}
        >
          <button
            onClick={() => navigate('/admin-panel/auth/register')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow-md hover:opacity-90 transition max-[576px]:text-[14px]"
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate('/contact-us')}
            className="px-6 py-3 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50 transition max-[576px]:text-[14px]"
          >
            Book a Demo
          </button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

export default HeroSection;
