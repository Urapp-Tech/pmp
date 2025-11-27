import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const stats = [
  { targetValue: 25, label: 'Team Members' },
  { targetValue: 12, label: 'Property Listed' },
  { targetValue: 100, label: 'Happy Clients' },
  { targetValue: 20, label: 'Projects Completed' },
];

// A custom hook for the counting animation
const useCounter = (targetValue: number, run: boolean) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!run) return;

    // The duration of the animation in milliseconds
    const duration = 1500;
    const startTimestamp = performance.now();

    const animateCount = (timestamp: number) => {
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * targetValue);
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [run, targetValue]);

  return count;
};

// Reusable component for a single stat item
const StatItem = ({
  targetValue,
  label,
}: {
  targetValue: number;
  label: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Custom hook to run the animation
  const count = useCounter(targetValue, isVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing once it's visible to run the counter only once
          observer.disconnect();
        }
      },
      {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.5, // Trigger when 50% of the element is visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup the observer when the component unmounts
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="text-[120px]  font-normal text-[#1a2e58] max-[1440px]:text-[90px] max-[768px]:text-[50px]">
        {count}k
      </div>
      <div className="mt-2 text-[30px] font-normal  text-[#1a2e58] max-[1440px]:text-[24px] max-[768px]:text-[18px] ">
        {label}
      </div>
    </div>
  );
};

// Main component that combines the stat items
const CounterSection = () => {
  // return (
  //   <div className="bg-[#DFF4EC]  py-16 sm:py-24 rounded-lg  ">
  //     <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
  //       <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
  //         <StatItem targetValue={25} label="Team Members" />
  //         <StatItem targetValue={12} label="Property Listed" />
  //         <StatItem targetValue={100} label="Happy Clients" />
  //         <StatItem targetValue={20} label="Projects Completed" />
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="bg-[#DFF4EC] py-16  max-lg:py-8 rounded-lg">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.6,
                delay: index * 0.25, // ⭐ each item animates one-by-one
              }}
            >
              <StatItem targetValue={item.targetValue} label={item.label} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CounterSection;
