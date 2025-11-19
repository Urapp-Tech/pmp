import assets from '@/assets/images';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

const boxes = [
  {
    id: 1,
    title: '',
    description: '',
    bg: ``,
    titleColor: '',
    descColor: '',
  },
  {
    id: 2,
    title: '',
    description: '',
    bg: ``,
    titleColor: '',
    descColor: '',
  },
  {
    id: 3,
    title: 'Collect rent online securely',
    description:
      'Say goodbye to cash and late payments. With Rento, tenants can pay rent online in just a few clicks, handled with bank-level security — keeping payments safe for landlords and simple for tenants.',
    bg: `${assets.images.highBan1}`,
    titleColor: '#242460',
    descColor: '#242460',
  },
  {
    id: 4,
    title: 'Automated financial reports',
    description:
      'No more manual spreadsheets. Rento instantly generates detailed reports on rent collection, expenses, and property performance. Track your income and get a clear financial overview anytime, anywhere.',
    bg: `${assets.images.highBan2}`,
    titleColor: '#fff',
    descColor: '#fff',
  },
  {
    id: 5,
    title: 'Easy tenant & property management',
    description:
      'Keep everything organized in one place. Add new tenants, manage multiple properties, and access contracts or payment history in seconds. Rento simplifies daily operations so you can focus on growing your portfolio.',
    bg: `${assets.images.highBan3}`,
    titleColor: '#242460',
    descColor: '#242460',
  },
  {
    id: 6,
    title: 'Track and resolve maintenance requests',
    description:
      'Stay on top of maintenance without the hassle of endless calls. Tenants submit requests online , managers assign tasks and track progress until it’s resolved — ensuring every issue is handled quickly and transparently.”',
    bg: `${assets.images.highBan4}`,
    titleColor: '#fff',
    descColor: '#fff',
  },
];

function HighlightSection() {
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

  const numSlides = boxes.length;
  const step = 1 / numSlides;
  const cardOffset = 40;

  return (
    <section
      ref={sectionRef}
      className="relative bg-transparent text-white"
      style={{ height: `${numSlides * 110}vh` }}
    >
      <div
        id="highlights"
        className="sticky top-0 h-screen w-full flex items-center overflow-hidden justify-center"
      >
        {boxes.map((box, i) => {
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
                    Highlights
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
                  Rento isn’t just easier to use — it’s simpler to set up,
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    quicker with support and built with the right features to
                    grow with you.
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
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default HighlightSection;
