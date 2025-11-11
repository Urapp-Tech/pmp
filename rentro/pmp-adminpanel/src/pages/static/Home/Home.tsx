import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { Link } from "react-router-dom";
import assets from '@/assets/images';
import Header from '@/components/Static/Header';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import contact from '@/services/adminapp/static';
import { Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import HomeResponsive from './Home-responsive';

interface ContactFields {
  email: string;
  phone: string;
  message: string; // <-- fixed (was "messsage")
  fname: string;
  lname: string;
  agree: boolean;
}

// ⬇️ add these
import SelectedPlanModal from '@/components/Static/Model';
import plan from '@/services/adminapp/static';
import { useSelector } from 'react-redux';
import useSlowPageScroll from './SlowPagScroll';
type BillingCycle = 'annual' | 'monthly';

type Plan = {
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

  const [currentBox, setCurrentBox] = useState(1); // active box (1–4)
  const [howStep, setHowStep] = useState(0); // 0 = heading center, 1 = heading top + text center
  const [replicaBox, setReplicaBox] = useState(1); // Replica stacked boxes ke liye
  const [pricingStep, setPricingStep] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  const [hideBottomImg, setHideBottomImg] = useState(false);
  const [hideHLBottomImg, setHideHLBottomImg] = useState(false);
  const [hideHowBottomImg, setHideHowBottomImg] = useState(false);

  // Local step for Highlights (decoupled from howStep)
  const [hlStep, setHlStep] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoader, setIsLoader] = useState(false);

  // ... aapke existing states ke baad:
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // --- Sticky hide/show header on scroll ---
  const [showHeader, setShowHeader] = useState(true);
  const lastYRef = useRef<number>(
    typeof window !== 'undefined' ? window.scrollY : 0
  );
  const tickingRef = useRef(false);

  useEffect(() => {
    const handle = () => {
      const y = window.scrollY;
      const dy = y - lastYRef.current;

      // ignore tiny moves to reduce jitter
      if (Math.abs(dy) < 6) return;

      // always show near top
      if (y < 64) {
        setShowHeader(true);
        lastYRef.current = y;
        return;
      }

      // down → hide, up → show
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

  const ToastHandler = (text: string, color = 'red') =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: color, color: 'white' },
    });
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
  const repboxes = [
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

  const TOTAL_HIGHLIGHT = useMemo(() => boxes?.length ?? 4, [boxes]);
  const TOTAL_REPLICA = useMemo(() => repboxes?.length ?? 4, [repboxes]);

  // ---- SLOWER scroll tuning (slides + page) ----
  // Pehle se existing constants ko bas slow kiya gaya hai:
  const SCROLL_COOLDOWN = 1400; // ms (zyada wait = slower step)
  const WHEEL_THRESHOLD = 160; // trigger ke liye zyada delta chahiye
  const STEP_SCROLL_SCALE = 0.55; // delta soften (kam = slow)

  // Local slide wheel locks + accumulators
  const wheelLockHlRef = useRef(false);
  const wheelLockHowRef = useRef(false);
  const wheelAccumHlRef = useRef(0);
  const wheelAccumHowRef = useRef(0);

  const handleToggle = () => {
    setBillingCycle((prev) => (prev === 'annual' ? 'monthly' : 'annual'));
  };
  // new scroll 11-1025

  // ===== Global Slow Scroll — pauses inside #highlights and #how =====
  const slowScrollState = useRef({
    targetY: typeof window !== 'undefined' ? window.scrollY : 0,
    rafId: 0 as number | 0,
    animating: false,
    paused: false, // pause when we are in managed sections
  });

  useEffect(() => {
    // small helpers
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

    // easing step (slower: 0.12)
    const step = () => {
      const st = slowScrollState.current;
      if (st.paused) {
        stopAnimationIfRunning();
        return; // don't animate while paused
      }
      const { targetY } = st;
      const currentY = window.scrollY;
      const nextY = currentY + (targetY - currentY) * 0.12; // smaller = slower
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
        // cancel any ongoing animation
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
        slowScrollState.current.targetY = window.scrollY; // resync target
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

    // main wheel handler
    const onWheel = (e: WheelEvent) => {
      // already prevented by your highlight/how handlers
      if (e.defaultPrevented) return;

      // if pointer is inside highlights/how, completely skip our slow scroll
      if (isManagedZone(e.target)) {
        stopAnimationIfRunning(); // cancel any ongoing animation so it doesn't "pull"
        return;
      }

      // if globally paused (pointer enter), skip
      if (slowScrollState.current.paused) return;

      // we'll handle the wheel
      e.preventDefault();

      // global page slow factor (was 0.3, now slower 0.18)
      const scale = 0.18;

      // clamp trackpad deltas (slightly tighter for smoothness)
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

    // passive:false so we can preventDefault
    window.addEventListener('wheel', onWheel, { passive: false });

    // pointer/touch enter-leave to hard-pause while inside managed sections
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

    // init target
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
  // ===== End Slow Scroll hook =====

  // new-scrollend
  // new side nav active state 11-10-25
  // --- Side Nav: show between #highlights (start) and #footer (end) ---
  const [showSideNav, setShowSideNav] = useState(false);
  const navRafRef = useRef<number | 0>(0);
  const navBoundsRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    const calcBounds = () => {
      const startEl = document.getElementById('highlights'); // nav starts here
      const endEl = document.getElementById('footer'); // nav hides before footer
      // small safety offsets so it feels natural
      const start = (startEl?.offsetTop ?? 0) - 40;
      const end = (endEl?.offsetTop ?? Number.POSITIVE_INFINITY) - 40;
      navBoundsRef.current = { start, end };
    };

    const onScroll = () => {
      if (navRafRef.current) return;
      navRafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        // use viewport "focus line" ~40% from top to decide which zone we're in
        const focus = y + vh * 0.4;
        const { start, end } = navBoundsRef.current;
        const shouldShow = focus >= start && focus < end;
        setShowSideNav(shouldShow);
        navRafRef.current && cancelAnimationFrame(navRafRef.current);
        navRafRef.current = 0;
      });
    };

    const onResize = () => {
      calcBounds();
      // run a scroll pass after resize to refresh visibility
      onScroll();
    };

    // initial
    calcBounds();
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // sometimes images/fonts shift layout — recalc shortly after mount
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

  // end

  const cycleNote = useMemo(
    () =>
      billingCycle === 'annual'
        ? '/property per month (billed annually)'
        : '/property per month',
    [billingCycle]
  );

  const priceFor = (p: Plan) =>
    billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice;

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
        const res = await plan.planService(); // GET subscriptions/list
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

  // Allow normal page scrolling on landing layout
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

  const lastYScroll = useRef(0);
  const lockPageScroll = () => {
    // Apply styles to freeze scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lastYScroll.current}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    // optional: keep width full
    document.body.style.width = '100%';
    // Cancel any running smooth animation and sync target to saved position
  };

  const unlockPageScroll = () => {
    // remove the locking styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    const rect = highlightsRef.current?.getBoundingClientRect();
    window.scrollTo({
      top: (highlightsRef.current?.clientTop ?? 0) + (rect?.height ?? 0) + 512,
      behavior: 'smooth',
    });
    // restore scroll to the same place
    // sync target so page smooth-scroll resumes naturally from this point
  };

  // Local wheel handlers for slide sections only (landing layout)
  const onWheelHighlight = (e: React.WheelEvent) => {
    // jab slider engaged ho, page scroll hamesha block
    if (hlStep === 1) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (wheelLockHlRef.current) return;

    // soften delta (smooth feeling) — slower
    wheelAccumHlRef.current += e.deltaY * STEP_SCROLL_SCALE;
    if (wheelLockHlRef.current) return;
    wheelAccumHlRef.current += e.deltaY;

    const abs = Math.abs(wheelAccumHlRef.current);
    const dir = wheelAccumHlRef.current > 0 ? 1 : -1;
    const rect = highlightsRef.current?.getBoundingClientRect();
    lastYScroll.current =
      (highlightsRef.current?.clientTop ?? 0) + (rect?.height ?? 0) - 64;
    lockPageScroll();

    // While inside slides (hlStep===1), block tiny wheel to avoid pixel scrolling
    if (hlStep === 1 && abs < WHEEL_THRESHOLD) {
      e.preventDefault();
      return;
    }

    if (abs < WHEEL_THRESHOLD) return; // ignore tiny wheel elsewhere

    // threshold reached; reset accumulator
    wheelAccumHlRef.current = 0;

    if (dir > 0) {
      if (hlStep === 0) {
        setHlStep(1);
        setHideHLBottomImg(true);
        e.preventDefault();
      } else if (currentBox < TOTAL_HIGHLIGHT) {
        setCurrentBox((p) => Math.min(TOTAL_HIGHLIGHT, p + 1));
        e.preventDefault();
      } else {
        // last slide → allow page to scroll to next section
        unlockPageScroll();
        return;
      }
    } else {
      if (hlStep === 1) {
        if (currentBox > 1) {
          setCurrentBox((p) => Math.max(1, p - 1));
          e.preventDefault();
        } else {
          setHlStep(0);
          setHideHLBottomImg(false);
          e.preventDefault();
        }
      } else {
        unlockPageScroll();
        // at intro, allow page to scroll to previous section
        return;
      }
    }

    // lock after consuming to avoid rapid double-steps (slower)
    wheelLockHlRef.current = true;
    setTimeout(() => (wheelLockHlRef.current = false), SCROLL_COOLDOWN);
  };

  const onWheelHow = (e: React.WheelEvent) => {
    if (howStep === 1 || howStep === 2) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (wheelLockHowRef.current) return;

    // soften delta — slower
    wheelAccumHowRef.current += e.deltaY * STEP_SCROLL_SCALE;
    if (wheelLockHowRef.current) return;
    wheelAccumHowRef.current += e.deltaY;

    const abs = Math.abs(wheelAccumHowRef.current);
    const dir = wheelAccumHowRef.current > 0 ? 1 : -1;

    // While in HOW (step 1 or 2), block tiny wheel to avoid pixel scrolling
    if ((howStep === 1 || howStep === 2) && abs < WHEEL_THRESHOLD) {
      e.preventDefault();
      return;
    }

    if (abs < WHEEL_THRESHOLD) return; // ignore tiny wheel elsewhere

    // threshold reached; reset accumulator
    wheelAccumHowRef.current = 0;

    if (dir > 0) {
      if (howStep === 0) {
        setHowStep(1);
        setHideHowBottomImg(false); // show bottom at step-1
        e.preventDefault();
      } else if (howStep === 1) {
        setHowStep(2);
        setHideHowBottomImg(true); // entering slides
        e.preventDefault();
      } else if (replicaBox < TOTAL_REPLICA) {
        setReplicaBox((p) => Math.min(TOTAL_REPLICA, p + 1));
        e.preventDefault();
      } else {
        // last slide → allow page to scroll further
        return;
      }
    } else {
      if (howStep === 2) {
        if (replicaBox > 1) {
          setReplicaBox((p) => Math.max(1, p - 1));
          e.preventDefault();
        } else {
          setHowStep(1);
          setHideHowBottomImg(false);
          e.preventDefault();
        }
      } else if (howStep === 1) {
        setHowStep(0);
        e.preventDefault();
      } else {
        // at step 0, allow page to scroll upward out of section
        return;
      }
    }

    // lock after consuming (slower)
    wheelLockHowRef.current = true;
    setTimeout(() => (wheelLockHowRef.current = false), SCROLL_COOLDOWN);
  };

  // Active-section tracking for Fixed Section Nav
  const [activeSection, setActiveSection] = useState<string | null>(null);
  useEffect(() => {
    const ids = ['highlights', 'why', 'how', 'about', 'pricing', 'contact'];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection((entry.target as HTMLElement).id);
          }
        });
      },
      { threshold: 0.5 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  // Removed legacy page-level wheel hijack (landing layout uses local handlers)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<ContactFields>({
    defaultValues: {
      email: '',
      phone: '',
      message: '',
      fname: '',
      lname: '',
      agree: false,
    },
    mode: 'onBlur',
  });

  // Final normalization + cross-field rules
  const validateContact = (raw: ContactFields) => {
    const data = {
      email: (raw.email || '').trim().replace(/\s+/g, ''),
      phone: (raw.phone || '').trim().replace(/\s+/g, ''),
      fname: (raw.fname || '').trim(),
      lname: (raw.lname || '').trim(),
      message: (raw.message || '').trim(),
      agree: !!raw.agree,
    };

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const phoneDigits = data.phone.replace(/[^\d+]/g, '');
    const phoneRe = /^(?:\+?\d{1,3})?\d{7,14}$/;

    if (!data.fname || data.fname.length < 2)
      return { ok: false as const, msg: 'Please enter a valid first name.' };
    if (!data.lname || data.lname.length < 2)
      return { ok: false as const, msg: 'Please enter a valid last name.' };
    if (!data.email || !emailRe.test(data.email))
      return { ok: false as const, msg: 'Please enter a valid email address.' };
    if (!data.phone || !phoneRe.test(phoneDigits))
      return { ok: false as const, msg: 'Please enter a valid phone number.' };
    if (!data.message || data.message.length < 10)
      return {
        ok: false as const,
        msg: 'Message must be at least 10 characters.',
      };
    if (data.message.length > 2000)
      return {
        ok: false as const,
        msg: 'Message is too long (max 2000 characters).',
      };
    if (!data.agree)
      return {
        ok: false as const,
        msg: 'Please agree to receive communications.',
      };

    return { ok: true as const, data };
  };
  // useSlowPageScroll({
  //   speed: 0.12, // smaller = slower
  //   maxStep: 120, // clamp per wheel tick
  //   scale: 0.22, // how far each tick moves the target
  //   exclude: ['#highlights', '#how'], // let these sections handle their own wheel
  //   visibleThreshold: 0.9,
  // });

  const onSubmit = async (data: any) => {
    setIsLoader(true);
    try {
      const res = await contact.contactService({
        email: data.email,
        phone: data.phone,
        fname: data.fname,
        lname: data.lname,
        message: data.message,
      });
      console.log(res);

      if (res?.data?.success) {
        setIsLoader(false);
        ToastHandler(res.data.message, 'green');
        reset(); // clear the form
      } else {
        setIsLoader(false);
        ToastHandler(res?.data?.message || 'Something went wrong');
      }
    } catch (e: any) {
      setIsLoader(false);
      ToastHandler(e?.message || 'Unexpected error');
    } finally {
      setIsLoader(false);
    }
  };

  const highlightsRef = useRef<HTMLElement | null>(null);

  const HeroSection = (
    <motion.section
      id="hero"
      key="hero"
      className="relative w-full min-h-screen home-bg"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* <Header customClass="relative" /> */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: showHeader ? 0 : -90, opacity: showHeader ? 1 : 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-[1000] will-change-transform stiky py-0"
      >
        {/* feel free to tweak bg/blur/shadow here */}
        <Header customClass="bg-white/80 backdrop-blur-xl shadow-sm py-0" />
      </motion.div>
      <div className="h-[72px]" />

      <div className="flex justify-end px-20 max-[1260px]:justify-center max-[576px]:px-2 translate-y-[12%]">
        <p className="text-[36px] font-light text-primary mt-10 max-w-[445px] leading-[45px] max-[1260px]:max-w-full max-[1260px]:text-[30px] max-[1260px]:text-center max-[992px]:text-[24px] max-[992px]:leading-tight max-[768px]:text-[19px] max-[576px]:max-w-full">
          From rent collection to maintenance requests — manage everything in
          one place.
        </p>
      </div>

      <div className="flex justify-between items-end pb-10 pl-10 pr-20 absolute bottom-0 left-0 right-0 max-[1260px]:flex-col max-[1260px]:items-center max-[576px]:px-0">
        <h3 className="text-[4vw] font-normal text-primary leading-tight max-w-[740px] max-[1260px]:text-center max-[768px]:text-[40px] max-[576px]:text-[24px]">
          Smarter Property <br /> Management in Kuwait
        </h3>

        <div className="flex gap-4 mt-6 justify-end md:justify-start max-[576px]:flex-col">
          <button
            onClick={() => navigate('/admin-panel/auth/register')}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow-md hover:opacity-90 transition max-[576px]:text-[14px]"
          >
            Start Free Trial
          </button>
          <button
            onClick={() => navigate('/contact-us')}
            className="px-6 py-3 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50 transition max-[576px]:text-[14px]"
          >
            Book a Demo
          </button>
        </div>
      </div>
    </motion.section>
  );

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const numSlides = boxes.length;
  const step = 1 / numSlides;
  const cardOffset = 40;

  const HighlightSection = (
    <section
      ref={sectionRef}
      className="relative bg-transparent text-white"
      style={{ height: `${numSlides * 120}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden justify-center">
        {boxes.map((box, i) => {
          const start = i * step;
          const end = (i + 1) * step;

          const baseY = cardOffset * i;
          const y = useTransform(
            scrollYProgress,
            [start, end],
            [baseY + cardOffset, baseY]
          );

          let opacity;

          if (box.id === 1 || box.id === 2) {
            // 👇 fade in, then fade out before next slide
            opacity = useTransform(
              scrollYProgress,
              [start, start + step * 0.25, end - step * 0.15, end],
              [0, 1, 1, 0]
            );
          } else {
            // 👇 keep visible (stacked)
            opacity = useTransform(
              scrollYProgress,
              [start, start + step * 0.25],
              [0, 1]
            );
          }

          const scale = useTransform(scrollYProgress, [start, end], [0.97, 1]);

          if (box.id === 1) {
            return (
              <motion.div
                id="highlights"
                key={box.id}
                className={`mx-auto absolute bg-transparent rounded-2xl w-10/12 h-screen flex items-center justify-center`}
                style={{
                  y,
                  opacity,
                  scale,
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
                {/* <div className="flex gap-6">
                  <img
                    src={assets.images.hiliteIcon}
                    alt="icon"
                    className="w-[80px] h-[80px]"
                  />
                  <span className="font-normal text-[64px] text-primary">
                    Highlights
                  </span>
                </div> */}
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

  // ---------------- Partner Section ----------------
  const PartnerSection = (
    <motion.section
      id="partner"
      key="partner"
      className="relative w-full min-h-screen bg-primary flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-6">
        {/* <h2 className="text-white text-5xl font-bold mb-6">Our Partners</h2> */}
        <p className="text-white max-w-[800px] mx-auto leading-tight text-[64px] max-[1260px]:text-[50px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
          Rento is more than just property management software,
          <span className="text-[64px]  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            {' '}
            it’s your growth partner.
          </span>
        </p>
      </div>
    </motion.section>
  );

  // ---------------- Why Choose Section ----------------
  const WhyChooseSection = (
    <motion.section
      id="why"
      key="whychoose"
      className="relative w-full min-h-screen  flex items-center justify-center "
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0% 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)' }}
      transition={{ duration: 1.4, ease: 'easeInOut' }}
    >
      <div className="text-center px-2 w-[96%] h-screen bg-[#DFF4EC] relative  rounded-[10px]">
        <div className="pt-10  top-10 left-10 z-[111]">
          <h2 className="text-left text-[40px] font-medium text-[#242460] mb-6 max-[1500px]:text-[30px]">
            Why Choose Us?
          </h2>
          <ul className="px-5 list-disc text-left text-primary text-[28px] font-normal leading-normal space-y-3 max-[1500px]:text-[24px] max-[1024px]:text-[24px] max-w-[600px] min-[1400px]:max-w-[800px] marker:text-[#242460]">
            <li>Built for Kuwait’s property market</li>
            <li>Supports Arabic & English</li>
            <li>Transparent, easy-to-use dashboards</li>
            <li>Secure payments with bank-grade protection</li>
            <li>Save time, cut costs, and improve relationships</li>
          </ul>
        </div>

        <div className="absolute bottom-0 right-0 w-[750px] z-[1] max-w-full h-full">
          <img
            src={assets.images.whyBanner}
            alt="banner"
            className="w-full h-full  object-fill max-[1260px]:opacity-35"
          />
        </div>
      </div>
    </motion.section>
  );

  const numSlides2 = repboxes.length;
  const step2 = 1 / numSlides;
  const cardOffset2 = 40;

  const howSectionRef = useRef(null);
  const { scrollYProgress: howScrollYProgress } = useScroll({
    target: howSectionRef,
    offset: ['start start', 'end end'],
  });

  const HowSection = (
    <section
      ref={howSectionRef}
      className="relative bg-transparent text-white"
      style={{ height: `${numSlides2 * 120}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden justify-center">
        {repboxes.map((box, i) => {
          const start = i * step2;
          const end = (i + 1) * step2;

          const baseY = cardOffset2 * i;
          const y = useTransform(
            howScrollYProgress,
            [start, end],
            [baseY + cardOffset2, baseY]
          );

          let opacity;

          if (box.id === 1 || box.id === 2) {
            // 👇 fade in, then fade out before next slide
            opacity = useTransform(
              howScrollYProgress,
              [start, start + step2 * 0.25, end - step2 * 0.15, end],
              [0, 1, 1, 0]
            );
          } else {
            // 👇 keep visible (stacked)
            opacity = useTransform(
              howScrollYProgress,
              [start, start + step2 * 0.25],
              [0, 1]
            );
          }

          const scale = useTransform(
            howScrollYProgress,
            [start, end],
            [0.97, 1]
          );

          if (box.id === 1) {
            return (
              <motion.div
                key={box.id}
                className={`mx-auto absolute bg-transparent rounded-2xl w-10/12 h-screen flex items-center justify-center`}
                style={{
                  y,
                  opacity,
                  scale,
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
                {/* <div className="flex gap-6">
                  <img
                    src={assets.images.hiliteIcon}
                    alt="icon"
                    className="w-[80px] h-[80px]"
                  />
                  <span className="font-normal text-[64px] text-primary">
                    How it works
                  </span>
                </div> */}
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
              id="how"
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

  const NewPartnerSection = (
    <motion.section
      id="about-intro"
      key="about-intro"
      className="relative w-full min-h-screen bg-primary flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-6 ">
        {/* <h2 className="text-white text-5xl font-bold mb-6">Our Partners</h2> */}
        <p className="text-left text-white mx-auto text-[100px] leading-tight max-w-[1400px] max-[1440px]:text-[80px] max-[1024px]:text-[60px] max-[768px]:text-[40px] max-[425px]:text-[32px]">
          At Rento, we believe property management should be simple,
          <span className=" font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent     ">
            {' '}
            smart, and stress-free.
          </span>
        </p>
      </div>
    </motion.section>
  );

  // ---------------- New About Section ----------------
  const NewAboutSection = (
    <motion.section
      id="about"
      key="about"
      className="relative inset-0 w-full min-h-screen bg-primary flex items-center justify-center "
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-0  w-[96%] h-screen bg-primary relative rounded-[10px] border-0 border-solid border-[#ccc]">
        <div className="absolute top-10 left-4 z-[111] max-w-[890px] pr-3">
          <h2 className="text-left text-[40px] font-medium text-[#DFF4EC] mb-6 max-[1550px]:text-[30px]">
            At Rento, we believe property management should be simple, smart,
            and stress-free.
          </h2>
          <p className="text-left text-[24px] font-light text-[#DFF4EC] mb-4 max-[1550px]:text-[20px]">
            We built Rento to empower landlords, property managers, and tenants
            with a modern platform that brings everything into one easy-to-use
            solution. From managing properties and tenants to tracking payments,
            sending invoices, and keeping records secure, Rento keeps you in
            control with just a few clicks.
          </p>
          <p className="text-left text-[24px] font-light text-[#DFF4EC] mb-4 max-[1550px]:text-[20px]">
            Our mission is to transform the rental experience in Kuwait by
            combining technology, transparency, and trust. Whether you own a
            single villa or manage a large portfolio of buildings, Rento is
            designed to save you time, reduce paperwork, and improve
            communication.
          </p>
          <button
            onClick={() => navigate('/about-us')}
            className="cursor-pointer mt-3 text-[#5EBFA1] hover:text-white flex gap-3 items-center"
          >
            Read more
            <span>
              <img
                src={assets.images.arrowRight}
                alt="icon"
                className="w-[20px] h-[20px]"
              />
            </span>
          </button>
        </div>

        <div className="absolute bottom-0 right-0 z-[1] max-w-[750px] max-[1550px]:max-w-[550px] max-[1440px]:opacity-50">
          <img
            src={assets.images.aboutFixtwo}
            alt="banner"
            className="object-contain"
          />
        </div>
      </div>
    </motion.section>
  );

  // ---------------- Pricing Section ----------------
  const [isModalOpen, setIsModalOpen] = useState(false); // put alongside other pricing states

  const PricingSection = (
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

              {/* Cards container */}
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

  // ---------------- New Slide-in Section ----------------
  const ContactSection = (
    <motion.section
      id="contact"
      key="new-slide-section"
      className="relative w-full min-h-screen bg-[#DFF4EC] flex flex-col items-center justify-center overflow-hidden"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Heading: Slide from top */}
      <motion.h2
        className="text-primary font-normal top-10  left-1/2 -translate-x-1/2 text-[70px] mb-4 leading-normal text-center max-[1540px]:top-5 max-[1440px]:text-[30px] min-w-full"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        We’re here to help.
      </motion.h2>
      {/* Content Box: Slide from bottom */}
      <motion.div
        className="w-[95%] max-w-[1840px] bg-white pt-2 pb-4 rounded-3xl px-5 mt-15 max-[1260px]:bg-[#DFF4EC] max-[1260px]:shadow-2xl"
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex items-center justify-center h-full gap-3 pt-3 pb-3 relative z-11">
            <div className="flex-1">
              {/* Row 1: Name / Last Name */}
              <div className="flex gap-3">
                {/* Name */}
                <div className="mb-4 flex-1">
                  <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Rashid Hamad"
                    className={`w-full rounded-lg border font-light ${
                      errors.fname ? 'border-red-400' : 'border-transparent'
                    } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.fname
                        ? 'focus:ring-red-400'
                        : 'focus:ring-blue-400'
                    }`}
                    {...register('fname', {
                      required: 'First name is required.',
                      minLength: {
                        value: 2,
                        message: 'Please enter a valid first name.',
                      },
                    })}
                    aria-invalid={!!errors.fname}
                  />
                  {errors.fname && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.fname.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="mb-4 flex-1">
                  <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Rashid Hamad"
                    className={`w-full rounded-lg border font-light ${
                      errors.lname ? 'border-red-400' : 'border-transparent'
                    } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.lname
                        ? 'focus:ring-red-400'
                        : 'focus:ring-blue-400'
                    }`}
                    {...register('lname', {
                      required: 'Last name is required.',
                      minLength: {
                        value: 2,
                        message: 'Please enter a valid last name.',
                      },
                    })}
                    aria-invalid={!!errors.lname}
                  />
                  {errors.lname && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.lname.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Email / Phone */}
              <div className="mb-4 flex gap-3">
                {/* Email */}
                <div className="mb-4 flex-1">
                  <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Faisal Khamees"
                    className={`w-full rounded-lg border font-light ${
                      errors.email ? 'border-red-400' : 'border-transparent'
                    } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'focus:ring-red-400'
                        : 'focus:ring-blue-400'
                    }`}
                    {...register('email', {
                      required: 'Email is required.',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                        message: 'Please enter a valid email address.',
                      },
                    })}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-4 flex-1">
                  <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
                    Phone No.
                  </label>
                  <input
                    type="tel"
                    placeholder="+971527992240"
                    className={`w-full rounded-lg border font-light ${
                      errors.phone ? 'border-red-400' : 'border-transparent'
                    } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? 'focus:ring-red-400'
                        : 'focus:ring-blue-400'
                    }`}
                    {...register('phone', {
                      required: 'Phone is required.',
                      validate: (v) =>
                        /^(?:\+?\d{1,3})?\d{7,14}$/.test(
                          (v || '').replace(/[^\d+]/g, '')
                        ) || 'Please enter a valid phone number.',
                    })}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-normal text-[#1D1B4C] mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="write a message"
                  className={`w-full rounded-lg border font-light ${
                    errors.message ? 'border-red-400' : 'border-transparent'
                  } bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 ${
                    errors.message
                      ? 'focus:ring-red-400'
                      : 'focus:ring-blue-400'
                  }`}
                  {...register('message', {
                    required: 'Message is required.',
                    minLength: {
                      value: 10,
                      message: 'Message must be at least 10 characters.',
                    },
                    maxLength: {
                      value: 2000,
                      message: 'Message is too long (max 2000 characters).',
                    },
                  })}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00D494] to-[#00B5E2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
              >
                {isLoader ? (
                  <div className="flex items-center justify-center">
                    <Loader />
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
            </div>

            {/* Right column (image) stays unchanged */}
            <div className="flex-1 max-w-full h-full w-full max-[1260px]:absolute max-[1260px]:top-0 max-[1260px]:z-[-1]">
              <img
                src={assets.images.phoneBanner}
                alt="banner"
                className="w-full h-full max-[1260px]:object-contain max-[1260px]:opacity-40 max-w-full"
              />
            </div>
          </div>
        </form>
        <ul className="flex justify-between items-start  text-primary text-[14px] pb-3">
          <li className="flex items-center gap-2 text-primary">
            <img
              src={assets.images.locationIcon}
              alt="icon"
              className="w-[28px] h-[28px] icn"
            />{' '}
            Kuwait
          </li>
          <li className="flex items-center gap-2 text-primary">
            <img
              src={assets.images.phoneIcon}
              alt="icon"
              className="w-[28px] h-[28px] icn "
            />{' '}
            +965 94051232
          </li>
          <li className="flex items-center gap-2 text-primary">
            <img
              src={assets.images.mailIcon}
              alt="icon"
              className="w-[28px] h-[28px] icn"
            />{' '}
            aljaser@rento.online
          </li>
        </ul>
      </motion.div>
    </motion.section>
  );

  //  footer section

  const FooterSection = (
    <motion.section
      id="footer"
      key="footer-section"
      className="relative w-full min-h-screen flex items-end justify-center z-[1]"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="footer-bg w-full h-[100vh] flex flex-col relative z-[1]">
        <div className="pt-4 flex-1 flex flex-col items-center justify-start">
          <h2
            className="max-w-[1128px] px-3 mx-auto text-center text-white text-[55px] font-normal leading-snug max-[1600px]:max-w-[900px] max-[1600px]:text-[38px]
                                max-[1260px]:text-[55px] max-[1024px]:text-[40px] max-[768px]:text-[28px]"
          >
            Where Property Management Meets Performance
          </h2>
          <div className="max-w-[1300px] w-[95%] mx-auto mt-6 flex justify-center">
            <img
              src={assets.images.footerBanner}
              alt="banner"
              className="w-full  h-[45vh]  object-contain object-bottom foter-ban"
            />
          </div>
        </div>

        <div className="bg-primary px-10 pt-10 pb-3">
          <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center max-[768px]:flex-col max-[768px]:gap-5">
              <img
                src={assets.images.logo}
                alt="Logo"
                className="w-[105px] h-[20px] object-contain"
              />
              <ul className="flex justify-end gap-8 items-center text-[20px] font-light text-white max-[576px]:flex-col max-[576px]:gap-4 max-[576px]:items-start">
                <li>
                  <Link to="/features" className="hover:opacity-90">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:opacity-90">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/about-us" className="hover:opacity-90">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:opacity-90">
                    Contact
                  </Link>
                </li>
                <li>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={assets.images.instaIcon}
                      alt="icon"
                      className="w-[28px] h-[28px]"
                    />
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex justify-start items-center max-[768px]:flex-col max-[768px]:gap-5">
              <ul className="flex flex-col gap-2 text-white text-[14px]">
                <li className="flex items-center gap-2">
                  <img
                    src={assets.images.locationIcon}
                    alt="icon"
                    className="w-[28px] h-[28px]"
                  />{' '}
                  Kuwait
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src={assets.images.phoneIcon}
                    alt="icon"
                    className="w-[28px] h-[28px]"
                  />{' '}
                  +965 94051232
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src={assets.images.mailIcon}
                    alt="icon"
                    className="w-[28px] h-[28px]"
                  />{' '}
                  aljaser@rento.online
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-4 max-[768px]:mt-5">
                <Link
                  to="/privacy"
                  className="text-white/50 text-[16px] hover:text-white"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="text-white/50 text-[16px]  hover:text-white"
                >
                  Terms & Conditions
                </Link>
              </div>
              <p className="text-white/50 text-[16px] text-center mt-5">
                Copyright © 2025 Rento. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
  return (
    <div className="w-full relative bg-[#DFF4EC]">
      {/* <style>{`html { scroll-behavior: smooth; }`}</style> */}
      {!isMobile ? (
        // ✅ Desktop Mode
        <div className="w-full h-auto relative overflow-visible">
          <AnimatePresence mode="wait">
            {HeroSection}
            {HighlightSection}
            {PartnerSection}
            {WhyChooseSection}
            {NewPartnerSection}
            {HowSection}
            {NewAboutSection}
            {PricingSection}
            {ContactSection}
            {FooterSection}
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
                    const activeCls = 'bg-acive text-white';
                    const normalCls =
                      'bg-[#DFF4EC] text-[#242460] border-2 border-solid border-[#242460]/20';

                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          if (item.key === 'highlights') {
                            setHlStep(0);
                            setCurrentBox(1);
                            setHideHLBottomImg(false);
                          }
                          if (item.key === 'how') {
                            setHowStep(0);
                            setReplicaBox(1);
                            setHideHowBottomImg(false);
                          }
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
          <HomeResponsive />
        </div>
      )}
    </div>
  );
};

export default Home;
