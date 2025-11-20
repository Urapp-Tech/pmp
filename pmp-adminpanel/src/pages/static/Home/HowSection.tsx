import assets from '@/assets/images';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import StackedCards from './StackCards';

type StackedCard = {
  id: string;
  title: string;
  titleColor: string;
  description: string;
  descriptionColor: string;
  imageSrc?: string;
  imageAlt?: string;
  progressRange: [number, number];
  yRange: [string, string];
  rotateRange: [number, number];
  scaleRange: [number, number];
  bullets?: Array<string>;
};

const cards: Array<StackedCard> = [
  {
    id: 'how-1',
    title: 'Landlord Portal',
    description: 'Control your property portfolio',
    imageSrc: `${assets.images.landBanner}`,
    titleColor: '#DFF4EC',
    descriptionColor: '#DFF4EC',
    bullets: [
      'Dashboard showing total properties, tenants, invoices & tickets',
      'Add and manage multiple properties',
      'Automate rent collection & reminders',
      'View financial reports instantly',
    ],
    progressRange: [0.0, 0.23],
    yRange: ['60vh', '-5rem'],
    rotateRange: [-10, 0],
    scaleRange: [1.1, 1],
  },
  {
    id: 'how-2',
    title: 'Manager Portal',
    description: 'Simplify daily operations',
    imageSrc: `${assets.images.mangerBanner}`,
    titleColor: '#242460',
    descriptionColor: '#242460',
    bullets: [
      'Track assigned tenants, managed units, and rent collection',
      'Centralized database of tenants with full details',
      'Monitor occupancy, expenses, and invoices',
      'Handle maintenance requests smoothly',
    ],
    progressRange: [0.25, 0.48],
    yRange: ['60vh', '0rem'],
    rotateRange: [-10, 0],
    scaleRange: [1.1, 1],
  },
  {
    id: 'how-3',
    title: 'Tenant Portal',
    description: 'Designed for convenience',
    imageSrc: `${assets.images.tenantBanner}`,
    titleColor: '#DFF4EC',
    descriptionColor: '#DFF4EC',
    bullets: [
      'Pay rent online quickly & securely',
      'Access lease contracts & payment history',
      'Submit and track maintenance requests',
      'Stay updated with reminders and receipts',
    ],
    progressRange: [0.5, 0.73],
    yRange: ['60vh', '5rem'],
    rotateRange: [-10, 0],
    scaleRange: [1.1, 1],
  },
  {
    id: 'how-4',
    title: 'Super Admin Portal',
    description: 'Full platform control.',
    imageSrc: `${assets.images.adminBanner}`,
    titleColor: '#242460',
    descriptionColor: '#242460',
    bullets: [
      'Manage landlords, managers, tenants, and properties',
      'Oversee all permissions and platform usage',
      'Ensure smooth system performance',
    ],
    progressRange: [0.75, 1],
    yRange: ['60vh', '9rem'],
    rotateRange: [-10, 0],
    scaleRange: [1.1, 1],
  },
];

const DEFAULT_VIEWPORT_WIDTH = 1920;
const DEFAULT_VIEWPORT_HEIGHT = 1080;

const adjustForViewportHeight = (value: number, height: number) => {
  if (height >= 900) return value;
  if (height >= 768) return value * 1.05;
  if (height >= 700) return value * 1.1;
  return value * 1.2;
};

const calculateSectionHeight = (
  baseHeight: number,
  width: number,
  height: number
) => {
  let scaled = baseHeight;
  if (width < 1024) {
    scaled = baseHeight * 0.85;
  } else if (width < 1200) {
    scaled = baseHeight * 0.92;
  } else if (width < 1366) {
    scaled = baseHeight * 0.96;
  }
  return adjustForViewportHeight(scaled, height);
};

const calculateStackHeight = (width: number, height: number) => {
  let scaled = 320;
  if (width < 1024) {
    scaled = 210;
  } else if (width < 1366) {
    scaled = 260;
  }
  return adjustForViewportHeight(scaled, height);
};
function HowSection() {
  const sectionRef = useRef(null);
  const baseSectionHeight = 20 + (cards.length + 1) * 80;
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : DEFAULT_VIEWPORT_WIDTH
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : DEFAULT_VIEWPORT_HEIGHT
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sectionHeight = calculateSectionHeight(
    baseSectionHeight,
    viewportWidth,
    viewportHeight
  );
  const cardsStackHeight = calculateStackHeight(
    viewportWidth,
    viewportHeight
  );

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 0.2,
  });

  //
  // HEADING
  //
  const headingY = useTransform(progress, [0, 0.25], ['0%', '-50%']);
  const headingOpacity = useTransform(progress, [0, 0.25], [1, 0]);

  //
  // CARDS — appear after text fades out
  //
  const cardsOpacity = useTransform(progress, [0.5, 1], [1, 1]);

  return (
    <section
      id="how"
      ref={sectionRef}
      className="relative bg-transparent text-white overflow-clip"
      style={{ height: `${sectionHeight}vh` }}
    >
      {/* --- HEADING (sticky) --- */}
      <motion.div
        className="sticky top-0 w-full h-screen flex items-center justify-center z-30"
        style={{ y: headingY, opacity: headingOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.9,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          viewport={{ once: true, amount: 0.6 }}
        >
          <div className="flex items-center mb-4 justify-center">
            <img src={assets.images.hiliteIcon} className="w-[80px] h-[80px]" />
            <span className="font-normal text-[64px] text-primary">
              How it works
            </span>
          </div>
          <div className="text-[34px] mx-auto max-w-[1200px] text-primary text-center leading-tight">
            Built for landlords, managers, and tenants—four smart portals,
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              tailored for every role.
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* --- CARDS SECTION --- */}
      <motion.div
        className="sticky top-0 w-full z-10 flex items-center justify-center"
        style={{ opacity: cardsOpacity, height: `${cardsStackHeight}vh` }}
      >
        <StackedCards cards={cards} />
      </motion.div>
    </section>
  );
}

export default HowSection;
