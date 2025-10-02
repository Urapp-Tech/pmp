import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';

const Terms = () => {
  return (
    <div className="">
      <Header />
      {/* <Banner
                bannerImage={assets.images.contactBanner}
                title='Terms & Conditions'
                subTitle='This document contains the Terms & Conditions and Privacy Policy for Rento in both English and Arabic.'
            /> */}
      <div className="h-[540px] flex justify-start max-[1260px]:items-center">
        <img
          src={assets.images.termsBanner}
          className="w-full max-w-full h-[540px] object-cover object-right  absolute top-0 z-[-1]   max-[992px]:object-bottom max-[992px]:opacity-[0.6]"
        />
        <div className="relative h-full flex-1 flex">
          <div className="flex-1 flex  absolute bottom-5   gap-10 items-end justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <h1 className="capitalize text-[100px] max-w-[543px] font-normal leading-tight text-primary max-[1260px]:text-[50px] max-[1024px]:text-[50px] max-[768px]:text-[34px]">
              Terms & Conditions
            </h1>
            <p className="max-w-[593px] font-light text-[24px] text-primary  max-[1024px]:text-[20px] max-[768px]:text-[18px]">
              This document contains the Terms & Conditions and Privacy Policy
              for Rento in both English and Arabic.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full  bg-[#DFF4EC] px-10 max-[768px]:px-4">
        <div className="text-primary font-light text-[14px] py-15 pl-20 max-[768px]:pl-0">
          Effective Date: 19-9-2025
          <br />
          Last Updated: 19-9-2025
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Terms;
