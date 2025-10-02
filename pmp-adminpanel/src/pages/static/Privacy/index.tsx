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
            <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px] max-[768px]:text-[18px]">
              This document contains the Terms & Conditions and Privacy Policy
              for Rento in both English and Arabic.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full  bg-[#DFF4EC] px-10">
        <div className="text-primary font-light text-[14px] py-15 pl-20 max-[768px]:pl-0">
          Effective Date: 19-9-2025
          <br />
          Last Updated: 19-9-2025
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
