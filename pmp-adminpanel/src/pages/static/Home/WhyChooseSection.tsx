import assets from '@/assets/images';
import { motion } from 'framer-motion';

function WhyChooseSection() {
  return (
    <motion.section
      id="why"
      key="whychoose"
      className="relative w-full min-h-screen  flex items-center justify-center "
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)' }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}
    >
      <div className="text-center px-2 w-[96%] h-screen bg-[#DFF4EC] relative  rounded-[10px]">
        <div className="pt-10  top-10 left-10 z-[111]">
          <h2 className="text-left text-[40px] font-medium text-[#242460] mb-6 max-[1500px]:text-[30px]">
            Why Choose Us?
          </h2>
          <ul className="px-5 list-disc text-left text-primary text-[28px] font-normal leading-normal space-y-3 max-[1500px]:text-[24px] max-[1024px]:text-[24px] max-w-[600px] min-[1400px]:max-w-[800px] marker:text-[#242460]">
            <li>Built for Kuwait's property market</li>
            <li>Supports Arabic & English</li>
            <li>Transparent, easy-to-use dashboards</li>
            <li>Secure payments with bank-grade protection</li>
            <li>Save time, cut costs, and improve relationships</li>
          </ul>
        </div>

        <div className="absolute bottom-0 right-0 w-[750px] z-[1] max-w-full h-full">
          <img
            src={assets.images.whyBanner}
            alt="banner"
            className="w-full h-full  object-fill max-[1260px]:opacity-35"
          />
        </div>
      </div>
    </motion.section>
  );
}

export default WhyChooseSection;
