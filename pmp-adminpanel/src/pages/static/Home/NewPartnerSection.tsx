import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

function NewPartnerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track scroll progress of this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Smooth progress for natural movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    mass: 0.3,
  });

  // Animate vertical movement and opacity
  const y = useTransform(smoothProgress, [0, 1], ['50px', '0px']);
  const opacity = useTransform(smoothProgress, [0, 0.3], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen bg-primary flex items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1.1,
          ease: [0.65, 0, 0.35, 1], // ease-in-out quart (Lenis-like)
        }}
        viewport={{ once: true, amount: 0.6 }}
        className="text-center px-6"
      >
        <p className="text-left text-white mx-auto text-[70px] leading-tight max-w-[1000px] max-[1440px]:text-[80px] max-[1024px]:text-[60px] max-[768px]:text-[40px] max-[425px]:text-[32px]">
          At Rento, we believe property management should be simple,
          <span className=" font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent     ">
            smart, and stress-free.
          </span>
        </p>
      </motion.div>
    </section>
  );
}

export default NewPartnerSection;
