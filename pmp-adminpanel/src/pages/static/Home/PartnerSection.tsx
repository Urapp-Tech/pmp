import { motion } from 'framer-motion';

function PartnerSection() {
  return (
    <motion.section
      id="partner"
      key="partner"
      className="relative w-full min-h-screen bg-primary flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-6">
        <p className="text-white max-w-[800px] mx-auto leading-tight text-[64px] max-[1260px]:text-[50px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
          Rento is more than just property management software,
          <span className="text-[64px]  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            it's your growth partner.
          </span>
        </p>
      </div>
    </motion.section>
  );
}

export default PartnerSection;
