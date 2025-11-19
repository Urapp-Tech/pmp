import { motion } from 'framer-motion';

function NewPartnerSection() {
  return (
    <motion.section
      id="about-intro"
      key="about-intro"
      className="relative w-full min-h-screen bg-primary flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-6 ">
        {/* <h2 className="text-white text-5xl font-bold mb-6">Our Partners</h2> */}
        <p className="text-left text-white mx-auto text-[100px] leading-tight max-w-[1400px] max-[1440px]:text-[80px] max-[1024px]:text-[60px] max-[768px]:text-[40px] max-[425px]:text-[32px]">
          At Rento, we believe property management should be simple,
          <span className=" font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent     ">
            smart, and stress-free.
          </span>
        </p>
      </div>
    </motion.section>
  );
}

export default NewPartnerSection;
