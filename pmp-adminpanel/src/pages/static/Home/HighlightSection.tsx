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
    id: 'highlight_1',
    title: 'Collect rent online securely',
    titleColor: '#242460',
    description:
      'Say goodbye to cash and late payments. With Rento, tenants can pay rent online in just a few clicks, handled with bank-level security — keeping payments safe for landlords and simple for tenants.',
    descriptionColor: '#242460',
    imageSrc: `${assets.images.highBan1}`,
    progressRange: [0.0, 0.23],
    yRange: ['60vh', '-5rem'],
    rotateRange: [-10, 0],
    scaleRange: [1.1, 1],
  },
  {
    id: 'highlight_2',
    title: 'Automated financial reports',
    titleColor: '#DFF4EC',
    description:
      'No more manual spreadsheets. Rento instantly generates detailed reports on rent collection, expenses, and property performance. Track your income and get a clear financial overview anytime, anywhere.',
    descriptionColor: '#DFF4EC',
    imageSrc: `${assets.images.highBan2}`,
    progressRange: [0.25, 0.48],
    yRange: ['60vh', '1rem'],
    rotateRange: [-10, 0],
    scaleRange: [1.1, 1],
  },
  {
    id: 'highlight_3',
    title: 'Easy tenant & property management',
    titleColor: '#242460',
    description:
      'Keep everything organized in one place. Add new tenants, manage multiple properties, and access contracts or payment history in seconds. Rento simplifies daily operations so you can focus on growing your portfolio.',
    descriptionColor: '#242460',
    imageSrc: `${assets.images.highBan3}`,
    progressRange: [0.5, 0.73],
    yRange: ['60vh', '7rem'],
    rotateRange: [-10, 0],
    scaleRange: [1.1, 1],
  },
  {
    id: 'highlight_4',
    title: 'Track and resolve maintenance requests',
    titleColor: '#DFF4EC',
    description:
      'Stay on top of maintenance without the hassle of endless calls. Tenants submit requests online , managers assign tasks and track progress until it’s resolved — ensuring every issue is handled quickly and transparently.”',
    descriptionColor: '#DFF4EC',
    imageSrc: `${assets.images.highBan4}`,
    progressRange: [0.75, 1],
    yRange: ['60vh', '12rem'],
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

function HighlightSection() {
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

  // Cards appear after heading fades out
  const cardsOpacity = useTransform(progress, [0.5, 1], [1, 1]);

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className="relative bg-transparent text-white"
      style={{ height: `${sectionHeight}vh` }}
    >
      <motion.div
        className="sticky top-0 w-full h-screen flex items-center justify-center z-30"
        style={{
          y: headingY,
          opacity: headingOpacity,
          scale: 1,
          zIndex: 1,
        }}
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
          <div className="flex mb-4 items-center justify-center">
            <img
              src={assets.images.hiliteIcon}
              alt="icon"
              className="w-[80px] h-[80px]"
            />
            <span className="font-normal text-[64px] text-primary">
              Highlights
            </span>
          </div>
          <div className="text-[34px] max-w-[1200px] mx-auto block text-primary text-center leading-tight">
            Rento isn’t just easier to use — it’s simpler to set up,
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              quicker with support and built with the right features to grow
              with you.
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

export default HighlightSection;
