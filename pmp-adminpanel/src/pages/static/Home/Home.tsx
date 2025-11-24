import SelectedPlanModal from '@/components/Static/Model';
import { useToast } from '@/hooks/use-toast';
import plan from '@/services/adminapp/static';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ContactSection from './ContactSection';
import FooterSection from './FooterSection';
import HeroSection from './HeroSection';
import HighlightSection from './HighlightSection';
import HomeResponsive from './Home-responsive';
import HowSection from './HowSection';
import NewAboutSection from './NewAboutSection';
import NewPartnerSection from './NewPartnerSection';
import PartnerSection from './PartnerSection';
import PricingSection from './PricingSection';
import WhyChooseSection from './WhyChooseSection';
export type BillingCycle = 'annual' | 'monthly';
// import { useState } from 'react';

export type Plan = {
  id: string;
  code: string;
  name: string;
  description?: string;
  currency: string;
  monthlyPrice: number;
  annualPrice: number;
  features?: string[];
};

const defaultPlans: Plan[] = [
  {
    id: 'building',
    code: 'building',
    name: 'Building',
    description: '',
    currency: 'KD',
    monthlyPrice: 40,
    annualPrice: 40,
    features: [
      'Post One Property Each package.',
      'Option to add high-quality photos/videos',
      'Easy property management dashboard',
    ],
  },
  {
    id: 'villa_house',
    code: 'villa_house',
    name: 'Villa/House',
    description: '',
    currency: 'KD',
    monthlyPrice: 20,
    annualPrice: 20,
    features: [
      'Post One Property Each package.',
      'Option to add high-quality photos/videos',
      'Easy property management dashboard',
    ],
  },
  {
    id: 'apartment',
    code: 'apartment',
    name: 'Apartment',
    description: '',
    currency: 'KD',
    monthlyPrice: 10,
    annualPrice: 10,
    features: [
      'Post One Property Each package.',
      'Option to add high-quality photos/videos',
      'Easy property management dashboard',
    ],
  },
];

