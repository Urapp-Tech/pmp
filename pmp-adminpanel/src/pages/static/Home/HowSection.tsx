import assets from '@/assets/images';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

const repBoxes = [
  {
    id: 1,
    title: 'Landlord Portal',
    description: 'Control your property portfolio',
    bg: `${assets.images.landBanner}`,
    titleColor: '#DFF4EC',
    descColor: '#DFF4EC',
    bullets: [
      'Dashboard showing total properties, tenants, invoices & tickets',
      'Add and manage multiple properties',
      'Automate rent collection & reminders',
      'View financial reports instantly',
    ],
  },
  {
    id: 2,
    title: 'Landlord Portal',
    description: 'Control your property portfolio',
    bg: `${assets.images.landBanner}`,
    titleColor: '#DFF4EC',
    descColor: '#DFF4EC',
    bullets: [
      'Dashboard showing total properties, tenants, invoices & tickets',
      'Add and manage multiple properties',
      'Automate rent collection & reminders',
      'View financial reports instantly',
    ],
  },
  {
    id: 3,
    title: 'Landlord Portal',
    description: 'Control your property portfolio',
    bg: `${assets.images.landBanner}`,
    titleColor: '#DFF4EC',
    descColor: '#DFF4EC',
    bullets: [
      'Dashboard showing total properties, tenants, invoices & tickets',
      'Add and manage multiple properties',
      'Automate rent collection & reminders',
      'View financial reports instantly',
    ],
  },
  {
    id: 4,
    title: 'Manager Portal',
    description: 'Simplify daily operations',
    bg: `${assets.images.mangerBanner}`,
    titleColor: '#242460',
    descColor: '#242460',
    bullets: [
      'Track assigned tenants, managed units, and rent collection',
      'Centralized database of tenants with full details',
      'Monitor occupancy, expenses, and invoices',
      'Handle maintenance requests smoothly',
    ],
  },
  {
    id: 5,
    title: 'Tenant Portal',
    description: 'Designed for convenience',
    bg: `${assets.images.tenantBanner}`,
    titleColor: '#DFF4EC',
    descColor: '#DFF4EC',
    bullets: [
      'Pay rent online quickly & securely',
      'Access lease contracts & payment history',
      'Submit and track maintenance requests',
      'Stay updated with reminders and receipts',
    ],
  },
  {
    id: 6,
    title: 'Super Admin Portal',
    description: 'Full platform control.',
    bg: `${assets.images.adminBanner}`,
    titleColor: '#242460',
    descColor: '#242460',
    bullets: [
      'Manage landlords, managers, tenants, and properties',
      'Oversee all permissions and platform usage',
      'Ensure smooth system performance',
    ],
  },
];

function HowSection() {
  const numSlides = repBoxes.length;
  const step = 1 / numSlides;
  const cardOffset = 40;

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 0.2,
  });
  return (
    <section
      ref={sectionRef}
      className="relative bg-transparent text-white"
      style={{ height: `${numSlides * 110}vh` }}
    >
      <div
        id="how"
        className="sticky top-0 h-screen w-full flex items-center overflow-hidden justify-center"
      >
        {repBoxes.map((box, i) => {
          const start = i * step;
          const end = (i + 1) * step;

          const baseY = cardOffset * i;
          const y = useTransform(
            smoothProgress,
            [start, end],
            [baseY + cardOffset, baseY]
          );

          let opacity;

          if (box.id === 1 || box.id === 2) {
            opacity = useTransform(
              smoothProgress,
              [start, start + step * 0.25, end - step * 0.15, end],
              [0, 1, 1, 0]
            );
          } else {
            opacity = useTransform(
              smoothProgress,
              [start, start + step * 0.25],
              [0, 1]
            );
          }

          const scale = useTransform(smoothProgress, [start, end], [0.97, 1]);

          if (box.id === 1) {
            return (
              <motion.div
                key={box.id}
                className={`mx-auto absolute bg-transparent rounded-2xl w-10/12 h-screen flex items-center justify-center`}
                style={{
                  y,
                  opacity: useTransform(
                    smoothProgress,
                    [start, start + step * 0.25, end - step * 0.15, end],
                    [1, 1, 1, 0]
                  ),
                  scale: 1,
                  zIndex: i + 1,
                }}
              >
                <div className="flex gap-6  ">
                  <img
                    src={assets.images.hiliteIcon}
                    alt="icon"
                    className="w-[80px] h-[80px]"
                  />
                  <span className="font-normal text-[64px] text-primary">
                    How it works
                  </span>
                </div>
              </motion.div>
            );
          }

          if (box.id === 2) {
            return (
              <motion.div
                key={box.id}
                className={`mx-auto flex-col absolute bg-transparent rounded-2xl w-10/12 h-screen flex items-center justify-center`}
                style={{
                  y,
                  opacity,
                  scale,
                  zIndex: i + 1,
                }}
              >
                <div className="text-[44px] mx-auto block text-primary text-center leading-tight">
                  Built for landlords, managers, and tenants—four smart portals,
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    tailored for every role.
                  </span>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              key={box.id}
              className={`bg-center bg-cover mx-auto absolute bg-white rounded-2xl w-10/12 h-screen flex items-center justify-center boxes-bg-set`}
              style={{
                backgroundImage: `url(${box.bg})`,
                y,
                opacity,
                scale,
                zIndex: i + 1,
              }}
              initial={false}
              transition={{ duration: 2, ease: 'easeInOut' }}
            >
              <div
                className={[
                  'p-6 rounded-lg absolute inset-0 transition-opacity duration-300',
                ].join(' ')}
              >
                <h3
                  className="text-[40px] font-normal mt-[-7px] mb-4 max-[1550px]:text-[34px]  max-[1400px]:text-[26px]"
                  style={{ color: box.titleColor }}
                >
                  {box.title}
                </h3>

                <p
                  className="text-[21px] font-light max-w-5xl max-[1600px]:text-[18px]"
                  style={{ color: box.descColor }}
                >
                  {box.description}
                </p>

                <ul className="list-disc pl-4 space-y-2 mt-5">
                  {box.bullets.map((bullet, idx) => (
                    <li
                      key={idx}
                      className="text-[18px] font-light"
                      style={{ color: box.descColor }}
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default HowSection;
