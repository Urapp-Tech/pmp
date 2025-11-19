import Header from '@/components/Static/Header';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

type HeroSectionProps = {
  showHeader: boolean;
};
function HeroSection({ showHeader }: HeroSectionProps) {
  const navigate = useNavigate();
  return (
    <motion.section
      id="hero"
      key="hero"
      className="relative w-full min-h-screen home-bg"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: showHeader ? 0 : -90, opacity: showHeader ? 1 : 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[1000] will-change-transform py-0"
      >
        <Header customClass="bg-white/80 backdrop-blur-xl shadow-sm py-0" />
      </motion.div>
      <div className="h-[72px]" />

      <div className="flex justify-end px-20 max-[1260px]:justify-center max-[576px]:px-2 translate-y-[12%]">
        <p className="text-[36px] font-light text-primary mt-10 max-w-[445px] leading-[45px] max-[1260px]:max-w-full max-[1260px]:text-[30px] max-[1260px]:text-center max-[992px]:text-[24px] max-[992px]:leading-tight max-[768px]:text-[19px] max-[576px]:max-w-full">
          From rent collection to maintenance requests — manage everything in
          one place.
        </p>
      </div>

      <div className="flex justify-between items-end pb-10 pl-10 pr-20 absolute bottom-0 left-0 right-0 max-[1260px]:flex-col max-[1260px]:items-center max-[576px]:px-0">
        <h3 className="text-[4vw] font-normal text-primary leading-tight max-w-[740px] max-[1260px]:text-center max-[768px]:text-[40px] max-[576px]:text-[24px]">
          Smarter Property <br /> Management in Kuwait
        </h3>

        <div className="flex gap-4 mt-6 justify-end md:justify-start max-[576px]:flex-col">
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
        </div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
