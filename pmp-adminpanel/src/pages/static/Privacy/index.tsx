import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';

const Privacy = () => {
  return (
    <div>
      <Header />
      {/* <Banner
                bannerImage={assets.images.contactBanner}
                title='Privacy Policy'
                subTitle='This document contains the Terms & Conditions and Privacy Policy for Rento in both English and Arabic.'
            /> */}
      <div className="h-[540px] flex justify-start max-[1260px]:items-center">
        <img
          src={assets.images.termsBanner}
          className="w-full max-w-full h-[540px] object-cover object-right  absolute top-0 z-[-1]   max-[992px]:object-bottom max-[992px]:opacity-[0.6]"
        />
        <div className="relative h-full flex-1 flex">
          <div className="flex-1 flex  absolute bottom-5   gap-10 items-end justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <h1 className="capitalize text-[80px] max-w-[543px] font-normal leading-tight text-primary max-[1260px]:text-[50px] max-[1024px]:text-[50px] max-[768px]:text-[34px]">
              Privacy Policy
            </h1>
          </div>
        </div>
      </div>
      <div className="w-full  bg-[#DFF4EC] px-10">
        <div className="text-primary font-light text-[14px] py-6 max-[768px]:pl-0">
          Effective Date: 01-10-2025
          <br />
          Last Updated: 17-10-2025
        </div>
        <div className="space-y-4 text-primary max-w-[1216px] mx-auto pb-20">
          <p className="text-base font-light mb-6">
            Rento respects your privacy. This Privacy Policy explains how we
            collect, use, and protect your information. By using Rento, you
            consent to the practices described here.
          </p>

          {/* Section 1 */}
          <h2 className="text-[20px] font-semibold mb-2">
            1. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-base font-light mb-6">
            <li>Account Information: Name, email, phone, payment details.</li>
            <li>
              Property & Tenant Data: Lease details, tenant info, payment
              records.
            </li>
            <li>Usage Data: Device info, IP address, cookies, log data.</li>
          </ul>

          {/* Section 2 */}
          <h2 className="text-[20px] font-semibold mb-2">2. How We Use Data</h2>
          <ul className="list-disc pl-6 space-y-1 text-base font-light mb-6">
            <li>Provide and improve our Services.</li>
            <li>Process subscriptions and payments.</li>
            <li>Enable landlord-tenant communication.</li>
            <li>Comply with Kuwaiti/GCC legal obligations.</li>
            <li>
              Send service notices and, if consented, marketing communications.
            </li>
          </ul>

          {/* Section 3 */}
          <h2 className="text-[20px] font-semibold mb-2">3. Data Sharing</h2>
          <ul className="list-disc pl-6 space-y-1 text-base font-light mb-6">
            <li>Service Providers (e.g., hosting, payment processors).</li>
            <li>
              Government Authorities if legally required under Kuwaiti/GCC law.
            </li>
            <li>We do not sell personal data to third parties.</li>
          </ul>

          {/* Section 4 */}
          <h2 className="text-[20px] font-semibold mb-2">
            4. Data Hosting & Transfers
          </h2>
          <ul className="list-disc pl-6 space-y-1 text-base font-light mb-6">
            <li>
              Data may be processed in countries outside Kuwait/GCC (e.g., EU/US
              data centers).
            </li>
            <li>
              By using Rento, you consent to such transfers, provided adequate
              security measures are in place.
            </li>
          </ul>

          {/* Section 5 */}
          <h2 className="text-[20px] font-semibold mb-2">5. Data Security</h2>
          <p className="text-base font-light mb-6">
            We apply industry-standard encryption and access controls, but no
            system is 100% secure. Users must also protect their credentials.
          </p>

          {/* Section 6 */}
          <h2 className="text-[20px] font-semibold mb-2">6. Data Retention</h2>
          <p className="text-base font-light mb-6">
            We keep personal data as long as necessary for legal, business, or
            contractual purposes, then securely delete it.
          </p>

          {/* Section 7 */}
          <h2 className="text-[20px] font-semibold mb-2">7. User Rights</h2>
          <ul className="list-disc pl-6 space-y-1 text-base font-light mb-6">
            <li>Access, update, or correct your data.</li>
            <li>Delete your account information.</li>
            <li>Withdraw consent to marketing communications.</li>
          </ul>

          {/* Section 8 */}
          <h2 className="text-[20px] font-semibold mb-2">8. Cookies</h2>
          <p className="text-base font-light mb-6">
            Rento uses cookies for authentication, analytics, and user
            experience. You may disable cookies in your browser settings, but
            some features may not work properly.
          </p>

          {/* Section 9 */}
          <h2 className="text-[20px] font-semibold mb-2">
            9. Children’s Privacy
          </h2>
          <p className="text-base font-light mb-6">
            Rento is not intended for persons under 18 years of age.
          </p>

          {/* Section 10 */}
          <h2 className="text-[20px] font-semibold mb-2">10. Changes</h2>
          <p className="text-base font-light mb-6">
            We may update this Privacy Policy. Updates will be posted on our
            website or app.
          </p>

          {/* Section 11 */}
          <h2 className="text-[20px] font-semibold mb-2">11. Language</h2>
          <p className="text-base font-light">
            This Privacy Policy may be provided in English and Arabic. In case
            of conflict, the Arabic version shall prevail.
          </p>
          <div dir="rtl" className="text-[24px] font-light space-y-4">
            <p>
              تلتزم رينتو ("نحن") بحماية خصوصيتكم. توضح سياسة الخصوصية هذه كيفية
              جمع واستخدام وحماية بياناتكم الشخصية عند استخدام خدماتنا.
              باستخدامكم لرينتو، فإنكم توافقون على الممارسات الموضحة هنا.
            </p>

            <div>
              <h3 className="font-semibold mb-1">1. البيانات التي نجمعها</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  بيانات الحساب: الاسم، البريد الإلكتروني، رقم الهاتف، بيانات
                  الدفع.
                </li>
                <li>
                  بيانات العقار والمستأجرين: عقود الإيجار، بيانات المستأجرين،
                  سجلات الدفع.
                </li>
                <li>
                  بيانات الاستخدام: عنوان IP، نوع الجهاز، ملفات تعريف الارتباط
                  (Cookies).
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1">2. كيفية استخدام البيانات</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>تقديم وتحسين خدماتنا.</li>
                <li>معالجة الاشتراكات والمدفوعات.</li>
                <li>تسهيل التواصل بين المالك والمستأجر.</li>
                <li>
                  الامتثال للالتزامات القانونية في الكويت ودول مجلس التعاون.
                </li>
                <li>إرسال إشعارات بالخدمات وعروض تسويقية (في حال الموافقة).</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1">3. مشاركة البيانات</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>مزودي الخدمة مثل مزودي الاستضافة أو الدفع.</li>
                <li>الجهات الحكومية إذا طلب القانون ذلك.</li>
                <li>لا نقوم ببيع بياناتكم الشخصية لأي طرف ثالث.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1">4. استضافة البيانات ونقلها</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  قد تتم معالجة البيانات في مراكز بيانات خارج الكويت أو دول
                  الخليج.
                </li>
                <li>
                  باستخدام رينتو، أنتم توافقون على هذا النقل، مع التزامنا بتطبيق
                  إجراءات حماية مناسبة.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1">5. حماية البيانات</h3>
              <p>
                نطبق معايير أمان وتشفير متعارف عليها عالمياً، إلا أننا لا نضمن
                حماية مطلقة.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">6. مدة الاحتفاظ بالبيانات</h3>
              <p>
                نحتفظ بالبيانات طالما كان ذلك ضرورياً للأغراض القانونية أو
                التعاقدية، ثم نقوم بحذفها بشكل آمن.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">7. حقوق المستخدم</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>الوصول إلى بياناته أو تعديلها.</li>
                <li>حذف بياناته الشخصية.</li>
                <li>سحب موافقته على تلقي الرسائل التسويقية.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1">
                8. ملفات تعريف الارتباط (Cookies)
              </h3>
              <p>
                نستخدم ملفات تعريف الارتباط لأغراض التوثيق وتحسين تجربة
                المستخدم. يمكنكم تعطيلها عبر إعدادات المتصفح، مع العلم أن بعض
                الميزات قد لا تعمل.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">9. خصوصية الأطفال</h3>
              <p>خدمات رينتو غير موجهة للأطفال دون سن 18 عاماً.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">10. التعديلات</h3>
              <p>
                قد نقوم بتحديث سياسة الخصوصية هذه، وسيتم نشر التحديثات عبر
                الموقع أو التطبيق.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">11. اللغة</h3>
              <p>
                تتاح هذه السياسة باللغتين العربية والإنجليزية، وفي حال التعارض
                يُعتد بالنص العربي.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
