import { useEffect } from 'react';

type Opts = {
  speed?: number; // easing factor (smaller = slower)
  maxStep?: number; // clamp per-wheel delta
  scale?: number; // multiply wheel delta -> target distance
  exclude?: string[]; // CSS selectors where we DON'T hijack (let section handle itself)
  visibleThreshold?: number; // intersection ratio to consider section "active" (0..1)
};

export default function useSlowPageScroll({
  speed = 0.12,
  maxStep = 120,
  scale = 0.22,
  exclude = ['#highlights', '#how'],
  visibleThreshold = 0.6,
}: Opts = {}) {
  useEffect(() => {
    let target = window.scrollY;
    let raf: number | 0 = 0;
    let anim = false;
    let locked = false; // whether page scroll is locked (section active)
    let savedScrollY = 0;

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    // Robust check: whether node (or its ancestors) match any exclude selector
    const isInExcluded = (t: EventTarget | null) => {
      if (!t) return false;
      if (!exclude || exclude.length === 0) return false;
      const node = t instanceof Node ? (t as Node) : null;
      if (!node) return false;

      const sel = exclude.join(', ');
      let el: Node | null = node;
      while (el && el !== document) {
        if (el instanceof Element && el.matches(sel)) return true;
        el = el.parentNode;
      }
      if (node instanceof Element) {
        return !!node.closest(sel);
      }
      return false;
    };

    const cancelAnim = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      anim = false;
    };

    const step = () => {
      const y = window.scrollY;
      const next = y + (target - y) * speed;
      window.scrollTo(0, next);

      if (Math.abs(target - next) > 0.5) {
        raf = requestAnimationFrame(step);
        anim = true;
      } else {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        anim = false;
        window.scrollTo(0, target);
      }
    };

    // Lock page scroll by fixing body; keep page visually where it was.
    const lockPageScroll = () => {
      if (locked) return;
      savedScrollY = window.scrollY;
      // Apply styles to freeze scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      // optional: keep width full
      document.body.style.width = '100%';
      locked = true;
      // Cancel any running smooth animation and sync target to saved position
      cancelAnim();
      target = savedScrollY;
    };

    const unlockPageScroll = () => {
      if (!locked) return;
      // remove the locking styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      locked = false;
      // restore scroll to the same place
      window.scrollTo(0, savedScrollY);
      // sync target so page smooth-scroll resumes naturally from this point
      target = window.scrollY;
    };

    // Wheel handler: if event started inside excluded section -> let it run (do nothing),
    // but ensure any page animation is cancelled (so it doesn't fight the section).
    // If not inside excluded section, perform the slow-page scrolling behaviour.
    const onWheel = (e: WheelEvent) => {
      // If the event started inside an excluded section, cancel page animation and allow the section to handle the wheel.
      if (isInExcluded(e.target)) {
        // do NOT preventDefault here — allow the section to receive raw wheel events
        cancelAnim();
        // Ensure target is current scroll pos so when we resume page scroll it starts from correct place
        target = window.scrollY;
        return;
      }

      // If page is locked (a section is active) but this wheel event is outside excluded area,
      // prevent default to avoid accidental page movement when locked.
      if (locked) {
        e.preventDefault();
        return;
      }

      // Otherwise, hijack the wheel and do smooth easing
      e.preventDefault();

      const dy = clamp(e.deltaY, -maxStep, maxStep);
      const doc =
        Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        ) || document.documentElement.scrollHeight;
      target = clamp(target + dy * scale, 0, doc - window.innerHeight);

      if (!anim) {
        anim = true;
        raf = requestAnimationFrame(step);
      }
    };

    // If the user touches/presses inside an excluded area while page animation is running, cancel the animation.
    const onPointerDown = (ev: PointerEvent) => {
      if (isInExcluded(ev.target)) {
        cancelAnim();
        target = window.scrollY;
      }
    };
    const onTouchStart = (ev: TouchEvent) => {
      if (isInExcluded(ev.target)) {
        cancelAnim();
        target = window.scrollY;
      }
    };

    // IntersectionObserver: watch excluded sections. When any of them crosses visibleThreshold,
    // lock page scroll so only the section handles wheel.
    const observer = new IntersectionObserver(
      (entries) => {
        // If any entry passes the threshold, lock; if none pass, unlock.
        const anyVisible = entries.some((en) => {
          return en.isIntersecting && en.intersectionRatio >= visibleThreshold;
        });
        if (anyVisible) {
          lockPageScroll();
        } else {
          // small delay not necessary; unlock immediately
          unlockPageScroll();
        }
      },
      {
        threshold: [visibleThreshold],
        root: null,
      }
    );

    // Observe all elements that match exclude selectors
    try {
      if (exclude && exclude.length) {
        const sel = exclude.join(', ');
        const elems = Array.from(document.querySelectorAll(sel));
        elems.forEach((el) => observer.observe(el));
      }
    } catch (err) {
      // guard: if querySelectorAll fails for some reason, ignore observer
      // (but rest of hook remains functional)
      // console.warn("useSlowPageScroll: observer setup failed", err);
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel as any);
      window.removeEventListener('pointerdown', onPointerDown as any);
      window.removeEventListener('touchstart', onTouchStart as any);
      observer.disconnect();
      cancelAnim();
      // ensure body style is cleaned up
      unlockPageScroll();
    };
  }, [speed, maxStep, scale, exclude.join('|'), visibleThreshold]);
}