const Home: React.FC = () => {
  const authState: any = useSelector((state: any) => state.authState);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1000);

  const navigate = useNavigate();
  const { toast } = useToast();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [showHeader, setShowHeader] = useState(true);
  const lastYRef = useRef<number>(
    typeof window !== 'undefined' ? window.scrollY : 0
  );
  const tickingRef = useRef(false);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;

      if (Math.abs(dy) < 6) return;

      if (y < 64) {
        setShowHeader(true);
        lastYRef.current = y;
        return;
      }

      setShowHeader(dy <= 0);
      lastYRef.current = y;
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        handle();
        tickingRef.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slowScrollState = useRef({
    targetY: typeof window !== 'undefined' ? window.scrollY : 0,
    rafId: 0 as number | 0,
    animating: false,
    paused: false,
  });

  useEffect(() => {
    const isHTMLElement = (el: any): el is HTMLElement =>
      el && typeof el === 'object' && 'closest' in el;

    const isManagedZone = (t: EventTarget | null) => {
      if (!isHTMLElement(t)) return false;
      return !!(t.closest(' ') || t.closest(''));
    };

    const stopAnimationIfRunning = () => {
      const st = slowScrollState.current;
      if (st.animating && st.rafId) {
        cancelAnimationFrame(st.rafId);
        st.rafId = 0;
        st.animating = false;
      }
    };

    const step = () => {
      const st = slowScrollState.current;
      if (st.paused) {
        stopAnimationIfRunning();
        return;
      }
      const { targetY } = st;
      const currentY = window.scrollY;
      const nextY = currentY + (targetY - currentY) * 0.12;
      window.scrollTo(0, nextY);

      if (Math.abs(targetY - nextY) > 0.5) {
        st.rafId = requestAnimationFrame(step);
        st.animating = true;
      } else {
        window.scrollTo(0, targetY);
        st.animating = false;
        if (st.rafId) cancelAnimationFrame(st.rafId);
        st.rafId = 0;
      }

      const onEnterManaged = () => {
        slowScrollState.current.paused = true;

        if (
          slowScrollState.current.animating &&
          slowScrollState.current.rafId
        ) {
          cancelAnimationFrame(slowScrollState.current.rafId);
          slowScrollState.current.rafId = 0;
          slowScrollState.current.animating = false;
        }
      };
      const onLeaveManaged = () => {
        slowScrollState.current.paused = false;
        slowScrollState.current.targetY = window.scrollY;
      };

      window.addEventListener(
        'rento:enterManaged',
        onEnterManaged as EventListener
      );
      window.addEventListener(
        'rento:leaveManaged',
        onLeaveManaged as EventListener
      );

      return () => {
        window.removeEventListener(
          'rento:enterManaged',
          onEnterManaged as EventListener
        );
        window.removeEventListener(
          'rento:leaveManaged',
          onLeaveManaged as EventListener
        );
      };
    };

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented) return;

      if (isManagedZone(e.target)) {
        stopAnimationIfRunning();
        return;
      }

      if (slowScrollState.current.paused) return;

      e.preventDefault();

      const scale = 0.18;

      const dy = e.deltaY;
      const moderated = Math.sign(dy) * Math.min(Math.abs(dy), 140);

      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const viewport = window.innerHeight;

      const nextTarget = Math.max(
        0,
        Math.min(
          docHeight - viewport,
          slowScrollState.current.targetY + moderated * scale
        )
      );

      slowScrollState.current.targetY = nextTarget;

      if (!slowScrollState.current.animating) {
        slowScrollState.current.animating = true;
        slowScrollState.current.rafId = requestAnimationFrame(step);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    const setPaused = (v: boolean) => {
      slowScrollState.current.paused = v;
      if (v) stopAnimationIfRunning();
    };

    const hl = document.getElementById('highlights');
    const how = document.getElementById('how');

    const enter = () => setPaused(true);
    const leave = () => setPaused(false);
    const touchStart = () => setPaused(true);
    const touchEnd = () => setPaused(false);

    hl?.addEventListener('pointerenter', enter);
    hl?.addEventListener('pointerleave', leave);
    hl?.addEventListener('touchstart', touchStart, { passive: true });
    hl?.addEventListener('touchend', touchEnd);

    how?.addEventListener('pointerenter', enter);
    how?.addEventListener('pointerleave', leave);
    how?.addEventListener('touchstart', touchStart, { passive: true });
    how?.addEventListener('touchend', touchEnd);

    slowScrollState.current.targetY = window.scrollY;

    return () => {
      window.removeEventListener('wheel', onWheel as any);
      hl?.removeEventListener('pointerenter', enter);
      hl?.removeEventListener('pointerleave', leave);
      hl?.removeEventListener('touchstart', touchStart);
      hl?.removeEventListener('touchend', touchEnd);

      how?.removeEventListener('pointerenter', enter);
      how?.removeEventListener('pointerleave', leave);
      how?.removeEventListener('touchstart', touchStart);
      how?.removeEventListener('touchend', touchEnd);

      stopAnimationIfRunning();
    };
  }, []);

  const [showSideNav, setShowSideNav] = useState(false);
  const navRafRef = useRef<number | 0>(0);
  const navBoundsRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    const calcBounds = () => {
      const startEl = document.getElementById('highlights');
      let start = -40;
      if (startEl) {
        const startElRect = startEl.getBoundingClientRect();
        start = startElRect.top - 40;
      }
      const endEl = document.getElementById('footer');
      let end = -40;
      if (endEl) {
        const endElRect = endEl.getBoundingClientRect();
        end = endElRect.top - 40;
      }

      navBoundsRef.current = { start, end };
    };

    const onScroll = () => {
      if (navRafRef.current) return;
      navRafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;

        const focus = y + vh * 0.4;
        const { start, end } = navBoundsRef.current;
        const shouldShow = focus > start && focus < end;
        setShowSideNav(shouldShow);
        navRafRef.current && cancelAnimationFrame(navRafRef.current);
        navRafRef.current = 0;
      });
    };

    const onResize = () => {
      calcBounds();

      onScroll();
    };

    calcBounds();
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const t1 = setTimeout(() => {
      calcBounds();
      onScroll();
    }, 300);
    const t2 = setTimeout(() => {
      calcBounds();
      onScroll();
    }, 1000);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (navRafRef.current) cancelAnimationFrame(navRafRef.current);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const openSubscribe = (p: Plan) => {
    if (!authState.user) {
      navigate('/admin-panel/auth/login');
      return;
    }
    setSelectedPlan(p);
    setIsModalOpen(true);
  };

  const nameKey = (s: string) => (s || '').trim().toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await plan.planService();
        if (!mounted) return;
        const items = res?.data?.items ?? res?.data?.plans ?? res?.data ?? [];
        const map: Record<string, string> = {};
        (Array.isArray(items) ? items : []).forEach((it: any) => {
          const nm = (it?.plan_name ?? '').toString();
          const id = it?.id != null ? String(it.id) : '';
          if (nm && id) map[nameKey(nm)] = id;
        });
        setPlans(
          defaultPlans.map((p) => ({ ...p, id: map[nameKey(p.name)] ?? p.id }))
        );
      } catch {
        setPlans(defaultPlans);
      } finally {
        setLoadingPlans(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionVisibilityRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const ids = [
      'hero',
      'highlights',
      'why',
      'how',
      'about',
      'pricing',
      'contact',
    ];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (!id) return;
          sectionVisibilityRef.current[id] = entry.isIntersecting
            ? entry.intersectionRatio
            : 0;
        });

        let bestId: string | null = null;
        let bestRatio = 0;

        ids.forEach((id) => {
          const ratio = sectionVisibilityRef.current[id] ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (!bestId) {
          setActiveSection(null);
          return;
        }

        if (bestId === 'hero' && bestRatio > 0.6) {
          setActiveSection(null);
        } else if (bestId !== 'hero') {
          setActiveSection(bestId);
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ReactLenis root />
      <div className="w-full relative bg-[#DFF4EC]">
        {!isMobile ? (
          <div className="w-full h-auto relative overflow-visible">
            <AnimatePresence mode="wait">
              <HeroSection showHeader={showHeader} />
              <HighlightSection />
              <PartnerSection />
              <WhyChooseSection />
              <NewPartnerSection />
              <HowSection />
              <NewAboutSection />
              <PricingSection
                billingCycle={billingCycle}
                defaultPlans={defaultPlans}
                loadingPlans={loadingPlans}
                openSubscribe={openSubscribe}
                plans={plans}
                setBillingCycle={setBillingCycle}
              />
              <ContactSection />
              <FooterSection />
            </AnimatePresence>

            {!isMobile && (
              <AnimatePresence>
                {showSideNav && (
                  <motion.div
                    key="section-nav"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="fixed right-2 bottom-6 z-[1000] flex flex-col gap-2 items-end"
                  >
                    {[
                      { key: 'highlights', label: 'Highlights' },
                      { key: 'why', label: 'Why Choose Us' },
                      { key: 'how', label: 'How It Works' },
                      { key: 'about', label: 'About' },
                      { key: 'pricing', label: 'Pricing' },
                      { key: 'contact', label: 'Contact' },
                    ].map((item) => {
                      const isActive = activeSection === item.key;
                      const base =
                        'px-3 py-3 rounded-md text-[12px] font-medium shadow transition-colors duration-200 w-[150px]';
                      const activeCls = 'bg-active text-white';
                      const normalCls =
                        'bg-[#DFF4EC] text-[#242460] border-2 border-solid border-[#242460]/20';

                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            const el = document.getElementById(item.key);
                            if (el)
                              el.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                          }}
                          className={`${base} ${isActive ? activeCls : normalCls}`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <SelectedPlanModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              plan={selectedPlan}
              billingCycle={billingCycle}
            />
          </div>
        ) : (
          <div className="w-full h-auto relative">
            <style>{`
                    body {
                        overflow: auto !important;
                    }
                `}</style>
            <HomeResponsive
            plans= {plans}
            authState={authState}
            defaultPlans= {defaultPlans}
            loadingPlans= {loadingPlans}
            // openSubscribe= {openSubscribe}
            />

          
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
