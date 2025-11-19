import assets from '@/assets/images';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
  const [pricingStep, setPricingStep] = useState(1);
  const [hideBottomImg, setHideBottomImg] = useState(false);
  const cycleNote = useMemo(
    () =>
      billingCycle === 'annual'
        ? '/property per month (billed annually)'
        : '/property per month',
    [billingCycle]
  );
  const handleToggle = useCallback(() => {
    setBillingCycle((prev) => (prev === 'annual' ? 'monthly' : 'annual'));
  }, [setBillingCycle]);
  const priceFor = useCallback(
    (p: Plan) => (billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice),
    []
  );
  return (
    <motion.section
      id="pricing"
      key="pricing"
      className="relative inset-0 w-full min-h-screen bg-primary flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="w-full h-screen  relative flex items-center justify-center price-step">
        <AnimatePresence mode="wait">
          {pricingStep === 0 && (
            <>
              <motion.h2
                key="pricing-step0"
                className="text-[#DFF4EC] font-medium absolute"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  top: '50%',
                  left: '50%',
                  x: '-50%',
                  y: '-50%',
                  fontSize: '96px',
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <div className="flex justify-center gap-3">
                  <img
                    src={assets.images.priceIcon}
                    alt="icon"
                    className="w-[135px] h-[135px]"
                  />
                  Pricing
                </div>
              </motion.h2>

              <AnimatePresence>
                {!hideBottomImg && (
                  <motion.div
                    key="pricing-bottom-img"
                    className="absolute  left-0 right-0 bottom-0 pointer-events-none select-none px-6"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <img
                      src={assets.images.bottomPrice}
                      alt="banner"
                      className="w-full h-auto max-w-[1220px] mx-auto"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {pricingStep === 1 && (
            <>
              {/* Heading + toggle row */}
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
                <div className="w-[1200px] mx-auto flex flex-col justify-between gap-6 px-6 max-[1200px]:w-[1000px] max-[992px]:w-[800px]">
                  <div className="w-full mx-auto flex items-center gap-2 justify-between">
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
                    </div>
                  </div>

                  <p className="text-[18px] font-light text-[#DFF4EC] mt-[-25px] leading-snug">
                    Simple pricing. No hidden fees. Pay only for the properties
                    you manage.
                  </p>
                </div>
              </motion.h2>

              <motion.div
                key="pricing-cards"
                className="absolute  bottom-[40px] w-full  overflow-auto "
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <div className="flex justify-center gap-6 items-center flex-wrap p-4 max-w-[1200px] mx-auto mt-5">
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

                <div className="flex justify-between gap-6 items-center flex-wrap max-w-[1200px] mx-auto my-3 px-2">
                  <p className="text-[18px] font-light text-[#DFF4EC] leading-snug">
                    Simple pricing. No hidden fees. Pay only for the properties
                    you manage.
                  </p>
                  <button
                    onClick={() => navigate('/admin-panel/auth/register')}
                    className="inline-flex items-center rounded-xl p-[2px] bg-gradient-to-r from-green-400 to-blue-500"
                  >
                    <span className="rounded-[10px] bg-[#141c4e] px-5 py-2">
                      <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent font-semibold">
                        Get Started
                      </span>
                    </span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

export default PricingSection;
