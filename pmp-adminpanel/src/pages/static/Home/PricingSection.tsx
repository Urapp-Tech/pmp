import assets from '@/assets/images';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { BillingCycle, Plan } from './Home';

type PricingSectionProps = {
  billingCycle: BillingCycle;
  setBillingCycle: React.Dispatch<React.SetStateAction<BillingCycle>>;
  loadingPlans: boolean;
  defaultPlans: Array<Plan>;
  plans: Array<Plan>;
  openSubscribe: (p: Plan) => void;
};

function PricingSection({
  billingCycle,
  setBillingCycle,
  loadingPlans,
  defaultPlans,
  plans,
  openSubscribe,
}: PricingSectionProps) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  const [pricingStep, setPricingStep] = useState(1);

  const cycleNote = useMemo(
    () =>
      billingCycle === 'annual'
        ? '/property per month (billed monthly)'
        : '/property per month',
    [billingCycle]
  );

  const handleToggle = useCallback(() => {
    setBillingCycle((prev) => (prev === 'annual' ? 'monthly' : 'annual'));
  }, [setBillingCycle]);

  const priceFor = useCallback(
    (p: Plan) => (billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice),
    [billingCycle]
  );

  // Smooth scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const progress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    mass: 0.3,
  });

  const headingY = useTransform(progress, [0, 0.3], ['50px', '0px']);
  const headingOpacity = useTransform(progress, [0, 0.3], [0, 1]);

  const cardsY = useTransform(progress, [0.1, 0.5], ['50px', '0px']);
  const cardsOpacity = useTransform(progress, [0.1, 0.5], [0, 1]);

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative inset-0 w-full min-h-screen  bg-primary flex items-center justify-center overflow-hidden max-lg:min-h-auto"
    >
      <div className="w-full h-screen relative min-h-[650px] flex items-center justify-center price-step max-lg:h-auto">
        {pricingStep === 1 && (
          <>
            {/* Heading + toggle */}
            {/* <motion.div
              style={{ y: headingY, opacity: headingOpacity }}
              className="absolute top-[40px]  w-[1200px] max-[1200px]:w-[1000px] max-[992px]:w-[800px] flex flex-col gap-6 px-6"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={assets.images.priceIcon}
                    alt="icon"
                    className="w-[50px] h-[50px]"
                  />
                  <span className="text-[40px] text-[#DFF4EC] font-normal">
                    Pricing
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                      billingCycle === 'annual'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500'
                        : 'bg-gray-300'
                    }`}
                    onClick={handleToggle}
                    role="switch"
                    aria-checked={billingCycle === 'annual'}
                  >
                    <div
                      className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                        billingCycle === 'annual'
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-[#DFF4EC] font-light text-[20px] select-none">
                    Annually (Save up to 50%)
                  </span>
                </div>
              </div>
              <p className="text-[18px] font-light text-[#DFF4EC] mt-[-25px] leading-snug">
                Simple pricing. No hidden fees. Pay only for the properties you
                manage.
              </p>
            </motion.div> */}
            <motion.h2
              key="pricing-step1-heading"
              className="text-white font-bold absolute"
              initial={{ opacity: 0, y: -40 }}
              animate={{
                top: '40px',
                left: '50%',
                x: '-50%',
                y: '0%',
                fontSize: '48px',
                opacity: 1,
              }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <div className="w-[1200px] mx-auto flex flex-col justify-between gap-6 px-6 max-[1200px]:w-[1000px] max-[992px]:w-[800px] max-[991px]:w-[100vw] max-[991px]:items-center max-[991px]:text-center max-md:mb-10">
                <div className="w-full mx-auto flex items-center gap-2 justify-between max-[991px]:justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 80 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    viewport={{ once: true, amount: 0.6 }}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={assets.images.priceIcon}
                      alt="icon"
                      className="w-[50px] h-[50px]"
                    />
                    <span className="text-[40px] text-[#DFF4EC] font-normal">
                      Pricing
                    </span>
                  </motion.div>
                  {/* <div className="flex items-center space-x-2">
                    <div
                      className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                        billingCycle === 'annual'
                          ? 'bg-gradient-to-r from-green-500 to-blue-500'
                          : 'bg-gray-300'
                      }`}
                      onClick={handleToggle}
                      role="switch"
                      aria-checked={billingCycle === 'annual'}
                      aria-label="Toggle billing cycle"
                    >
                      <div
                        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                          billingCycle === 'annual'
                            ? 'translate-x-6'
                            : 'translate-x-0'
                        }`}
                      />
                    </div>
                    <span className="text-[#DFF4EC] font-light text-[20px] select-none">
                      Annually (Save up to 50%)
                    </span>
                  </div> */}
                </div>
                <p className="text-[18px] font-light text-[#DFF4EC] mt-[-25px] leading-snug max-[991px]:text-center">
                  Simple pricing. No hidden fees. Pay only for the properties
                  you manage.
                </p>
              </div>
            </motion.h2>

            {/* Pricing cards */}
            <motion.div
              style={{ y: cardsY, opacity: cardsOpacity }}
              className="absolute bottom-[40px] w-full overflow-auto max-md:bottom-[20px] "
            >
              <div className="flex justify-center gap-6 items-center flex-nowrap p-4 max-w-[1200px] mx-auto mt-5 max-[991px]:hidden">
                {loadingPlans ? (
                  <div className="text-[#DFF4EC] text-lg py-10">
                    Loading plans…
                  </div>
                ) : (
                  plans.slice(0, 3).map((p) => (
                    <div key={p.id} className="flex-1 min-w-[280px] h-full">
                      <div className="rounded-3xl bg-[#DFF4EC] group hover:bg-[#1665D8] text-[#242460] group-hover:text-white transition-all duration-500 p-8 shadow-xl">
                        <div className="space-y-4 mb-8 max-[1550px]:mb-3">
                          <h2 className="text-[36px] font-medium group-hover:text-white max-[1550px]:text-[28px]">
                            {p.name}
                          </h2>
                          <h1 className="text-[64px] font-medium tracking-tight leading-tight group-hover:text-white max-[1550px]:text-[36px]">
                            {priceFor(p)}
                            {p.currency}
                          </h1>
                          <p className="text-[20px] font-normal group-hover:text-white">
                            {cycleNote}
                          </p>
                        </div>

                        <ul className="space-y-4 mb-8 max-[1550px]:hidden">
                          {(p.features?.length
                            ? p.features
                            : defaultPlans.find((d) => d.code === p.code)
                              ?.features || []
                          ).map((f, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-xl mr-2 leading-none">
                                •
                              </span>
                              <span className="group-hover:text-white">
                                {f}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <p className="text-[20px] font-light mb-8 group-hover:text-white truncate">
                          {p.description ||
                            defaultPlans.find((d) => d.code === p.code)
                              ?.description ||
                            ''}
                        </p>

                        <button
                          className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
                          onClick={() => openSubscribe(p)}
                        >
                          Subscribe Now
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!loadingPlans && (
                <div className="max-[991px]:block hidden px-4 mt-5">
                  <Swiper
                    slidesPerView={1}
                    spaceBetween={24}
                    pagination={{ clickable: true }}
                    modules={[Pagination]}
                    className="priceing-responsive"
                  >
                    {plans.slice(0, 3).map((p) => (
                      <SwiperSlide key={p.id}>
                        <div className="flex justify-center items-stretch">
                          <div className="flex-1 min-w-[280px] h-full">
                            <div className="rounded-3xl bg-[#DFF4EC] group hover:bg-[#1665D8] text-[#242460] group-hover:text-white transition-all duration-500 p-8 shadow-xl">
                              <div className="space-y-4 mb-8">
                                <h2 className="text-[28px] font-medium group-hover:text-white">
                                  {p.name}
                                </h2>
                                <h1 className="text-[36px] font-medium tracking-tight leading-tight group-hover:text-white">
                                  {priceFor(p)}
                                  {p.currency}
                                </h1>
                                <p className="text-[18px] font-normal group-hover:text-white">
                                  {cycleNote}
                                </p>
                              </div>

                              <p className="text-[18px] font-light mb-8 group-hover:text-white">
                                {p.description ||
                                  defaultPlans.find((d) => d.code === p.code)
                                    ?.description ||
                                  ''}
                              </p>

                              <button
                                className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
                                onClick={() => openSubscribe(p)}
                              >
                                Subscribe Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

export default PricingSection;
