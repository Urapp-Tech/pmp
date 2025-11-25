import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import { motion, useScroll, useTransform } from 'framer-motion';
import ReactLenis from 'lenis/react';
import { useEffect, useRef, useState } from 'react';

const Terms = () => {
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

  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const bgY = useTransform(scrollYProgress, [0, 0.6, 1], [0, 0, -120]);

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
    slowScrollState.current.targetY = window.scrollY;

    return () => {
      window.removeEventListener('wheel', onWheel as any);
      stopAnimationIfRunning();
    };
  }, []);

  return (
    <>
      <ReactLenis root />
      <div className="w-full relative bg-[#DFF4EC]">
        <motion.div
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: showHeader ? 0 : -90, opacity: showHeader ? 1 : 0.98 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="fixed top-0 left-0 right-0 z-[1000] will-change-transform py-0"
        >
          <Header customClass="bg-white/80 backdrop-blur-xl shadow-sm py-0" />
        </motion.div>
        <div className="h-[62px]" />
        <motion.section
          ref={heroRef}
          className="relative h-[90vh] flex justify-start max-xl:h-[650px] max-[992px]:h-[50vh] max-[992px]:min-h-[450px] max-[1260px]:flex-col max-[1260px]:items-center"
          style={{ y: bgY }}
        >
          <img
            src={assets.images.termsBanner}
            className="w-full h-[90vh] lg:max-h-[500px] object-cover absolute top-0 left-0 z-1 max-[992px]:h-[50vh] max-[992px]:min-h-[450px]  max-[992px]:object-right max-md:object-center"
          />
          <div className="relative h-full flex-1 flex w-full">
            <motion.div
              className="flex-1 flex absolute bottom-[20%]  pb-10 max-w-[1200px] gap-10 items-center justify-between px-4 max-xl:gap-y-1 max-[1260px]:flex-col max-[1260px]:items-start"
              style={{ y: contentY }}
            >
              <motion.h1
                className="capitalize text-[95px] font-normal leading-tight text-primary max-[1260px]:text-[70px] max-[1024px]:text-[48px] max-[768px]:text-[34px]"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.5 }}
              >
                Terms & Conditions
              </motion.h1>

            </motion.div>
          </div>
        </motion.section>
        <div className="w-full  bg-[#DFF4EC] mt-3 px-10 max-[768px]:px-4">
          <div className="text-primary font-light text-[14px] py-2 pl-7 max-[768px]:pl-0">
            Effective Date: 01-10-2025
            <br />
            Last Updated: 17-10-2025
          </div>
          <div className="p-6 space-y-4 text-primary max-w-[1216px] mx-auto pb-20">
            <h2 className="text-[20px] font-semibold">
              Terms & Conditions and Privacy Policy
            </h2>
            <p className="text-[16px] font-light">
              This document contains the Terms & Conditions and Privacy Policy for
              Rento in both English and Arabic.
            </p>
            <p className="text-[16px] font-light">
              Welcome to Rento. These Terms & Conditions (“Terms”) govern your use
              of Rento’s property management platform, mobile applications, and
              related services (collectively, the “Services”). By registering or
              using the Services, you agree to these Terms. If you do not agree,
              you must stop using Rento.
            </p>

            <h3 className="text-[20px] font-semibold">1. Eligibility</h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>
                You must be at least 18 years old and legally capable of entering
                contracts under the laws of your jurisdiction.
              </li>
              <li>
                You agree to provide accurate information when creating and
                maintaining your account.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">2. Nature of Services</h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>
                Rento provides a software platform to assist landlords, property
                managers, and tenants in managing properties, leases, rent
                payments, and communications.
              </li>
              <li>
                Rento is not a real estate broker, financial institution, or law
                firm, and does not provide legal or financial advice.
              </li>
              <li>
                Users remain responsible for compliance with Kuwait and GCC
                landlord-tenant laws, Sharia-compliant financial rules (if
                applicable), and any other relevant regulations.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">3. Accounts & Security</h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>
                You are responsible for keeping your account details secure.
              </li>
              <li>Notify us immediately of unauthorized use.</li>
              <li>
                Rento may suspend or terminate accounts for violations of these
                Terms.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">4. Payments & Fees</h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>
                Subscription and service fees will be displayed before purchase.
              </li>
              <li>
                Payments are processed through third-party providers (e.g.,
                payment gateways).
              </li>
              <li>All fees are non-refundable unless required by law.</li>
            </ul>

            <h3 className="text-[20px] font-semibold">5. User Content</h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>
                You own the information you upload (tenant records, lease
                contracts, etc.).
              </li>
              <li>
                By using Rento, you grant us permission to store and process this
                data solely for providing the Services.
              </li>
              <li>
                You must not upload unlawful, offensive, or infringing materials.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">
              6. Data Hosting & Compliance
            </h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>
                Data may be stored or processed on servers located outside
                Kuwait/GCC.
              </li>
              <li>
                By using Rento, you consent to such transfers, subject to
                applicable laws.
              </li>
              <li>
                You are solely responsible for ensuring that your use of Rento
                complies with your country’s data protection and tenancy laws.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">7. Prohibited Use</h3>
            <p className="text-[16px] font-light">You may not:</p>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>
                Use Rento for fraudulent, unlawful, or misleading activities.
              </li>
              <li>Interfere with the platform’s security or infrastructure.</li>
              <li>Resell, copy, or misuse the Services.</li>
            </ul>

            <h3 className="text-[20px] font-semibold">
              8. Intellectual Property
            </h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>All software, designs, and trademarks are owned by Rento.</li>
              <li>
                You may not reproduce or exploit them without written approval.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">
              9. Limitation of Liability
            </h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>Rento is provided “as is,” without warranties.</li>
              <li>
                To the maximum extent permitted by Kuwait/GCC law, Rento is not
                responsible for indirect, incidental, or consequential damages.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">10. Termination</h3>
            <ul className="list-disc pl-6 text-[16px] font-light space-y-1">
              <li>You may close your account at any time.</li>
              <li>
                We may suspend or terminate your account for violations of these
                Terms.
              </li>
            </ul>

            <h3 className="text-[20px] font-semibold">
              11. Governing Law & Jurisdiction
            </h3>
            <p className="text-[16px] font-light">
              These Terms are governed by the laws of the State of Kuwait. Any
              dispute will be subject to the exclusive jurisdiction of the courts
              of Kuwait, unless otherwise agreed in writing.
            </p>

            <h3 className="text-[20px] font-semibold">12. Language</h3>
            <p className="text-[16px] font-light">
              These Terms may be provided in English and Arabic. In case of
              conflict, the Arabic version shall prevail under Kuwaiti law.
            </p>

            <div
              dir="rtl"
              className="text-right text-[24px] font-light space-y-4"
            >
              <h2 className="text-[24px] font-semibold mb-2">
                شروط وأحكام الاستخدام (العربية)
              </h2>
              <p className="text-[24px] font-light mb-4">
                تاريخ التحديث الأخير: [تاريخ]
              </p>

              <p>
                مرحباً بكم في رينتو. تحكم هذه الشروط والأحكام ("الشروط") استخدامكم
                لمنصة رينتو، وتطبيقاتها، والخدمات ذات الصلة (ويُشار إليها مجتمعة
                بـ "الخدمات"). باستخدامكم للخدمات أو التسجيل في المنصة، فإنكم
                توافقون على هذه الشروط. وفي حال عدم موافقتكم، يرجى التوقف عن
                استخدام المنصة.
              </p>

              <div>
                <h3 className="font-semibold mb-1">1. الأهلية</h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>
                    يشترط أن يكون المستخدم قد أتم 18 عاماً وأن يكون قادراً
                    قانونياً على إبرام العقود وفقاً لقوانين الدولة التي يقيم فيها.
                  </li>
                  <li>
                    يلتزم المستخدم بتقديم معلومات صحيحة ودقيقة عند إنشاء الحساب
                    والمحافظة عليها محدثة.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">2. طبيعة الخدمات</h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>
                    رينتو توفر منصة برمجية لمساعدة الملاك ومديري العقارات
                    والمستأجرين على إدارة العقارات، عقود الإيجار، المدفوعات،
                    والتواصل.
                  </li>
                  <li>
                    رينتو ليست مكتب عقاري، ولا مؤسسة مالية، ولا مكتب محاماة، ولا
                    تقدم استشارات قانونية أو مالية.
                  </li>
                  <li>
                    يتحمل المستخدم المسؤولية الكاملة عن الامتثال لقوانين الإيجار
                    والبيانات في دولة الكويت أو أي دولة أخرى ضمن مجلس التعاون
                    الخليجي.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">3. الحسابات والأمان</h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>
                    يتحمل المستخدم المسؤولية الكاملة عن سرية بيانات الدخول إلى
                    حسابه.
                  </li>
                  <li>يجب إخطار رينتو فوراً بأي استخدام غير مصرح به.</li>
                  <li>
                    يحق لرينتو تعليق أو إنهاء الحسابات التي تخالف هذه الشروط.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">4. الرسوم والمدفوعات</h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>
                    يتم عرض رسوم الاشتراك أو الخدمات (إن وجدت) بشكل واضح قبل
                    الدفع.
                  </li>
                  <li>
                    تتم معالجة المدفوعات عبر مزودي خدمة خارجيين (مثل بوابات
                    الدفع).
                  </li>
                  <li>
                    جميع الرسوم غير قابلة للاسترداد إلا إذا نص القانون خلاف ذلك.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  5. المحتوى الذي يقدمه المستخدم
                </h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>
                    يحتفظ المستخدم بملكية البيانات التي يقوم برفعها (مثل عقود
                    الإيجار أو بيانات المستأجرين).
                  </li>
                  <li>
                    يمنح المستخدم رينتو ترخيصاً بمعالجة هذه البيانات فقط لغرض
                    تقديم الخدمات.
                  </li>
                  <li>
                    يحظر رفع أي محتوى غير قانوني أو مسيء أو ينتهك حقوق الغير.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  6. استضافة البيانات والامتثال
                </h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>
                    قد يتم تخزين البيانات أو معالجتها في خوادم خارج الكويت أو دول
                    مجلس التعاون.
                  </li>
                  <li>
                    باستخدام رينتو، يوافق المستخدم على هذا النقل شريطة اتخاذ
                    التدابير الأمنية اللازمة.
                  </li>
                  <li>
                    يتحمل المستخدم مسؤولية التأكد من توافق استخدامه للخدمات مع
                    القوانين المحلية.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">7. الاستخدامات المحظورة</h3>
                <p>يحظر على المستخدم:</p>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>استخدام رينتو لأي نشاط غير قانوني أو احتيالي.</li>
                  <li>محاولة اختراق أو تعطيل المنصة أو خوادمها.</li>
                  <li>إعادة بيع أو استغلال الخدمات دون إذن كتابي مسبق.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">8. الملكية الفكرية</h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>
                    جميع الحقوق والبرمجيات والتصاميم والعلامات التجارية مملوكة
                    لرينتو.
                  </li>
                  <li>لا يجوز نسخها أو استخدامها دون موافقة خطية مسبقة.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">9. حدود المسؤولية</h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>يتم تقديم الخدمات "كما هي" دون أي ضمانات.</li>
                  <li>
                    إلى الحد المسموح به بموجب القانون الكويتي والخليجي، لا تتحمل
                    رينتو أي مسؤولية عن الأضرار غير المباشرة أو التبعية.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">10. الإنهاء</h3>
                <ul className="list-disc list-inside space-y-1 pr-2">
                  <li>يحق للمستخدم إغلاق حسابه في أي وقت.</li>
                  <li>يحق لرينتو تعليق أو إنهاء الحساب عند مخالفة الشروط.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-1">
                  11. القانون الواجب التطبيق والاختصاص القضائي
                </h3>
                <p>
                  تخضع هذه الشروط لقوانين دولة الكويت، وتكون محاكم الكويت صاحبة
                  الاختصاص الحصري للفصل في أي نزاع ينشأ عنها.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">12. اللغة</h3>
                <p>
                  قد تتاح هذه الشروط باللغتين العربية والإنجليزية، وفي حال وجود
                  تعارض يُعتد بالنص العربي.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Terms;
