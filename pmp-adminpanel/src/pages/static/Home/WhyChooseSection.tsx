import assets from '@/assets/images';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

function WhyChooseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Track scroll progress
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'], // start when entering, end when leaving
  });

  // Smooth spring for natural movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    mass: 0.3,
  });

  // Animate heading
  const headingY = useTransform(smoothProgress, [0, 0.3], ['50px', '0px']);
  const headingOpacity = useTransform(smoothProgress, [0, 0.3], [0, 1]);

  // Animate list
  const listY = useTransform(smoothProgress, [0.1, 0.4], ['50px', '0px']);
  const listOpacity = useTransform(smoothProgress, [0.1, 0.4], [0, 1]);

  // Image parallax
  const imageY = useTransform(smoothProgress, [0, 1], ['20px', '0px']);
  const imageOpacity = useTransform(smoothProgress, [0.2, 0.5], [0, 1]);

  return (
    <section
      id="why"
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="text-center px-2 w-[96%] h-screen bg-[#DFF4EC] relative rounded-[10px]">
        {/* Heading */}
        <motion.div
          style={{ y: headingY, opacity: headingOpacity }}
          className="pt-10 top-10 left-10 z-[111]"
        >
          <h2 className="text-left text-[40px] font-medium text-[#242460] mb-6 max-[1500px]:text-[30px]">
            Why Choose Us?
          </h2>
        </motion.div>

        {/* List */}
        <motion.ul
          style={{ y: listY, opacity: listOpacity }}
          className="px-5 list-disc text-left text-primary text-[28px] font-normal leading-normal space-y-3 max-[1500px]:text-[24px] max-[1024px]:text-[24px] max-w-[600px] min-[1400px]:max-w-[800px] marker:text-[#242460]"
        >
          <li>Built for Kuwait's property market</li>
          <li>Supports Arabic & English</li>
          <li>Transparent, easy-to-use dashboards</li>
          <li>Secure payments with bank-grade protection</li>
          <li>Save time, cut costs, and improve relationships</li>
        </motion.ul>

        {/* Image */}
        <motion.div
          style={{ y: imageY, opacity: imageOpacity }}
          className="absolute bottom-0 right-0 w-[750px] z-[1] max-w-full h-full"
        >
          <img
            src={assets.images.whyBanner}
            alt="banner"
            className="w-full h-full object-fill max-[1260px]:opacity-35"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default WhyChooseSection;
