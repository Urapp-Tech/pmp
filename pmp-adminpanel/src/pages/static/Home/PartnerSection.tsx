import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

function PartnerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll progress for this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'], // start when section enters, end when leaving
  });

  // Smooth progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    mass: 0.3,
  });

  // Animate vertical movement and opacity based on scroll
  const y = useTransform(smoothProgress, [0, 1], ['50px', '0px']);
  const opacity = useTransform(smoothProgress, [0, 0.3], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-primary flex items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        }}
        viewport={{ once: true, amount: 0.6 }}
        className="text-center px-6"
      >
        <p className=" text-white max-w-[992px] mx-auto leading-tight text-[60px] max-[1260px]:text-[40px] max-[1024px]:text-[35px] max-[768px]:text-[26px]">
          Rento is more than just property management software,
          <span className="text-[60px]  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            {' '}
            it’s your growth partner.
          </span>
        </p>
      </motion.div>
    </section>
  );
}

export default PartnerSection;
