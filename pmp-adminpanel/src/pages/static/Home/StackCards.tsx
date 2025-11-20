import {
  motion,
  MotionValue,
  useScroll,
  useSpring,
  useTransform,
  useWillChange,
} from 'framer-motion';
import { FC, useEffect, useRef, useState } from 'react';

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

type StackedCardsProps = {
  title?: string;
  cards: StackedCard[];
};

type CardRanges = {
  progressRange: [number, number];
  yRange: [string, string];
  rotateRange: [number, number];
  scaleRange: [number, number];
};

type StackedCardItemProps = {
  index: number;
  card: StackedCard;
  scrollYProgress: MotionValue<number>;
  ranges: CardRanges;
};

const useIsDesktop = (minWidth = 1000) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= minWidth;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const update = (event: MediaQueryListEvent) => setIsDesktop(event.matches);

    setIsDesktop(mq.matches);
    mq.addEventListener('change', update);

    return () => mq.removeEventListener('change', update);
  }, [minWidth]);

  return isDesktop;
};

const StackedCardItem: FC<StackedCardItemProps> = ({
  index,
  card,
  scrollYProgress,
  ranges,
}) => {
  const isDesktop = useIsDesktop();
  const willChange = useWillChange();

  // Wrap transforms with spring for smooth animation
  const y = useSpring(
    useTransform(scrollYProgress, ranges.progressRange, ranges.yRange),
    { stiffness: 120, damping: 20, mass: 0.3 }
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, ranges.progressRange, ranges.rotateRange),
    { stiffness: 120, damping: 20, mass: 0.3 }
  );
  const scale = useSpring(
    useTransform(scrollYProgress, ranges.progressRange, ranges.scaleRange),
    { stiffness: 120, damping: 20, mass: 0.3 }
  );

  const style = isDesktop
    ? {
        y,
        rotateX,
        scale,
        z: `${index * 10}px`,
        willChange,
      }
    : undefined;

  return (
    <motion.div className="stacked-card" style={style}>
      <div className="stacked-card__content">
        <h3 className="stacked-card__title" style={{ color: card.titleColor }}>
          {card.title}
        </h3>
        <p
          className="stacked-card__description text-[18px] font-light leading-snug"
          style={{ color: card.descriptionColor }}
        >
          {card.description}
        </p>
      </div>
      {card.bullets ? (
        <ul className="list-disc pl-14 space-y-1 mt-1">
          {card.bullets.map((bullet, idx) => (
            <li
              key={idx}
              className="text-[16px] font-light"
              style={{ color: card.descriptionColor }}
            >
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
      {card.imageSrc && (
        <div className="stacked-card__media">
          <img src={card.imageSrc} alt={card.imageAlt ?? ''} />
        </div>
      )}
    </motion.div>
  );
};

export const StackedCards: FC<StackedCardsProps> = ({ cards }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 50%', 'end end'],
  });

  if (cards.length === 0) return null;

  return (
    <>
      <style>{`
        .stacked-cards-wrapper {
          // padding-bottom: max(10rem, 12rem);
          
          width: 100%;
        }

        .stacked-cards-wrapper__title {
          margin-bottom: 2rem;
          font-size: 2rem;
        }

        .stacked-cards {
          position: relative;
          height: 300vh;
        }

        .stacked-cards__card-wrapper {
          perspective: 100vw;
          position: sticky;
          // top: 0;
          // height: 100vh;
            top: 250px; /* <-- changed from 0 to 100px */
  height: calc(100vh - 200px); /* <-- optional, makes full height visible below top */
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stacked-card {
          position: absolute;
          width: 100%;
          max-width: 990px;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          color: #000000;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.18);
          transform-style: preserve-3d;
          min-height: 750px;
        }

        .stacked-card:not(:last-child) {
          margin-bottom: 1.5rem;
        }

        .stacked-card__content {
          // padding: 3rem 2rem 2rem;
          padding: 2rem 2rem 12px;

        }

        .stacked-card__title {
          margin: 0 0 27px;
          font-size: 1.5rem;
        }

        .stacked-card__description {
          margin: 0;
          color: #555555;
        }

        .stacked-card__media {
          width: 100%;
          aspect-ratio: 2.55;
        }

        .stacked-card__media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position:absolute;
          top:0;
          z-index:-1;
        }

        @media (max-width: 999px) {
          .stacked-cards {
            height: auto;
          }

          .stacked-cards__card-wrapper {
            position: static;
            height: auto;
            display: block;
          }

          .stacked-card {
            position: static;
            margin-bottom: 1.5rem;
            transform: none !important;
          }
        }
      `}</style>

      <section className="stacked-cards-wrapper">
        <div ref={containerRef} className="stacked-cards">
          <div className="stacked-cards__card-wrapper">
            {cards.map((card, index) => (
              <StackedCardItem
                key={index}
                index={index}
                card={card}
                scrollYProgress={scrollYProgress}
                ranges={{
                  progressRange: card.progressRange,
                  rotateRange: card.rotateRange,
                  scaleRange: card.scaleRange,
                  yRange: card.yRange,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default StackedCards;
