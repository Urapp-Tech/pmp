import assets from '@/assets/images';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

function NewAboutSection() {
  const navigate = useNavigate();
  return (
    <motion.section
      id="about"
      key="about"
      className="relative inset-0 w-full min-h-screen bg-primary flex items-center justify-center "
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-0  w-[96%] h-screen bg-primary relative rounded-[10px] border-0 border-solid border-[#ccc]">
        <div className="absolute top-10 left-4 z-[111] max-w-[890px] pr-3">
          <h2 className="text-left text-[40px] font-medium text-[#DFF4EC] mb-6 max-[1550px]:text-[30px]">
            At Rento, we believe property management should be simple, smart,
            and stress-free.
          </h2>
          <p className="text-left text-[24px] font-light text-[#DFF4EC] mb-4 max-[1550px]:text-[20px]">
            We built Rento to empower landlords, property managers, and tenants
            with a modern platform that brings everything into one easy-to-use
            solution. From managing properties and tenants to tracking payments,
            sending invoices, and keeping records secure, Rento keeps you in
            control with just a few clicks.
          </p>
          <p className="text-left text-[24px] font-light text-[#DFF4EC] mb-4 max-[1550px]:text-[20px]">
            Our mission is to transform the rental experience in Kuwait by
            combining technology, transparency, and trust. Whether you own a
            single villa or manage a large portfolio of buildings, Rento is
            designed to save you time, reduce paperwork, and improve
            communication.
          </p>
          <button
            onClick={() => navigate('/about-us')}
            className="cursor-pointer mt-3 text-[#5EBFA1] hover:text-white flex gap-3 items-center"
          >
            Read more
            <span>
              <img
                src={assets.images.arrowRight}
                alt="icon"
                className="w-[20px] h-[20px]"
              />
            </span>
          </button>
        </div>

        <div className="absolute bottom-0 right-0 z-[1] max-w-[750px] max-[1550px]:max-w-[550px] max-[1440px]:opacity-50">
          <img
            src={assets.images.aboutFixtwo}
            alt="banner"
            className="object-contain"
          />
        </div>
      </div>
    </motion.section>
  );
}

export default NewAboutSection;
