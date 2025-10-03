import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { Link } from "react-router-dom";
import { Link } from 'react-router-dom';
import assets from '@/assets/images';
import Header from '@/components/Static/Header';
import HomeResponsive from './Home-responsive';

const Home: React.FC = () => {
  const [index, setIndex] = useState(0); // 0 = Hero, 1 = Stacked, 2 = Partner, 3 = WhyChoose
  const [currentBox, setCurrentBox] = useState(1); // active box (1–4)
  const [howStep, setHowStep] = useState(0); // 0 = heading center, 1 = heading top + text center
  const [replicaBox, setReplicaBox] = useState(1); // Replica stacked boxes ke liye
  const [newPartnerBox, setNewPartnerBox] = useState(1);
  const [newAboutBox, setNewAboutBox] = useState(1);
  const [pricingStep, setPricingStep] = useState(0);
  const [isToggled, setIsToggled] = useState(true);
  const [showFooter, setShowFooter] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 991);
  const [hideBottomImg, setHideBottomImg] = useState(false);
  const [hideHLBottomImg, setHideHLBottomImg] = useState(false);
  const [hideHowBottomImg, setHideHowBottomImg] = useState(false);
  const boxes = [
    {
      id: 1,
      title: 'Collect rent online securely',
      description:
        'Say goodbye to cash and late payments. With Rento, tenants can pay rent online in just a few clicks, handled with bank-level security — keeping payments safe for landlords and simple for tenants.',
      bg: `${assets.images.highBan1}`,
      titleColor: '#242460',
      descColor: '#242460',
    },
    {
      id: 2,
      title: 'Automated financial reports',
      description:
        'No more manual spreadsheets. Rento instantly generates detailed reports on rent collection, expenses, and property performance. Track your income and get a clear financial overview anytime, anywhere.',
      bg: `${assets.images.highBan2}`,
      titleColor: '#fff',
      descColor: '#fff',
    },
    {
      id: 3,
      title: 'Easy tenant & property management',
      description:
        'Keep everything organized in one place. Add new tenants, manage multiple properties, and access contracts or payment history in seconds. Rento simplifies daily operations so you can focus on growing your portfolio.',
      bg: `${assets.images.highBan3}`,
      titleColor: '#242460',
      descColor: '#242460',
    },
    {
      id: 4,
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
      id: 3,
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
      id: 4,
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
  const wheelLockRef = useRef(false); // stable lock across re-renders
  const SCROLL_COOLDOWN = 700; // ms (tweak if needed)
  // const isMobile=1;
  // const [lastScrollY, setLastScrollY] = useState(0);
  const handleToggle = () => {
    setIsToggled(!isToggled);
  };
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991);
    };
    console.log(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useEffect(() => {
  //     const handleWheel = (e: WheelEvent) => {
  //         e.preventDefault();

  //         if (wheelLockRef.current) return;
  //         wheelLockRef.current = true;

  //         const delta = e.deltaY > 0 ? 1 : -1;
  //         const unlock = () => setTimeout(() => { wheelLockRef.current = false; }, SCROLL_COOLDOWN);

  //         // ---------- Footer locked mode ----------
  //         if (showFooter) {
  //             if (delta < 0) {
  //                 // scroll up blocked
  //             }
  //             unlock();
  //             return;
  //         }

  //         // ---------- Normal scroll logic ----------
  //         if (delta > 0) { // scroll down
  //             switch (index) {
  //                 case 0:
  //                     setIndex(1); // Hero → Highlight (Step 0)
  //                     break;

  //                 case 1: {
  //                     // Highlight PPT-style
  //                     if (howStep === 0) {
  //                         setHowStep(1); // start slides
  //                     } else {
  //                         if (currentBox < TOTAL_HIGHLIGHT) setCurrentBox(p => Math.min(TOTAL_HIGHLIGHT, p + 1));
  //                         else setIndex(3); // to Partner
  //                     }
  //                     break;
  //                 }

  //                 case 3:
  //                     setIndex(4); // Partner → WhyChoose
  //                     break;

  //                 case 4:
  //                     // WhyChoose → How (reset how sequence)
  //                     setHowStep(0);
  //                     setReplicaBox(1);
  //                     setIndex(5);
  //                     break;

  //                 // case 5:
  //                 //     // How PPT-style
  //                 //     if (howStep === 0) {
  //                 //         setHowStep(1);
  //                 //     } else {
  //                 //         if (replicaBox < TOTAL_REPLICA) setReplicaBox(p => Math.min(TOTAL_REPLICA, p + 1));
  //                 //         else setIndex(7);
  //                 //     }
  //                 //     break;
  //                 case 5:
  //                     if (howStep === 0) setHowStep(1);
  //                     else if (howStep === 1) setHowStep(2);
  //                     else {
  //                         if (replicaBox < TOTAL_REPLICA) setReplicaBox(p => Math.min(TOTAL_REPLICA, p + 1));
  //                         else setIndex(7);
  //                     }
  //                     break;

  //                 case 7: setIndex(8); break;
  //                 case 8: setIndex(9); break;

  //                 case 9:
  //                     if (pricingStep === 0) setPricingStep(1);
  //                     else setIndex(10);
  //                     break;

  //                 case 10:
  //                     setShowFooter(true);
  //                     break;

  //                 default: break;
  //             }
  //         } else { // scroll up
  //             switch (index) {
  //                 case 1: {
  //                     // Highlight reverse
  //                     if (howStep === 1) {
  //                         if (currentBox > 1) setCurrentBox(p => Math.max(1, p - 1));
  //                         else setHowStep(0);
  //                     } else {
  //                         setIndex(0);
  //                     }
  //                     break;
  //                 }

  //                 case 3:
  //                     // back into Highlight with slides completed (to walk back)
  //                     setIndex(1);
  //                     setHowStep(1);
  //                     setCurrentBox(TOTAL_HIGHLIGHT);
  //                     break;

  //                 case 4:
  //                     setIndex(3);
  //                     break;

  //                 // case 5:
  //                 //     // How reverse
  //                 //     if (howStep === 1) {
  //                 //         if (replicaBox > 1) setReplicaBox(p => Math.max(1, p - 1));
  //                 //         else setHowStep(0);
  //                 //     } else {
  //                 //         setIndex(4);
  //                 //     }
  //                 //     break;
  //                 case 5:
  //                     if (howStep === 2) {
  //                         if (replicaBox > 1) setReplicaBox(p => Math.max(1, p - 1));
  //                         else setHowStep(1);
  //                     } else if (howStep === 1) {
  //                         setHowStep(0);
  //                     } else {
  //                         setIndex(4);
  //                     }
  //                     break;

  //                 case 7:
  //                     if (newPartnerBox > 1) {
  //                         setNewPartnerBox(p => p - 1);
  //                     } else {
  //                         setIndex(5);
  //                         setHowStep(1);
  //                         setReplicaBox(TOTAL_REPLICA);
  //                     }
  //                     break;

  //                 case 8:
  //                     if (newAboutBox > 1) setNewAboutBox(p => p - 1);
  //                     else { setIndex(7); setNewPartnerBox(4); }
  //                     break;

  //                 case 9:
  //                     if (pricingStep === 1) setPricingStep(0);
  //                     else setIndex(8);
  //                     break;

  //                 case 10:
  //                     setIndex(9);
  //                     break;

  //                 default: break;
  //             }
  //         }

  //         unlock();
  //     };

  //     window.addEventListener("wheel", handleWheel, { passive: false });
  //     return () => window.removeEventListener("wheel", handleWheel);
  // }, [
  //     index,
  //     currentBox,
  //     replicaBox,
  //     howStep,
  //     newPartnerBox,
  //     newAboutBox,
  //     pricingStep,
  //     showFooter,
  //     TOTAL_HIGHLIGHT,
  //     TOTAL_REPLICA,
  // ]);

  // ✅ Add this at component top
  // const [hideBottomImg, setHideBottomImg] = useState(false);

  // useEffect(() => {
  //     const handleWheel = (e: WheelEvent) => {
  //         e.preventDefault();

  //         if (wheelLockRef.current) return;
  //         wheelLockRef.current = true;

  //         const delta = e.deltaY > 0 ? 1 : -1;
  //         const unlock = () =>
  //             setTimeout(() => {
  //                 wheelLockRef.current = false;
  //             }, SCROLL_COOLDOWN);

  //         // ---------- Footer locked mode ----------
  //         if (showFooter) {
  //             if (delta < 0) {
  //                 // scroll up blocked
  //             }
  //             unlock();
  //             return;
  //         }

  //         // 👇 While on Pricing step-0, any wheel should hide the bottom image immediately
  //         if (index === 9 && pricingStep === 0) {
  //             setHideBottomImg(true);
  //         }

  //         // ---------- Normal scroll logic ----------
  //         if (delta > 0) {
  //             // scroll down
  //             switch (index) {
  //                 case 0:
  //                     setIndex(1); // Hero → Highlight (Step 0)
  //                     break;

  //                 case 1: {
  //                     // Highlight PPT-style
  //                     if (howStep === 0) {
  //                         setHowStep(1); // start slides
  //                     } else {
  //                         if (currentBox < TOTAL_HIGHLIGHT)
  //                             setCurrentBox((p) => Math.min(TOTAL_HIGHLIGHT, p + 1));
  //                         else setIndex(3); // to Partner
  //                     }
  //                     break;
  //                 }

  //                 case 3:
  //                     setIndex(4); // Partner → WhyChoose
  //                     break;

  //                 case 4:
  //                     // WhyChoose → How (reset how sequence)
  //                     setHowStep(0);
  //                     setReplicaBox(1);
  //                     setIndex(5);
  //                     break;

  //                 case 5:
  //                     if (howStep === 0) setHowStep(1);
  //                     else if (howStep === 1) setHowStep(2);
  //                     else {
  //                         if (replicaBox < TOTAL_REPLICA)
  //                             setReplicaBox((p) => Math.min(TOTAL_REPLICA, p + 1));
  //                         else setIndex(7);
  //                     }
  //                     break;

  //                 case 7:
  //                     setIndex(8);
  //                     break;

  //                 case 8:
  //                     setIndex(9);          // enter Pricing
  //                     setHideBottomImg(false); // 👈 show bottom image when entering step-0
  //                     break;

  //                 case 9:
  //                     if (pricingStep === 0) setPricingStep(1);
  //                     else setIndex(10);
  //                     break;

  //                 case 10:
  //                     setShowFooter(true);
  //                     break;

  //                 default:
  //                     break;
  //             }
  //         } else {
  //             // scroll up
  //             switch (index) {
  //                 case 1: {
  //                     // Highlight reverse
  //                     if (howStep === 1) {
  //                         if (currentBox > 1) setCurrentBox((p) => Math.max(1, p - 1));
  //                         else setHowStep(0);
  //                     } else {
  //                         setIndex(0);
  //                     }
  //                     break;
  //                 }

  //                 case 3:
  //                     // back into Highlight with slides completed (to walk back)
  //                     setIndex(1);
  //                     setHowStep(1);
  //                     setCurrentBox(TOTAL_HIGHLIGHT);
  //                     break;

  //                 case 4:
  //                     setIndex(3);
  //                     break;

  //                 case 5:
  //                     if (howStep === 2) {
  //                         if (replicaBox > 1) setReplicaBox((p) => Math.max(1, p - 1));
  //                         else setHowStep(1);
  //                     } else if (howStep === 1) {
  //                         setHowStep(0);
  //                     } else {
  //                         setIndex(4);
  //                     }
  //                     break;

  //                 case 7:
  //                     if (newPartnerBox > 1) {
  //                         setNewPartnerBox((p) => p - 1);
  //                     } else {
  //                         setIndex(5);
  //                         setHowStep(1);
  //                         setReplicaBox(TOTAL_REPLICA);
  //                     }
  //                     break;

  //                 case 8:
  //                     if (newAboutBox > 1) setNewAboutBox((p) => p - 1);
  //                     else {
  //                         setIndex(7);
  //                         setNewPartnerBox(4);
  //                     }
  //                     break;

  //                 case 9:
  //                     if (pricingStep === 1) {
  //                         setPricingStep(0);     // back to Pricing step-0
  //                         setHideBottomImg(false); // 👈 reveal bottom image again
  //                     } else {
  //                         setIndex(8);
  //                     }
  //                     break;

  //                 case 10:
  //                     setIndex(9);
  //                     break;

  //                 default:
  //                     break;
  //             }
  //         }

  //         unlock();
  //     };

  //     window.addEventListener("wheel", handleWheel, { passive: false });
  //     return () => window.removeEventListener("wheel", handleWheel);
  // }, [
  //     index,
  //     currentBox,
  //     replicaBox,
  //     howStep,
  //     newPartnerBox,
  //     newAboutBox,
  //     pricingStep,
  //     showFooter,
  //     TOTAL_HIGHLIGHT,
  //     TOTAL_REPLICA,
  //     // no need to add hideBottomImg here; we only set it inside
  // ]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (wheelLockRef.current) return;
      wheelLockRef.current = true;

      const delta = e.deltaY > 0 ? 1 : -1;
      const unlock = () =>
        setTimeout(() => {
          wheelLockRef.current = false;
        }, SCROLL_COOLDOWN);

      // ---------- Footer locked mode ----------
      if (showFooter) {
        if (delta < 0) {
          // scroll up blocked
        }
        unlock();
        return;
      }

      // ---------- First-scroll hide rules for bottom banners ----------
      // Highlight step-0
      if (index === 1 && howStep === 0) {
        setHideHLBottomImg(true);
      }
      // How It Works step-1
      if (index === 5 && howStep === 1) {
        setHideHowBottomImg(true);
      }
      // Pricing step-0
      if (index === 9 && pricingStep === 0) {
        setHideBottomImg(true);
      }

      // ---------- Normal scroll logic ----------
      if (delta > 0) {
        // scroll down
        switch (index) {
          case 0:
            setIndex(1); // Hero → Highlight (Step 0)
            setHideHLBottomImg(false); // show Highlight bottom when entering step-0
            break;

          case 1: {
            // Highlight PPT-style
            if (howStep === 0) {
              setHowStep(1); // start slides
            } else {
              if (currentBox < TOTAL_HIGHLIGHT)
                setCurrentBox((p) => Math.min(TOTAL_HIGHLIGHT, p + 1));
              else setIndex(3); // to Partner
            }
            break;
          }

          case 3:
            setIndex(4); // Partner → WhyChoose
            break;

          case 4:
            // WhyChoose → How (reset how sequence)
            setHowStep(0);
            setReplicaBox(1);
            setIndex(5);
            break;

          case 5:
            if (howStep === 0) {
              setHowStep(1); // enter How step-1 (pinned + center subheading)
              setHideHowBottomImg(false); // show How bottom when arriving to step-1
            } else if (howStep === 1) {
              setHowStep(2); // go into slides
            } else {
              if (replicaBox < TOTAL_REPLICA)
                setReplicaBox((p) => Math.min(TOTAL_REPLICA, p + 1));
              else setIndex(7);
            }
            break;

          case 7:
            setIndex(8);
            break;

          case 8:
            setIndex(9); // enter Pricing
            setHideBottomImg(false); // show Pricing bottom on step-0
            break;

          case 9:
            if (pricingStep === 0) setPricingStep(1);
            else setIndex(10);
            break;

          case 10:
            setShowFooter(true);
            break;

          default:
            break;
        }
      } else {
        // scroll up
        switch (index) {
          case 1: {
            // Highlight reverse
            if (howStep === 1) {
              if (currentBox > 1) setCurrentBox((p) => Math.max(1, p - 1));
              else {
                setHowStep(0); // back to step-0
                setHideHLBottomImg(false); // show Highlight bottom again
              }
            } else {
              setIndex(0);
            }
            break;
          }

          case 3:
            // back into Highlight with slides completed (to walk back)
            setIndex(1);
            setHowStep(1);
            setCurrentBox(TOTAL_HIGHLIGHT);
            break;

          case 4:
            setIndex(3);
            break;

          case 5:
            if (howStep === 2) {
              if (replicaBox > 1) {
                setReplicaBox((p) => Math.max(1, p - 1));
              } else {
                setHowStep(1); // arrive to How step-1 from slides
                setHideHowBottomImg(false); // show How bottom again
              }
            } else if (howStep === 1) {
              setHowStep(0);
            } else {
              setIndex(4);
            }
            break;

          case 7:
            if (newPartnerBox > 1) {
              setNewPartnerBox((p) => p - 1);
            } else {
              setIndex(5);
              setHowStep(1);
              setReplicaBox(TOTAL_REPLICA);
              setHideHowBottomImg(false); // ensure shown when landing on step-1
            }
            break;

          case 8:
            if (newAboutBox > 1) setNewAboutBox((p) => p - 1);
            else {
              setIndex(7);
              setNewPartnerBox(4);
            }
            break;

          case 9:
            if (pricingStep === 1) {
              setPricingStep(0); // back to Pricing step-0
              setHideBottomImg(false); // show Pricing bottom again
            } else {
              setIndex(8);
            }
            break;

          case 10:
            setIndex(9);
            break;

          default:
            break;
        }
      }

      unlock();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [
    index,
    currentBox,
    replicaBox,
    howStep,
    newPartnerBox,
    newAboutBox,
    pricingStep,
    showFooter,
    TOTAL_HIGHLIGHT,
    TOTAL_REPLICA,
  ]);

  const HeroSection = (
    <motion.section
      key="hero"
      className="absolute inset-0 w-full h-screen home-bg"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <Header customClass="relative" />
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
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow-md hover:opacity-90 transition max-[576px]:text-[14px]">
            Start Free Trial
          </button>
          <button className="px-6 py-3 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50 transition max-[576px]:text-[14px]">
            Book a Demo
          </button>
        </div>
      </div>
    </motion.section>
  );

  // highlight section

  // const HighlightSection = (
  //     <motion.section
  //         key="highlight"
  //         className="absolute inset-0 w-full h-screen bg-[#DFF4EC] overflow-hidden"
  //         initial={{ y: "100%" }}
  //         animate={{ y: 0 }}
  //         exit={{ y: "-100%" }}
  //         transition={{ duration: 0.8, ease: "easeInOut" }}
  //     >
  //         <div className="relative w-full h-full max-w-[1537px] mx-auto">
  //             <AnimatePresence mode="wait">
  //                 {howStep === 0 ? (
  //                     // -------- STEP 0: centered heading only --------
  //                     <motion.div
  //                         key="hl-center"
  //                         className="absolute inset-0 flex items-center justify-center"
  //                         initial={{ opacity: 0, scale: 0.98 }}
  //                         animate={{ opacity: 1, scale: 1 }}
  //                         exit={{ opacity: 0, scale: 0.98 }}
  //                         transition={{ duration: 0.6, ease: "easeInOut" }}
  //                     >
  //                         <div className="text-center">
  //                             <div className="flex gap-2 justify-center items-center">
  //                                 <img src={assets.images.hiliteIcon} alt="icon" className="w-[138px] h-[134px]" />
  //                                 <span className="font-normal text-[6vw] text-primary">Highlights</span>
  //                             </div>
  //                         </div>
  //                     </motion.div>
  //                 ) : (
  //                     // -------- STEP 1: heading left, paragraph hides once currentBox >= 2, slides run here --------
  //                     // -------- STEP 1: heading left, paragraph hides once currentBox >= 2, slides run here --------
  //                     (() => {
  //                         const pinned = currentBox >= 2;            // slide 2 aate hi heading pin + neighbors visible
  //                         const showParagraph = currentBox === 1;    // paragraph only on first slide
  //                         const REVEAL_NEXT = 135;                   // next slide kitna upar dikhana (content visible)
  //                         const TOP_PREV = "0%";                     // prev slide top se kitna gap (content visible)
  //                         const CURRENT_Z = 100;
  //                         const NEXT_Z = 110;
  //                         const PREV_Z = 90;

  //                         return (
  //                             <motion.div
  //                                 key="hl-live"
  //                                 className="absolute inset-0"
  //                                 initial={{ opacity: 0, y: -8 }}
  //                                 animate={{ opacity: 1, y: 0 }}
  //                                 exit={{ opacity: 0, y: -8 }}
  //                                 transition={{ duration: 0.5, ease: "easeInOut" }}
  //                             >
  //                                 {/* Header area */}
  //                                 <div className="px-8 pt-8 relative flex justify-start items-center max-[576px]:flex-col">
  //                                     {/* Heading group → slide 2 par left-0 pe pin with transition */}
  //                                     <motion.div
  //                                         layout
  //                                         className={`flex items-center gap-2 shrink-0 ${pinned ? "absolute left-0 top-20 max-[1550px]:left-4 max-[1550px]:top-20" : ""}`}
  //                                         initial={false}
  //                                         animate={{ opacity: 1 }}
  //                                         transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
  //                                     >
  //                                         <img src={assets.images.hiliteIcon} alt="icon" className="w-[36px] h-[36px]" />
  //                                         <h2
  //                                             className={`text-primary font-normal leading-none ${pinned ? "text-[24px]" : "text-[26px]"
  //                                                 }`}
  //                                         >
  //                                             Highlights
  //                                         </h2>
  //                                     </motion.div>

  //                                     {/* Paragraph — sirf first slide pe */}
  //                                     <AnimatePresence initial={false} mode="wait">
  //                                         {showParagraph && (
  //                                             <motion.p
  //                                                 key="hl-paragraph"
  //                                                 className="text-primary/80 text-[16px] font-light leading-snug pl-[56px]" // thoda heading se offset
  //                                                 initial={{ opacity: 0, y: 6 }}
  //                                                 animate={{ opacity: 1, y: 0 }}
  //                                                 exit={{ opacity: 0, y: -6 }}
  //                                                 transition={{ duration: 0.25, ease: "easeOut" }}
  //                                             >
  //                                                 Rento isn’t just easier to use — it’s simpler to set up, quicker with support and
  //                                                 built with the right features to grow with you.
  //                                             </motion.p>
  //                                         )}
  //                                     </AnimatePresence>
  //                                 </div>

  //                                 {/* Slides container (same screen) */}
  //                                 <div className="px-6 pt-4">
  //                                     <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden max-w-[1220px] mx-auto max-[1600px]:h-[calc(100vh-60px)]  max-[1550px]:max-w-[1100px]">
  //                                         {boxes.map((box) => {
  //                                             let animate: Record<string, string | number> = {};
  //                                             let zIndex = 0;

  //                                             const order = box.id - currentBox;      // 0=current, 1=next, -1=previous

  //                                             if (order === 0) {
  //                                                 // current slide centered
  //                                                 animate = { top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 0.96 };
  //                                                 zIndex = CURRENT_Z;
  //                                             } else if (order === -1) {
  //                                                 // immediate PREVIOUS: bring to top area so content shows
  //                                                 animate = { top: TOP_PREV, left: "50%", x: "-50%", y: 0, scale: 0.92 };
  //                                                 zIndex = PREV_Z;
  //                                             } else if (order < -1) {
  //                                                 // older previous: push further up (hide)
  //                                                 animate = { top: "-140px", left: "50%", x: "-50%", y: 0, scale: 0.9 };
  //                                                 zIndex = box.id;
  //                                             } else if (order === 1) {
  //                                                 // NEXT: reveal enough from bottom so content is visible
  //                                                 animate = { top: `calc(100% - ${REVEAL_NEXT}px)`, left: "50%", x: "-50%", y: 0, scale: 1 };
  //                                                 zIndex = NEXT_Z;
  //                                             } else {
  //                                                 // future > next: keep below viewport
  //                                                 animate = { top: "calc(100% + 140px)", left: "50%", x: "-50%", y: 0, scale: 1 };
  //                                                 zIndex = box.id;
  //                                             }

  //                                             // Content visibility:
  //                                             // - Before slide 2: next content hidden
  //                                             // - After slide 2: prev & next content visible
  //                                             const hideInner =
  //                                                 order >= 2 || order <= -2 || (order === 1 && !pinned); // hide only deeper slides, and next before pin

  //                                             return (
  //                                                 <motion.div
  //                                                     key={box.id}
  //                                                     className="mx-auto absolute bg-white rounded-2xl  flex items-center justify-center w-full h-[68vh]"
  //                                                     style={{
  //                                                         zIndex,
  //                                                         backgroundImage: `url(${box.bg})`,
  //                                                         backgroundSize: "cover",
  //                                                         backgroundPosition: "center",
  //                                                     }}
  //                                                     animate={animate}
  //                                                     initial={false}
  //                                                     transition={{ duration: 0.8, ease: "easeInOut" }}
  //                                                 >
  //                                                     <div
  //                                                         className={[
  //                                                             "p-6 rounded-lg absolute inset-0 transition-opacity duration-300",
  //                                                             hideInner ? "opacity-0 pointer-events-none" : "opacity-100",
  //                                                         ].join(" ")}
  //                                                     >
  //                                                         <h3 className="text-[40px] font-normal mt-[-10px] mb-4 max-[1550px]:text-[34px]" style={{ color: box.titleColor }}>
  //                                                             {box.title}
  //                                                         </h3>
  //                                                         <p className="text-[21px] font-light max-w-5xl" style={{ color: box.descColor }}>
  //                                                             {box.description}
  //                                                         </p>
  //                                                     </div>
  //                                                 </motion.div>
  //                                             );
  //                                         })}
  //                                     </div>
  //                                 </div>
  //                             </motion.div>
  //                         );
  //                     })()

  //                 )}
  //             </AnimatePresence>
  //         </div>
  //     </motion.section>
  // );
  const HighlightSection = (
    <motion.section
      key="highlight"
      className="absolute inset-0 w-full h-screen bg-[#DFF4EC] overflow-hidden"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="relative w-full h-full max-w-[1537px] mx-auto">
        <AnimatePresence mode="wait">
          {howStep === 0 ? (
            // -------- STEP 0: centered heading only --------
            <motion.div
              key="hl-center"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <div className="text-center">
                <div className="flex gap-6 justify-center items-center">
                  <img
                    src={assets.images.hiliteIcon}
                    alt="icon"
                    className="w-[138px] h-[134px]"
                  />
                  <span className="font-normal text-[6vw] text-primary">
                    Highlights
                  </span>
                </div>
                <AnimatePresence>
                  {!hideHLBottomImg && (
                    <motion.div
                      key="hl-bottom-img"
                      className="fixed left-0 right-0 bottom-0 z-[5] pointer-events-none select-none px-6"
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 40, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                      <img
                        src={assets.images.bottomHighlight}
                        alt="highlight bottom"
                        className="w-full h-auto max-w-[1220px] mx-auto"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            // -------- STEP 1 --------
            (() => {
              const pinned = currentBox >= 2; // slide 2 aate hi neighbors visible/pinned
              const showParagraph = currentBox === 1; // paragraph only on first slide
              const REVEAL_NEXT = 135;
              const TOP_PREV = '0%';
              const CURRENT_Z = 100;
              const NEXT_Z = 110;
              const PREV_Z = 90;

              return (
                <motion.div
                  key="hl-live"
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {/* Header */}
                  <div className="px-8 pt-8 relative flex justify-start items-center max-[576px]:flex-col">
                    <motion.div
                      layout
                      className={`flex items-center gap-2 shrink-0 ${pinned ? 'absolute left-0 top-20 max-[1550px]:left-4 max-[1550px]:top-20' : ''}`}
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{
                        layout: { duration: 0.4, ease: 'easeInOut' },
                      }}
                    >
                      <img
                        src={assets.images.hiliteIcon}
                        alt="icon"
                        className="w-[36px] h-[36px]"
                      />
                      <h2
                        className={`text-primary font-normal leading-none ${pinned ? 'text-[24px]' : 'text-[26px]'}`}
                      >
                        Highlights
                      </h2>
                    </motion.div>

                    {/* Paragraph — sirf first slide pe */}
                    <AnimatePresence initial={false} mode="wait">
                      {showParagraph && (
                        <motion.p
                          key="hl-paragraph"
                          className="text-primary text-[16px] font-light leading-snug pl-[56px]"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                          Rento isn’t just easier to use — it’s simpler to set
                          up, quicker with support and built with the right
                          features to grow with you.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Slides */}
                  <div className="px-6 pt-4">
                    <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden max-w-[1220px] mx-auto max-[1600px]:h-[calc(100vh-60px)] max-[1550px]:max-w-[1100px]">
                      {boxes.map((box) => {
                        let animate: Record<string, string | number> = {};
                        let zIndex = 0;
                        const order = box.id - currentBox; // 0=current, 1=next, -1=prev

                        if (order === 0) {
                          animate = {
                            top: '50%',
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                            scale: 0.96,
                          };
                          zIndex = CURRENT_Z;
                        } else if (order === -1) {
                          animate = {
                            top: TOP_PREV,
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 0.92,
                          };
                          zIndex = PREV_Z;
                        } else if (order < -1) {
                          animate = {
                            top: '-140px',
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 0.9,
                          };
                          zIndex = box.id;
                        } else if (order === 1) {
                          animate = {
                            top: `calc(100% - ${REVEAL_NEXT}px)`,
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 1,
                          };
                          zIndex = NEXT_Z;
                        } else {
                          animate = {
                            top: 'calc(100% + 140px)',
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 1,
                          };
                          zIndex = box.id;
                        }

                        // pehle se jo deep slides hide ho rahe thay — same
                        const hideInner =
                          order >= 2 || order <= -2 || (order === 1 && !pinned);

                        // ---- NEW: content visibility rules ----
                        const isCurrent = order === 0;
                        const isPrev = order === -1;
                        const isNext = order === 1;

                        // NEXT description rule:
                        // slide 2 ke baad (pinned === true), next slide ki description hide
                        const showDescription =
                          !hideInner &&
                          (isCurrent ||
                            isPrev || // prev pe description allow (agar tumhe prev pe bhi sirf title chahiye ho to isPrev hata do)
                            (isNext && !pinned)); // next pe sirf tab jab pinned false ho (i.e., slide 1)

                        const showTitle =
                          !hideInner && (isCurrent || isPrev || isNext);

                        // ---- NEW: 4th slide height 100% jab woh current ho ----
                        const cardHeightClass =
                          isCurrent && box.id === 4 ? 'h-[70vh]' : 'h-[68vh]';

                        return (
                          <motion.div
                            key={box.id}
                            className={`mx-auto absolute bg-white rounded-2xl flex items-center justify-center w-full ${cardHeightClass}`}
                            style={{
                              zIndex,
                              backgroundImage: `url(${box.bg})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                            animate={animate}
                            initial={false}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                          >
                            <div
                              className={[
                                'p-6 rounded-lg absolute inset-0 transition-opacity duration-300',
                                hideInner
                                  ? 'opacity-0 pointer-events-none'
                                  : 'opacity-100',
                              ].join(' ')}
                            >
                              {showTitle && (
                                <h3
                                  className="text-[40px] font-normal mt-[-7px] mb-4 max-[1550px]:text-[34px]"
                                  style={{ color: box.titleColor }}
                                >
                                  {box.title}
                                </h3>
                              )}

                              {showDescription && (
                                <p
                                  className="text-[21px] font-light max-w-5xl max-[1600px]:text-[18px]"
                                  style={{ color: box.descColor }}
                                >
                                  {box.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })()
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );

  // const HighlightSection = (
  //   <motion.section
  //     key="highlight"
  //     className="absolute inset-0 w-full h-screen bg-[#DFF4EC] overflow-hidden"
  //     initial={{ y: "100%" }}
  //     animate={{ y: 0 }}
  //     exit={{ y: "-100%" }}
  //     transition={{ duration: 0.8, ease: "easeInOut" }}
  //   >
  //     <div className="relative w-full h-full">
  //       <AnimatePresence mode="wait">
  //         {howStep === 0 ? (
  //           // -------- STEP 0: centered heading only --------
  //           <motion.div
  //             key="hl-center"
  //             className="absolute inset-0 flex items-center justify-center"
  //             initial={{ opacity: 0, scale: 0.98 }}
  //             animate={{ opacity: 1, scale: 1 }}
  //             exit={{ opacity: 0, scale: 0.98 }}
  //             transition={{ duration: 0.6, ease: "easeInOut" }}
  //           >
  //             <div className="text-center">
  //               <div className="flex gap-2 justify-center items-center">
  //                 <img src={assets.images.hiliteIcon} alt="icon" className="w-[50px] h-[50px]" />
  //                 <span className="font-normal text-[40px] text-primary">Highlight</span>
  //               </div>
  //             </div>
  //           </motion.div>
  //         ) : (
  //           // -------- STEP 1: slide-in-place + responsive compact mode when currentBox >=2 --------
  //           (() => {
  //             const GAP = 6;             // space between future slides
  //             const PEEK = 36;           // how much of the next slide peeks from bottom
  //             const BOTTOM_PX = 8;       // = bottom-2
  //             const baselineTop = `calc(100% - ${PEEK + BOTTOM_PX}px)`;

  //             const isCompact = howStep === 1 && currentBox >= 2;   // 👈 slide 2 se compact row
  //             const showParagraph = !isCompact && currentBox === 1; // only on first slide

  //             return (
  //               <motion.div
  //                 key={isCompact ? "hl-compact" : "hl-live"}
  //                 className="absolute inset-0"
  //                 initial={{ opacity: 0, y: -8 }}
  //                 animate={{ opacity: 1, y: 0 }}
  //                 exit={{ opacity: 0, y: -8 }}
  //                 transition={{ duration: 0.5, ease: "easeInOut" }}
  //               >
  //                 {/* Wrap everything in a centered max-width container */}
  //                 <div className="px-6 pt-6">
  //                   <div
  //                     className={
  //                       "mx-auto max-w-[1220px] " +
  //                       (isCompact ? "flex items-start gap-6" : "")
  //                     }
  //                   >
  //                     {/* Heading (left) */}
  //                     <div className={"shrink-0 " + (isCompact ? "pt-2" : "")}>
  //                       <div className="flex items-center gap-2">
  //                         <img src={assets.images.hiliteIcon} alt="icon" className={isCompact ? "w-[36px] h-[36px]" : "w-[40px] h-[40px]"} />
  //                         <h2 className={"text-primary font-semibold leading-none " + (isCompact ? "text-[26px]" : "text-[28px]")}>
  //                           Highlight
  //                         </h2>
  //                       </div>

  //                       {/* Paragraph only on first slide; hides exactly when slide changes */}
  //                       <AnimatePresence initial={false} mode="wait">
  //                         {showParagraph && (
  //                           <motion.p
  //                             key="hl-paragraph"
  //                             className="mt-3 text-primary/80 text-[16px] font-light leading-snug max-w-[900px]"
  //                             initial={{ opacity: 0, y: 6 }}
  //                             animate={{ opacity: 1, y: 0 }}
  //                             exit={{ opacity: 0, y: -6 }}
  //                             transition={{ duration: 0.25, ease: "easeOut" }}
  //                           >
  //                             Rento isn’t just easier to use — it’s simpler to set up, quicker
  //                             with support,{" "}
  //                             <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
  //                               and built with the right features to grow with you.
  //                             </span>
  //                           </motion.p>
  //                         )}
  //                       </AnimatePresence>
  //                     </div>

  //                     {/* Slides (right in compact; below in expanded) */}
  //                     <div className={isCompact ? "flex-1" : "mt-5 w-full"}>
  //                       <div className="relative w-full h-[calc(100vh-140px)] overflow-hidden rounded-2xl">
  //                         {boxes.map((box) => {
  //                           let animate: Record<string, string | number> = {};
  //                           let zIndex = 0;

  //                           if (box.id < currentBox) {
  //                             // past slides: stack to top a bit
  //                             animate = { top: 10, left: "50%", x: "-50%", y: 0, scale: 0.92 };
  //                             zIndex = box.id;
  //                           } else if (box.id === currentBox) {
  //                             // active centered
  //                             animate = { top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 0.96 };
  //                             zIndex = 100;
  //                           } else {
  //                             // future slides: bottom baseline + spacing
  //                             const order = box.id - currentBox; // 1 = next
  //                             const yLift = order === 1 ? 0 : -(order - 1) * GAP;
  //                             animate = { top: baselineTop, left: "50%", x: "-50%", y: yLift, scale: 1 };
  //                             zIndex = box.id;
  //                           }

  //                           return (
  //                             <motion.div
  //                               key={box.id}
  //                               className="mx-auto absolute bg-white rounded-2xl shadow-2xl flex items-center justify-center w-full h-[78vh]"
  //                               style={{
  //                                 zIndex,
  //                                 backgroundImage: `url(${box.bg})`,
  //                                 backgroundSize: "cover",
  //                                 backgroundPosition: "center",
  //                               }}
  //                               animate={animate}
  //                               initial={false}
  //                               transition={{ duration: 0.8, ease: "easeInOut" }}
  //                             >
  //                               <div className="p-6 rounded-lg absolute inset-0">
  //                                 <h3 className="text-[40px] font-normal mb-4" style={{ color: box.titleColor }}>
  //                                   {box.title}
  //                                 </h3>
  //                                 <p className="text-[21px] font-light max-w-5xl" style={{ color: box.descColor }}>
  //                                   {box.description}
  //                                 </p>
  //                               </div>
  //                             </motion.div>
  //                           );
  //                         })}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </motion.div>
  //             );
  //           })()
  //         )}
  //       </AnimatePresence>
  //     </div>
  //   </motion.section>
  // );

  // const HighlightSection = (
  //     <motion.section
  //         key="highlight"
  //         className="absolute inset-0 w-full h-screen bg-[#DFF4EC] overflow-hidden"
  //         initial={{ y: "100%" }}
  //         animate={{ y: 0 }}
  //         exit={{ y: "-100%" }}
  //         transition={{ duration: 0.8, ease: "easeInOut" }}
  //     >
  //         <div className="relative w-full h-full">
  //             <AnimatePresence mode="wait">
  //                 {howStep === 0 ? (
  //                     // -------- STEP 0: centered heading only --------
  //                     <motion.div
  //                         key="hl-center"
  //                         className="absolute inset-0 flex items-center justify-center"
  //                         initial={{ opacity: 0, scale: 0.98 }}
  //                         animate={{ opacity: 1, scale: 1 }}
  //                         exit={{ opacity: 0, scale: 0.98 }}
  //                         transition={{ duration: 0.6, ease: "easeInOut" }}
  //                     >
  //                         <div className="text-center">
  //                             <div className="flex gap-2 justify-center items-center">
  //                                 <img src={assets.images.hiliteIcon} alt="icon" className="w-[50px] h-[50px]" />
  //                                 <span className="font-normal text-[40px] text-primary">Highlight</span>
  //                             </div>
  //                         </div>
  //                     </motion.div>
  //                 ) : (
  //                     // -------- STEP 1: same screen — slide 2 par compact row (heading + slides inline) --------
  //                     (() => {
  //                         const GAP = 6;              // space between future slides
  //                         const PEEK = 36;            // how much of next slide peeks
  //                         const BOTTOM_PX = 8;        // bottom-2
  //                         const baselineTop = `calc(100% - ${PEEK + BOTTOM_PX}px)`;

  //                         const isCompact = howStep === 1 && currentBox >= 2;   // 👈 slide 2 se row layout
  //                         const showParagraph = !isCompact && currentBox === 1; // paragraph only on slide 1

  //                         return (
  //                             <motion.div
  //                                 key="hl-live"
  //                                 className="absolute inset-0"
  //                                 initial={{ opacity: 0, y: -6 }}
  //                                 animate={{ opacity: 1, y: 0 }}
  //                                 exit={{ opacity: 0, y: -6 }}
  //                                 transition={{ duration: 0.4, ease: "easeInOut" }}
  //                             >
  //                                 {/* Centered container with responsive ROW when compact */}
  //                                 <div className="px-6 pt-6">
  //                                     <div
  //                                         className={[
  //                                             "mx-auto max-w-[1220px] grid gap-6 transition-all duration-300",
  //                                             "items-start",               // vertical center for row layout
  //                                             "grid-cols-12",               // always 12-col grid
  //                                         ].join(" ")}
  //                                     >
  //                                         {/* Heading + (optional) paragraph */}
  //                                         <div
  //                                             className={[
  //                                                 "transition-all duration-300",
  //                                                 isCompact ? "col-span-12 md:col-span-4" : "col-span-12",
  //                                             ].join(" ")}
  //                                         >
  //                                             <div className="flex items-center gap-2 pt-3">
  //                                                 <img
  //                                                     src={assets.images.hiliteIcon}
  //                                                     alt="icon"
  //                                                     className={isCompact ? "w-[36px] h-[36px]" : "w-[40px] h-[40px]"}
  //                                                 />
  //                                                 <h2
  //                                                     className={[
  //                                                         "text-primary font-semibold leading-none transition-all duration-300",
  //                                                         isCompact ? "text-[26px]" : "text-[28px]",
  //                                                     ].join(" ")}
  //                                                 >
  //                                                     Highlight
  //                                                 </h2>
  //                                             </div>

  //                                             {/* Paragraph — hides the exact tick slide changes to 2 */}
  //                                             <AnimatePresence initial={false} mode="wait">
  //                                                 {showParagraph && (
  //                                                     <motion.p
  //                                                         key="hl-paragraph"
  //                                                         className="mt-3 text-primary/80 text-[16px] font-light leading-snug max-w-[900px]"
  //                                                         initial={{ opacity: 0, y: 6 }}
  //                                                         animate={{ opacity: 1, y: 0 }}
  //                                                         exit={{ opacity: 0, y: -6 }}
  //                                                         transition={{ duration: 0.22, ease: "easeOut" }}
  //                                                     >
  //                                                         Rento isn’t just easier to use — it’s simpler to set up, quicker
  //                                                         with support,{" "}
  //                                                         <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
  //                                                             and built with the right features to grow with you.
  //                                                         </span>
  //                                                     </motion.p>
  //                                                 )}
  //                                             </AnimatePresence>
  //                                         </div>

  //                                         {/* Slides container — same screen; right side in compact, full width otherwise */}
  //                                         <div
  //                                             className={[
  //                                                 "transition-all duration-300",
  //                                                 isCompact ? "col-span-12 md:col-span-8" : "col-span-12",
  //                                             ].join(" ")}
  //                                         >
  //                                             <div className="relative w-full h-[calc(100vh-140px)] overflow-hidden rounded-2xl">
  //                                                 {boxes.map((box) => {
  //                                                     let animate: Record<string, string | number> = {};
  //                                                     let zIndex = 0;

  //                                                     if (box.id < currentBox) {
  //                                                         // past slides
  //                                                         animate = { top: 10, left: "50%", x: "-50%", y: 0, scale: 0.92 };
  //                                                         zIndex = box.id;
  //                                                     } else if (box.id === currentBox) {
  //                                                         // active centered
  //                                                         animate = { top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 0.96 };
  //                                                         zIndex = 100;
  //                                                     } else {
  //                                                         // future slides: bottom baseline + spacing, next doesn't stick
  //                                                         const order = box.id - currentBox;     // 1 = next
  //                                                         const yLift = order === 1 ? 0 : -(order - 1) * GAP;
  //                                                         animate = { top: baselineTop, left: "50%", x: "-50%", y: yLift, scale: 1 };
  //                                                         zIndex = box.id;
  //                                                     }

  //                                                     return (
  //                                                         <motion.div
  //                                                             key={box.id}
  //                                                             className="mx-auto absolute bg-white rounded-2xl shadow-2xl flex items-center justify-center w-full h-[78vh]"
  //                                                             style={{
  //                                                                 zIndex,
  //                                                                 backgroundImage: `url(${box.bg})`,
  //                                                                 backgroundSize: "cover",
  //                                                                 backgroundPosition: "center",
  //                                                             }}
  //                                                             animate={animate}
  //                                                             initial={false}
  //                                                             transition={{ duration: 0.8, ease: "easeInOut" }}
  //                                                         >
  //                                                             <div className="p-6 rounded-lg absolute inset-0">
  //                                                                 <h3 className="text-[40px] font-normal mb-4" style={{ color: box.titleColor }}>
  //                                                                     {box.title}
  //                                                                 </h3>
  //                                                                 <p className="text-[21px] font-light max-w-5xl" style={{ color: box.descColor }}>
  //                                                                     {box.description}
  //                                                                 </p>
  //                                                             </div>
  //                                                         </motion.div>
  //                                                     );
  //                                                 })}
  //                                             </div>
  //                                         </div>
  //                                     </div>
  //                                 </div>
  //                             </motion.div>
  //                         );
  //                     })()
  //                 )}
  //             </AnimatePresence>
  //         </div>
  //     </motion.section>
  // );

  // ---------------- Partner Section ----------------
  const PartnerSection = (
    <motion.section
      key="partner"
      className="absolute inset-0 w-full h-screen bg-primary flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-6">
        {/* <h2 className="text-white text-5xl font-bold mb-6">Our Partners</h2> */}
        <p className="text-white  mx-auto text-[110px] leading-tight max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
          Rento is more than just property management software,
          <span className="text-[96px]  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
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
      key="whychoose"
      className="absolute inset-0 w-full h-screen bg-primary flex items-center justify-center"
      initial={{ scale: 0, opacity: 0, borderRadius: '50%' }} // start as small circle center
      animate={{ scale: 1, opacity: 1, borderRadius: '0%' }} // expand full screen like flower open
      exit={{ scale: 0, opacity: 0, borderRadius: '50%' }} // reverse when leaving
      transition={{ duration: 2, ease: [0.68, -0.55, 0.27, 1.55] }} // smooth elastic animation
    >
      <div className="text-center px-2 w-[96%] h-[90%] bg-[#DFF4EC] relative  rounded-[10px]">
        <div className="absolute top-10 left-10 z-[111]">
          <h2 className="text-left text-[40px] font-medium text-[#242460] mb-6">
            Why Choose Us?
          </h2>
          <ul className="px-5 list-disc text-left text-primary text-[28px] font-normal leading-normal space-y-3 max-[1024px]:text-[24px] max-w-[600px] min-[1400px]:max-w-[800px] marker:text-[#242460]">
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
            className="object-contain w-full h-full object-right max-[1260px]:opacity-35"
          />
        </div>
      </div>
    </motion.section>
  );

  // // ----------------Replica----------------

  // const HowSection = (
  //     <motion.section
  //         key="how"
  //         className="absolute inset-0 w-full h-screen bg-[#DFF4EC] overflow-hidden"
  //         initial={{ y: "100%" }}
  //         animate={{ y: 0 }}
  //         exit={{ y: "-100%" }}
  //         transition={{ duration: 0.8, ease: "easeInOut" }}
  //     >
  //         <div className="relative w-full h-full">
  //             <AnimatePresence mode="wait">
  //                 {howStep === 0 ? (
  //                     // -------- STEP 0: centered heading only --------
  //                     <motion.div
  //                         key="how-center"
  //                         className="absolute inset-0 flex items-center justify-center"
  //                         initial={{ opacity: 0, scale: 0.98 }}
  //                         animate={{ opacity: 1, scale: 1 }}
  //                         exit={{ opacity: 0, scale: 0.98 }}
  //                         transition={{ duration: 0.6, ease: "easeInOut" }}
  //                     >
  //                         <div className="text-center">
  //                             <div className="flex gap-2 justify-center items-center">
  //                                 <img src={assets.images.howorkIcon} alt="icon" className="w-[50px] h-[50px]" />
  //                                 <span className="font-normal text-[40px] text-primary">How It Works</span>
  //                             </div>
  //                         </div>
  //                     </motion.div>
  //                 ) : (
  //                     // -------- STEP 1: heading left, paragraph hides once replicaBox >= 2, slides run here --------
  //                     (() => {
  //                         // const GAP = 6;           // future slides ke beech space lift per level
  //                         // const PEEK = 36;         // bottom peek pixels
  //                         // const BOTTOM_2 = -20;      // bottom-2 = 8px
  //                         // const baselineTop = `calc(100% - ${PEEK + BOTTOM_2}px)`;
  //                         const showParagraph = replicaBox === 1; // slide 2 aate hi hide

  //                         return (
  //                             <motion.div
  //                                 key="how-live"
  //                                 className="absolute inset-0"
  //                                 initial={{ opacity: 0, y: -8 }}
  //                                 animate={{ opacity: 1, y: 0 }}
  //                                 exit={{ opacity: 0, y: -8 }}
  //                                 transition={{ duration: 0.5, ease: "easeInOut" }}
  //                             >
  //                                 {/* Header row (left) */}
  //                                 <div className="px-8 pt-8 flex items-center gap-6 max-[576px]:flex-col">
  //                                     <div className="flex items-center gap-2 shrink-0">
  //                                         <img src={assets.images.howorkIcon} alt="icon" className="w-[36px] h-[36px]" />
  //                                         <h2 className="text-primary font-semibold text-[26px] leading-none">
  //                                             How It Works
  //                                         </h2>
  //                                     </div>

  //                                     {/* Paragraph first slide pe hi dikhayen */}
  //                                     <AnimatePresence initial={false} mode="wait">
  //                                         {showParagraph && (
  //                                             <motion.p
  //                                                 key="how-paragraph"
  //                                                 className="text-primary/80 text-[16px] font-light leading-snug max-w-[900px]"
  //                                                 initial={{ opacity: 0, y: 6 }}
  //                                                 animate={{ opacity: 1, y: 0 }}
  //                                                 exit={{ opacity: 0, y: -6 }}
  //                                                 transition={{ duration: 0.3, ease: "easeOut" }}
  //                                             >
  //                                                 Our platform is built for landlords, managers, and tenants —{" "}
  //                                                 <span className="pt-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
  //                                                     four smart portals, tailored for every role.
  //                                                 </span>
  //                                             </motion.p>
  //                                         )}
  //                                     </AnimatePresence>
  //                                 </div>

  //                                 {/* Slides container lives on the SAME screen */}
  //                                 <div className="px-6 pt-4">
  //                                     <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden ">

  //                                         {repboxes.map((box) => {
  //                                             const REVEAL = 100;        // bottom-[30px] pe next slide ki tail
  //                                             const CURRENT_Z = 100;
  //                                             const NEXT_Z = 110;

  //                                             let animate: Record<string, string | number> = {};
  //                                             let zIndex = 0;

  //                                             const order = box.id - replicaBox; // 0 = current, 1 = next, 2+ = future

  //                                             if (box.id < replicaBox) {
  //                                                 // Past slides: thoda upar stack
  //                                                 animate = { top: 10, left: "50%", x: "-50%", y: 0, scale: 0.92 };
  //                                                 zIndex = box.id; // lower z
  //                                             } else if (order === 0) {
  //                                                 // Current slide: center
  //                                                 animate = { top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 0.96 };
  //                                                 zIndex = CURRENT_Z; // e.g., z-1 in your naming
  //                                             } else if (order === 1) {
  //                                                 // Next slide: sirf tail dikhani — container ke bottom se 30px upar
  //                                                 animate = { top: `calc(100% - ${REVEAL}px)`, left: "50%", x: "-50%", y: 0, scale: 1 };
  //                                                 zIndex = NEXT_Z; // e.g., z-11 (current se upar layer)
  //                                             } else {
  //                                                 // Future slides: viewport ke niche push kar do (bilkul na dikhay)
  //                                                 animate = { top: "calc(100% + 120px)", left: "50%", x: "-50%", y: 0, scale: 1 };
  //                                                 zIndex = box.id; // doesn’t matter much, they’re hidden
  //                                             }

  //                                             // content hide rule: next & future slides ka content invisible
  //                                             const hideInner = order >= 1;

  //                                             return (
  //                                                 <motion.div
  //                                                     key={box.id}
  //                                                     className="mx-auto absolute bg-white rounded-2xl shadow-2xl flex items-center justify-center w-full h-[78vh]"
  //                                                     style={{
  //                                                         zIndex,
  //                                                         backgroundImage: `url(${box.bg})`,
  //                                                         backgroundSize: "cover",
  //                                                         backgroundPosition: "center",
  //                                                     }}
  //                                                     animate={animate}
  //                                                     initial={false}
  //                                                     transition={{ duration: 0.8, ease: "easeInOut" }}
  //                                                 >
  //                                                     <div
  //                                                         className={[
  //                                                             "p-6 rounded-lg absolute inset-0 transition-opacity duration-300",
  //                                                             hideInner ? "opacity-0 pointer-events-none" : "opacity-100",
  //                                                         ].join(" ")}
  //                                                     >
  //                                                         <h3 className="text-[40px] font-normal mb-1" style={{ color: box.titleColor }}>
  //                                                             {box.title}
  //                                                         </h3>
  //                                                         <p className="text-[21px] font-light max-w-5xl" style={{ color: box.descColor }}>
  //                                                             {box.description}
  //                                                         </p>
  //                                                             <ul className="list-disc pl-4 space-y-2 mt-5">
  //                                                             {box.bullets?.map((bullet, idx) => (
  //                                                                 <li
  //                                                                     key={idx}
  //                                                                     className="text-[18px] font-light"
  //                                                                     style={{ color: box.descColor }}
  //                                                                 >
  //                                                                     {bullet}
  //                                                                 </li>
  //                                                             ))}
  //                                                         </ul>
  //                                                     </div>
  //                                                 </motion.div>
  //                                             );
  //                                         })}

  //                                     </div>
  //                                 </div>
  //                             </motion.div>
  //                         );
  //                     })()
  //                 )}
  //             </AnimatePresence>
  //         </div>
  //     </motion.section>
  // );

  // const HowSection = (
  //     <motion.section
  //         key="how"
  //         className="absolute inset-0 w-full h-screen bg-[#DFF4EC] overflow-hidden"
  //         initial={{ y: "100%" }}
  //         animate={{ y: 0 }}
  //         exit={{ y: "-100%" }}
  //         transition={{ duration: 0.8, ease: "easeInOut" }}
  //     >
  //         <div className="relative w-full h-full">
  //             <AnimatePresence mode="wait">
  //                 {howStep === 0 ? (
  //                     // -------- STEP 0: centered heading only --------
  //                     <motion.div
  //                         key="how-center"
  //                         className="absolute inset-0 flex items-center justify-center"
  //                         initial={{ opacity: 0, scale: 0.98 }}
  //                         animate={{ opacity: 1, scale: 1 }}
  //                         exit={{ opacity: 0, scale: 0.98 }}
  //                         transition={{ duration: 0.6, ease: "easeInOut" }}
  //                     >
  //                         <div className="text-center">
  //                             <div className="flex gap-2 justify-center items-center">
  //                                 <img src={assets.images.howorkIcon} alt="icon" className="w-[50px] h-[50px]" />
  //                                 <span className="font-normal text-[40px] text-primary">How It Works</span>
  //                             </div>
  //                         </div>
  //                     </motion.div>
  //                 ) : howStep === 1 ? (
  //                     // -------- STEP 1: heading goes TOP, gradient paragraph in CENTER --------
  //                     <motion.div
  //                         key="how-top-with-paragraph"
  //                         className="absolute inset-0"
  //                         initial={{ opacity: 0 }}
  //                         animate={{ opacity: 1 }}
  //                         exit={{ opacity: 0 }}
  //                         transition={{ duration: 0.4, ease: "easeInOut" }}
  //                     >
  //                         {/* Heading pinned to TOP (left) */}
  //                         <motion.div
  //                             className="absolute flex items-center gap-2"
  //                             initial={{ y: -30, opacity: 0 }}
  //                             animate={{ y: 0, opacity: 1 }}
  //                             exit={{ y: -20, opacity: 0 }}
  //                             transition={{ duration: 0.5, ease: "easeOut" }}
  //                             style={{ top: 24, left: 30 }}
  //                         >
  //                             <img src={assets.images.howorkIcon} alt="icon" className="w-[36px] h-[36px]" />
  //                             <h2 className="text-primary font-semibold text-[26px] leading-none">
  //                                 How It Works
  //                             </h2>
  //                         </motion.div>

  //                         {/* Center paragraph with gradient */}
  //                         <motion.p
  //                             className="absolute text-center text-[22px] md:text-[26px] font-light leading-snug px-6"
  //                             initial={{ opacity: 0, y: 10 }}
  //                             animate={{ opacity: 1, y: 0 }}
  //                             exit={{ opacity: 0, y: -10 }}
  //                             transition={{ duration: 0.45, ease: "easeOut" }}
  //                             style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
  //                         >
  //                             <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
  //                                 Built for landlords, managers, and tenants—four smart portals, tailored for every role.
  //                             </span>
  //                         </motion.p>
  //                     </motion.div>
  //                 ) : (
  //                     // -------- STEP 2: start slides (heading left, paragraph hidden) --------
  //                     (() => {
  //                         const REVEAL = 100;     // next slide tail
  //                         const CURRENT_Z = 100;
  //                         const NEXT_Z = 110;

  //                         return (
  //                             <motion.div
  //                                 key="how-live"
  //                                 className="absolute inset-0"
  //                                 initial={{ opacity: 0, y: -8 }}
  //                                 animate={{ opacity: 1, y: 0 }}
  //                                 exit={{ opacity: 0, y: -8 }}
  //                                 transition={{ duration: 0.5, ease: "easeInOut" }}
  //                             >
  //                                 {/* Heading (left, top) */}
  //                                 <div className="px-8 pt-8 flex items-center gap-6">
  //                                     <div className="flex items-center gap-2 shrink-0">
  //                                         <img src={assets.images.howorkIcon} alt="icon" className="w-[36px] h-[36px]" />
  //                                         <h2 className="text-primary font-semibold text-[26px] leading-none">
  //                                             How It Works
  //                                         </h2>
  //                                     </div>
  //                                     {/* paragraph intentionally hidden in step 2 */}
  //                                 </div>

  //                                 {/* Slides container (same screen) */}
  //                                 <div className="px-6 pt-4">
  //                                     <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden">
  //                                         {repboxes.map((box) => {
  //                                             let animate: Record<string, string | number> = {};
  //                                             let zIndex = 0;

  //                                             const order = box.id - replicaBox; // 0=current, 1=next, 2+=future

  //                                             if (box.id < replicaBox) {
  //                                                 animate = { top: 10, left: "50%", x: "-50%", y: 0, scale: 0.92 };
  //                                                 zIndex = box.id;
  //                                             } else if (order === 0) {
  //                                                 animate = { top: "50%", left: "50%", x: "-50%", y: "-50%", scale: 0.96 };
  //                                                 zIndex = CURRENT_Z;
  //                                             } else if (order === 1) {
  //                                                 animate = { top: `calc(100% - ${REVEAL}px)`, left: "50%", x: "-50%", y: 0, scale: 1 };
  //                                                 zIndex = NEXT_Z;
  //                                             } else {
  //                                                 animate = { top: "calc(100% + 120px)", left: "50%", x: "-50%", y: 0, scale: 1 };
  //                                                 zIndex = box.id;
  //                                             }

  //                                             const hideInner = order >= 1;

  //                                             return (
  //                                                 <motion.div
  //                                                     key={box.id}
  //                                                     className="mx-auto absolute bg-white rounded-2xl shadow-2xl flex items-center justify-center w-full h-[78vh]"
  //                                                     style={{
  //                                                         zIndex,
  //                                                         backgroundImage: `url(${box.bg})`,
  //                                                         backgroundSize: "cover",
  //                                                         backgroundPosition: "center",
  //                                                     }}
  //                                                     animate={animate}
  //                                                     initial={false}
  //                                                     transition={{ duration: 0.8, ease: "easeInOut" }}
  //                                                 >
  //                                                     <div
  //                                                         className={[
  //                                                             "p-6 rounded-lg absolute inset-0 transition-opacity duration-300",
  //                                                             hideInner ? "opacity-0 pointer-events-none" : "opacity-100",
  //                                                         ].join(" ")}
  //                                                     >
  //                                                         <h3 className="text-[40px] font-normal mb-1" style={{ color: box.titleColor }}>
  //                                                             {box.title}
  //                                                         </h3>
  //                                                         {box.description && (
  //                                                             <p className="text-[21px] font-light max-w-5xl" style={{ color: box.descColor }}>
  //                                                                 {box.description}
  //                                                             </p>
  //                                                         )}
  //                                                         {!!box.bullets?.length && (
  //                                                             <ul className="list-disc pl-4 space-y-2 mt-5">
  //                                                                 {box.bullets.map((bullet, idx) => (
  //                                                                     <li key={idx} className="text-[18px] font-light" style={{ color: box.descColor }}>
  //                                                                         {bullet}
  //                                                                     </li>
  //                                                                 ))}
  //                                                             </ul>
  //                                                         )}
  //                                                     </div>
  //                                                 </motion.div>
  //                                             );
  //                                         })}
  //                                     </div>
  //                                 </div>
  //                             </motion.div>
  //                         );
  //                     })()
  //                 )}
  //             </AnimatePresence>
  //         </div>
  //     </motion.section>
  // );

  const HowSection = (
    <motion.section
      key="how"
      className="absolute inset-0 w-full h-screen bg-[#DFF4EC] overflow-hidden"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="relative w-full h-full max-w-[1537px] mx-auto">
        <AnimatePresence mode="wait">
          {howStep === 0 ? (
            // -------- STEP 0: centered heading only --------
            <motion.div
              key="how-center"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <div className="text-center">
                <div className="flex gap-2 justify-center items-center">
                  <img
                    src={assets.images.howorkIcon}
                    alt="icon"
                    className="w-[138px] h-[134px]"
                  />
                  <span className="font-normal text-[6vw] text-primary">
                    How It Works
                  </span>
                </div>
              </div>
            </motion.div>
          ) : howStep === 1 ? (
            // -------- STEP 1: heading TOP (smaller) + gradient subheading in CENTER --------
            <motion.div
              key="how-top-with-sub"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              {/* Heading pinned to TOP-LEFT with smaller font */}
              <motion.div
                className="absolute flex items-center gap-2 justify-center"
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ top: '10%', left: 0, right: 0 }}
              >
                <img
                  src={assets.images.howorkIcon}
                  alt="icon"
                  className="w-[36px] h-[36px]"
                />
                <h2 className="text-primary font-semibold text-[26px] leading-none">
                  How It Works
                </h2>
              </motion.div>

              {/* Center gradient subheading */}
              <motion.p
                className="absolute text-center text-[22px] md:text-[26px] font-normal leading-snug px-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ top: '30%', left: '0', right: '0' }}
              >
                <span className="text-[4vw] max-w-[1200px] mx-auto block text-primary">
                  Built for landlords, managers, and tenants—four smart portals,
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    tailored for every role.
                  </span>
                </span>
              </motion.p>
              <AnimatePresence>
                {!hideHowBottomImg && (
                  <motion.div
                    key="hl-bottom-img"
                    className="fixed left-0 right-0 bottom-0 z-[5] pointer-events-none select-none px-6"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <img
                      src={assets.images.bottomWorks}
                      alt="how it bottom"
                      className="w-full h-auto max-w-[1220px] mx-auto"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            // HOW IT WORKS — now mirrors STEP 1 (Highlights) logic
            (() => {
              const pinned = replicaBox >= 2; // slide 2 aate hi neighbors visible/pinned
              const showParagraph = replicaBox === 1; // paragraph only on first slide
              const REVEAL_NEXT = 135;
              const TOP_PREV = '0%';
              const CURRENT_Z = 100;
              const NEXT_Z = 110;
              const PREV_Z = 90;

              return (
                <motion.div
                  key="how-live"
                  className="absolute inset-0"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {/* Header — pin like step 1, styling same as your How It Works */}
                  <div className="px-8 pt-8 relative flex items-center gap-6 max-[576px]:flex-col">
                    <motion.div
                      layout
                      className={`flex items-center gap-2 shrink-0 ${
                        pinned
                          ? 'absolute left-[-50px] top-20 max-[1550px]:left-4 max-[1550px]:top-20'
                          : ''
                      }`}
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={{
                        layout: { duration: 0.4, ease: 'easeInOut' },
                      }}
                    >
                      <img
                        src={assets.images.howorkIcon}
                        alt="icon"
                        className="w-[36px] h-[36px]"
                      />
                      <h2
                        className={`text-primary font-semibold leading-none ${pinned ? 'text-[24px]' : 'text-[26px]'}`}
                      >
                        How It Works
                      </h2>
                    </motion.div>

                    <AnimatePresence initial={false} mode="wait">
                      {showParagraph && (
                        <motion.p
                          key="how-paragraph"
                          className="text-primary text-[16px] font-light leading-snug pl-[56px]"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        >
                          Our platform is built for landlords, managers, and
                          tenants four smart portals, tailored for every role.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Slides — same behavior as step 1 */}
                  <div className="px-6 pt-4">
                    <div className="relative w-full h-[calc(100vh-90px)] overflow-hidden max-w-[1220px] mx-auto max-[1600px]:h-[calc(100vh-60px)] max-[1550px]:max-w-[1100px]">
                      {repboxes.map((box) => {
                        let animate: Record<string, string | number> = {};
                        let zIndex = 0;
                        const order = box.id - replicaBox; // 0=current, 1=next, -1=prev

                        if (order === 0) {
                          // current centered
                          animate = {
                            top: '50%',
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                            scale: 0.96,
                          };
                          zIndex = CURRENT_Z;
                        } else if (order === -1) {
                          // prev at top, visible
                          animate = {
                            top: TOP_PREV,
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 0.92,
                          };
                          zIndex = PREV_Z;
                        } else if (order < -1) {
                          // older prev (hide further up)
                          animate = {
                            top: '-140px',
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 0.9,
                          };
                          zIndex = box.id;
                        } else if (order === 1) {
                          // next tail reveal
                          animate = {
                            top: `calc(100% - ${REVEAL_NEXT}px)`,
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 1,
                          };
                          zIndex = NEXT_Z;
                        } else {
                          // future > next (keep below)
                          animate = {
                            top: 'calc(100% + 140px)',
                            left: '50%',
                            x: '-50%',
                            y: 0,
                            scale: 1,
                          };
                          zIndex = box.id;
                        }

                        // deep slides hidden; next hidden before pin (exactly like step 1)
                        const hideInner =
                          order >= 2 || order <= -2 || (order === 1 && !pinned);

                        const isCurrent = order === 0;
                        const isPrev = order === -1;
                        const isNext = order === 1;

                        // next desc/bullets hide after slide 2 (pinned === true)
                        const showTitle =
                          !hideInner && (isCurrent || isPrev || isNext);
                        const showDescription =
                          !hideInner &&
                          (isCurrent || isPrev || (isNext && !pinned));
                        const showBullets = showDescription; // bullets follow description rule

                        // 4th slide height tweak (same as your step 1)
                        const cardHeightClass =
                          isCurrent && box.id === 4 ? 'h-[70vh]' : 'h-[68vh]';

                        return (
                          <motion.div
                            key={box.id}
                            className={`mx-auto absolute bg-white rounded-2xl  flex items-center justify-center w-full ${cardHeightClass}`}
                            style={{
                              zIndex,
                              backgroundImage: `url(${box.bg})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                            animate={animate}
                            initial={false}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                          >
                            <div
                              className={[
                                'p-6 rounded-lg absolute inset-0 transition-opacity duration-300',
                                hideInner
                                  ? 'opacity-0 pointer-events-none'
                                  : 'opacity-100',
                              ].join(' ')}
                            >
                              {showTitle && (
                                <h3
                                  className="text-[40px] font-normal mb-1 max-[1550px]:text-[34px]"
                                  style={{ color: box.titleColor }}
                                >
                                  {box.title}
                                </h3>
                              )}

                              {showDescription && box.description && (
                                <p
                                  className="text-[21px] font-light max-w-5xl max-[1600px]:text-[18px]"
                                  style={{ color: box.descColor }}
                                >
                                  {box.description}
                                </p>
                              )}

                              {showBullets && !!box.bullets?.length && (
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
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })()
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );

  const NewPartnerSection = (
    <motion.section
      key="partner"
      className="absolute inset-0 w-full h-screen bg-[#DFF4EC] flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-6 ">
        {/* <h2 className="text-white text-5xl font-bold mb-6">Our Partners</h2> */}
        <p className="text-left text-primary mx-auto text-[100px] leading-tight max-w-[1400px] max-[1440px]:text-[80px] max-[1024px]:text-[60px] max-[768px]:text-[40px] max-[425px]:text-[32px]">
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
      key="about"
      className="absolute inset-0 w-full h-screen bg-[#DFF4EC] flex items-center justify-center"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="text-center px-2 w-[96%] h-[90%] bg-primary relative rounded-[10px]">
        <div className="absolute top-10 left-10 z-[111] max-w-[890px] pr-3">
          <h2 className="text-left text-[40px] font-medium text-[#DFF4EC] mb-6 max-[1440px]:text-[30px]">
            At Rento, we believe property management should be simple, smart,
            and stress-free.
          </h2>
          <p className="text-left text-[24px] font-light text-[#DFF4EC] mb-4 max-[1260px]:text-[20px]">
            We built Rento to empower landlords, property managers, and tenants
            with a modern platform that brings everything into one easy-to-use
            solution. From managing properties and tenants to tracking payments,
            sending invoices, and keeping records secure, Rento keeps you in
            control with just a few clicks.
          </p>
          <p className="text-left text-[24px] font-light text-[#DFF4EC] mb-4 max-[1260px]:text-[20px]">
            Our mission is to transform the rental experience in Kuwait by
            combining technology, transparency, and trust. Whether you own a
            single villa or manage a large portfolio of buildings, Rento is
            designed to save you time, reduce paperwork, and improve
            communication.
          </p>
          <button className="cursor-pointer mt-3 text-[#5EBFA1] hover:text-white flex gap-3 items-center">
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

        <div className="absolute bottom-0 right-0 z-[1] max-w-[750px] max-[1440px]:opacity-50">
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
  const PricingSection = (
    <motion.section
      key="pricing"
      className="absolute inset-0 w-full h-screen bg-primary flex items-center justify-center"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="w-full h-full relative flex items-center justify-center price-step">
        <AnimatePresence mode="wait">
          {/* {pricingStep === 0 && (
                                <motion.h2
                                    key="pricing-step0"
                                    className="text-[#DFF4EC] font-medium absolute"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{
                                        top: "50%",
                                        left: "50%",
                                        x: "-50%",
                                        y: "-50%",
                                        fontSize: "96px",
                                        opacity: 1,
                                        scale: 1,
                                    }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                >
                                    <div className="flex justify-center gap-3">
                                        <img src={assets.images.priceIcon} alt="icon" className="w-[135px] h-[135px]" />
                                        Pricing
                                    </div>

                                       <div className="flex justify-center gap-3 mt-4 max-w-[1220px] mx-auto  absolute  bottom-0 left-0 right-0">
                                        <img src={assets.images.bottomPrice} alt="banner" className="w-full max-w-full h-full"/>
                                    </div>

                                 
                                </motion.h2>
                                
                            )} */}
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

              {/* 👇 Fixed bottom banner (hides on first scroll) */}
              <AnimatePresence>
                {!hideBottomImg && (
                  <motion.div
                    key="pricing-bottom-img"
                    className="fixed left-0 right-0 bottom-0 z-[5] pointer-events-none select-none px-6"
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

                    <div className="flex items-center space-x-2 ">
                      <div
                        className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                          isToggled
                            ? 'bg-gradient-to-r from-green-500 to-blue-500'
                            : 'bg-gray-300'
                        }`}
                        onClick={handleToggle}
                      >
                        <div
                          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                            isToggled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        ></div>
                      </div>
                      <span className="text-[#DFF4EC] font-light text-[20px] select-none">
                        Annually (Save up to 50%)
                      </span>
                    </div>
                  </div>

                  <p className="text-[18px] font-light text-[#DFF4EC] mt-[-10px]  leading-snug  ">
                    Simple pricing. No hidden fees. Pay only for the properties
                    you manage.
                  </p>
                </div>
              </motion.h2>

              <motion.div
                key="pricing-red-box"
                className="absolute bottom-5 w-full max-[1540px]:h-[83vh] max-[1540px]:bottom-0  "
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <div className="flex justify-center gap-6 items-center flex-wrap p-4 max-w-[1200px] mx-auto mt-5 ">
                  {/* Building */}
                  <div className="flex-1 min-w-[280px] h-full">
                    <div className="rounded-3xl bg-[#DFF4EC] group hover:bg-[#1665D8] text-[#242460] group-hover:text-white transition-all duration-500 p-8 shadow-xl">
                      <div className="space-y-4 mb-8">
                        <h2 className="text-[36px] font-medium group-hover:text-white">
                          Building
                        </h2>
                        <h1 className="text-[64px] font-medium tracking-tight group-hover:text-white">
                          40KD
                        </h1>
                        <p className="text-[20px] font-normal group-hover:text-white">
                          /property per month (billed annually)
                        </p>
                      </div>
                      <p className="text-[20px] font-light mb-8 group-hover:text-white truncate">
                        A bold structure built for purpose and scale—where
                        design meets ambition in every floor.
                      </p>
                      <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                        Subscribe Now
                      </button>
                    </div>
                  </div>

                  {/* House/Villa */}
                  <div className="flex-1 min-w-[280px] h-full">
                    <div className="rounded-3xl bg-[#DFF4EC] group hover:bg-[#1665D8] text-[#242460] group-hover:text-white transition-all duration-500 p-8 shadow-xl">
                      <div className="space-y-4 mb-8">
                        <h2 className="text-[36px] font-medium group-hover:text-white">
                          House/Villa
                        </h2>
                        <h1 className="text-[64px] font-medium tracking-tight group-hover:text-white">
                          20KD
                        </h1>
                        <p className="text-[20px] font-normal group-hover:text-white">
                          /property per month (billed annually)
                        </p>
                      </div>
                      <p className="text-[20px] font-light group-hover:text-white mb-8 truncate">
                        A personal sanctuary wrapped in style and space, crafted
                        for comfort and character.
                      </p>
                      <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                        Subscribe Now
                      </button>
                    </div>
                  </div>

                  {/* Apartment */}
                  <div className="flex-1 min-w-[280px] h-full">
                    <div className="rounded-3xl bg-[#DFF4EC] group hover:bg-[#1665D8] text-[#242460] group-hover:text-white transition-all duration-500 p-8 shadow-xl">
                      <div className="space-y-4 mb-8">
                        <h2 className="text-[36px] font-medium group-hover:text-white">
                          Apartment
                        </h2>
                        <h1 className="text-[64px] font-medium tracking-tight group-hover:text-white">
                          10KD
                        </h1>
                        <p className="text-[20px] font-normal group-hover:text-white">
                          /property per month (billed annually)
                        </p>
                      </div>
                      <p className="text-[20px] font-light group-hover:text-white mb-8 truncate">
                        Smart living stacked with convenience—urban rhythm in a
                        compact, curated shell.
                      </p>
                      <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                        Subscribe Now
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-6 items-center flex-wrap  max-w-[1200px] mx-auto mt-5 ">
                  <p className="text-[18px] font-light text-[#DFF4EC]   leading-snug  ">
                    Simple pricing. No hidden fees. Pay only for the properties
                    you manage.
                  </p>
                  <button
                    className="inline-flex items-center rounded-xl p-[2px]
         bg-gradient-to-r from-green-400 to-blue-500"
                  >
                    <span className="rounded-[10px] bg-[#141c4e] px-5 py-2">
                      <span
                        className="bg-gradient-to-r from-green-400 to-blue-500
             bg-clip-text text-transparent font-semibold"
                      >
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
      key="new-slide-section"
      className="absolute inset-0 w-full h-screen bg-[#DFF4EC] flex flex-col items-center justify-center overflow-hidden"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {/* Heading: Slide from top */}
      <motion.h2
        className="text-primary font-normal top-10  left-1/2 -translate-x-1/2 text-[70px] mb-3 leading-normal text-center max-[1540px]:top-5 max-[1350px]:text-[50px] min-w-full"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        We’re here to help.
      </motion.h2>

      {/* Content Box: Slide from bottom */}
      <motion.div
        className="w-[95%] max-w-[1840px] bg-white pt-1 pb-9 rounded-3xl px-5 mt-24 max-[1260px]:bg-[#DFF4EC] max-[1260px]:shadow-2xl"
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <div className="flex items-center justify-center h-full gap-3 pt-3 pb-3 relative z-11">
          <div className="flex-1">
            <div className="flex gap-3">
              {/* First Name */}
              <div className="mb-4 flex-1">
                <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Rashid Hamad"
                  className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {/* last Name */}
              <div className="mb-4 flex-1">
                <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Rashid Hamad"
                  className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="mb-4 flex gap-3">
              {/* Email */}
              <div className="mb-4 flex-1">
                <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Faisal Khamees"
                  className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="mb-4 flex-1">
                <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                  Phone No.
                </label>
                <input
                  type="tel"
                  placeholder="+971527992240"
                  className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="write a message"
                className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>
            </div>
            <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
              Submit
            </button>
          </div>
          <div className="flex-1 max-w-full h-full w-full max-[1260px]:absolute max-[1260px]:top-0 max-[1260px]:z-[-1]">
            <img
              src={assets.images.phoneBanner}
              alt="banner"
              className="w-full h-full max-[1260px]:object-contain max-[1260px]:opacity-40 max-w-full"
            />
          </div>
        </div>

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

  //    footer section

  const FooterSection = (
    <motion.section
      key="footer-section"
      className="absolute inset-0 w-full h-screen flex items-end justify-center z-1111"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="footer-bg w-full h-[100vh] flex flex-col relative z-1111">
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
              className="w-full  h-[45vh]  object-contain object-bottom max-[1540px]:h-[250px]"
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
              {/* <div className="flex gap-4 max-[768px]:mt-5">
                                <Link to="/privacy" className="text-white/50 text-[16px]">Privacy Policy</Link>
                                <Link to="/terms" className="text-white/50 text-[16px]">Terms & Conditions</Link>
                            </div> */}
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
          {/* Scroll to Top Button */}
          <button
            onClick={() => {
              setIndex(0);
              setShowFooter(false);
            }}
            className="cursor-pointer absolute bottom-5 right-5 bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold w-[45px] h-[40px] flex justify-center items-center   rounded-lg shadow-lg transition-all duration-300"
          >
            <img
              src={assets.images.upIcon}
              alt="icon"
              className="w-[20px] h-[20px]"
            />
          </button>
        </div>
      </div>
    </motion.section>
  );
  return (
    <div className="w-full relative bg-[#DFF4EC]">
      {!isMobile ? (
        // ✅ Desktop Mode
        <div className="w-full h-screen overflow-hidden relative">
          <AnimatePresence mode="wait">
            {index === 0 && HeroSection}
            {index === 1 && HighlightSection}
            {index === 3 && PartnerSection}
            {index === 4 && WhyChooseSection}
            {index === 5 && HowSection}
            {index === 7 && NewPartnerSection}
            {index === 8 && NewAboutSection}
            {index === 9 && PricingSection}
            {index === 10 && ContactSection}
            {showFooter && FooterSection}
          </AnimatePresence>
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
