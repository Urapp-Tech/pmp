import assets from '@/assets/images';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router';

function NewAboutSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll progress for this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'], // start animation when entering, end when leaving
  });

  // Smooth animation
  const progress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    mass: 0.3,
  });

  // Image animation (slightly parallax)
  const imageY = useTransform(progress, [0, 1], ['20px', '0px']);
  const imageOpacity = useTransform(progress, [0.2, 0.5], [0, 1]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative inset-0 w-full min-h-screen bg-primary flex items-center justify-center overflow-hidden"
    >
      <div className="text-center px-0 w-[96%] h-screen bg-primary relative rounded-[10px] border-0 border-solid border-[#ccc]">
        <motion.div
          className="absolute top-12 left-4 z-[111] max-w-[890px] pr-3 -translate-y-1/2"
          style={{
            y: useTransform(progress, [0, 0.3], ['50px', '-20px']),
            opacity: useTransform(progress, [0, 0.2], [0, 1]),
          }}
        >
          {/* Heading */}
          <h2 className="text-left text-[40px] font-medium text-[#DFF4EC] mb-6 max-[1550px]:text-[30px]">
            At Rento, we believe property management should be simple, smart,
            and stress-free.
          </h2>

          {/* Paragraphs */}
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

          {/* Button */}
          <button
         onClick={() => {
  window.scrollTo(0, 0);
  navigate("/about-us");
}}
            className="mt-6 cursor-pointer text-[#5EBFA1] hover:text-white flex gap-3 items-center"
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
        </motion.div>

        <motion.div
          className="absolute bottom-0 right-0 z-[1] max-w-[750px] max-[1550px]:max-w-[550px] max-[1440px]:opacity-50"
          style={{ y: imageY, opacity: imageOpacity }}
        >
          <img
            src={assets.images.aboutFixtwo}
            alt="banner"
            className="object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default NewAboutSection;
