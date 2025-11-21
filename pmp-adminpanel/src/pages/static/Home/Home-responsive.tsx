// yhan se responsive staty hai
import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import MobileSlider from '@/components/Static/Slider/MobileSlider';
import PortalSlider from '@/components/Static/Slider/PortalSlider';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import PricingSection from './PricingSection';
import SelectedPlanModal from '@/components/Static/Model';

export type BillingCycle = 'annual' | 'monthly';
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


const HomeResponsive = () => {
  const authState: any = useSelector((state: any) => state.authState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isToggled, setIsToggled] = useState(true);
  const navigate = useNavigate();
  
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
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
  // const handleToggle = () => {
  //   setIsToggled(!isToggled);
  // };
  return (
    <div className="mob-view overflow-auto">
      <div className="w-full home-bg  min-h-[500px]   relative ">
        <Header customClass="relative" />
        <div className="flex justify-end px-20 max-[1260px]:justify-center max-[576px]:px-2">
          <p className="text-[36px] font-light text-primary mt-10 max-w-[445px] leading-[45px] max-[1260px]:max-w-full max-[1260px]:text-[30px] max-[1260px]:text-center max-[992px]:text-[24px] max-[992px]:leading-tight max-[768px]:text-[16px] max-[576px]:max-w-full">
            From rent collection to maintenance requests — manage everything in
            one place.
          </p>
        </div>

        <div className="flex justify-between items-end pb-10 pl-10 pr-20 absolute bottom-0 left-0 right-0 max-[1260px]:flex-col max-[1260px]:items-center max-[576px]:px-0">
          <h3 className="text-3xl font-normal text-primary leading-tight max-w-[740px] max-[1260px]:text-center max-[768px]:text-[24px] max-sm:text-[22px] ">
            Smarter Property <br /> Management in Kuwait
          </h3>

          <div className="flex gap-4 mt-6 justify-end md:justify-start  ">
            <button
              onClick={() => navigate('/about-us')}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold shadow-md hover:opacity-90 transition max-[768px]:text-[14px] max-[768px]:p-[14px] max-sm:text-[12px]"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/contact-us')}
              className="px-6 py-3 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50 transition max-[768px]:text-[14px]  max-[768px]:p-[14px] max-sm:text-[12px]"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-[#DFF4EC] py-7 px-5">
        <div className="flex justify-center items-center gap-2">
          <img
            src={assets.images.highIcon}
            alt="icon"
            className="w-[45px] h-[45px]"
          />
          <div className="font-normal text-[34px] text-primary ">Highlights</div>
        </div>
        <div className="my-5">
          <p className="text-[18px] text-center font-light mx-auto text-primary max-w-[445px] leading-normal">
            Rento isn’t just easier to use—it’s simpler to set up, quicker with
            support, and built with the right features to grow with you.
          </p>
        </div>

        <MobileSlider />
        <div className="my-20 max-w-[1530px] mx-auto px-4 bg-primary py-10 rounded-[10px]">
          <p className="text-white text-[96px] leading-tight font-normal text-center max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            Rento is more than just property management software,{' '}
            <span className="text-[96px]  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
              it’s your growth partner.
            </span>
          </p>
        </div>
        {/* why */}
        <div className="p-4 bg-primary rounded-md">
          <div className="bg-[#DFF4EC] pt-7 pl-5 rounded-md">
            <h2 className="text-primary  text-[26px] font-normal mb-4  ">
              Why Choose Rento?
            </h2>
            <ul className="flex flex-wrap justify-start gap-2   text-primary list-disc">
              <li className="flex flex-col items-center">
                <p className="text-primary text-left font-light text-[18px] max-[768px]:text-[14px]">
                  Built for Kuwait’s property market
                </p>
              </li>

              <li className="flex flex-col items-center">
                <p className="text-primary text-left font-light text-[18px] max-[768px]:text-[14px]">
                  Supports Arabic & English
                </p>
              </li>
              <li className="flex flex-col items-center">
                <p className="text-primary text-left font-light text-[18px] max-[768px]:text-[14px]">
                  Transparent, easy-to-use dashboards
                </p>
              </li>
              <li className="flex flex-col items-center">
                <p className="text-primary text-left font-light text-[18px] max-[768px]:text-[14px]">
                  Secure payments with bank-grade protection
                </p>
              </li>
              <li className="flex flex-col items-center">
                <p className="text-primary text-left font-light text-[18px] max-[768px]:text-[14px]">
                  Save time, cut costs, and improve relationships
                </p>
              </li>
            </ul>

            <div className="mt-5">
              <img src={assets.images.whyBanner} alt="icon" />
            </div>
          </div>
        </div>
        {/* how */}

        <div className="my-10 flex justify-center items-center gap-2">
          <img
            src={assets.images.howIcon}
            alt="icon"
            className="w-[58px] h-[58px]"
          />
          <div className="capitalize font-normal text-[34px] text-primary">
            How it works
          </div>
        </div>
        <div className="my-5 bg-primary p-3 rounded-[10px]">
          <p className="text-[18px] text-center font-light mx-auto text-primary max-w-[445px] leading-normal">
            <span className="  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent text-[26px]">
              Built for landlords, managers, and tenants—four smart portals,
              tailored for every role.{' '}
            </span>
          </p>
        </div>
        <div className="my-5 px-4">
          <p className="text-[18px] text-center font-light  text-primary   leading-normal">
            Rento isn’t just easier to use—it’s simpler to set up, quicker with
            support, and built with the right features to grow with you.
          </p>
        </div>
        <PortalSlider />
        <div className="my-5 bg-primary p-3 rounded-[10px]">
          <p className="text-[18px] text-center font-light mx-auto text-primary max-w-[445px] leading-normal">
            <span className="  font-normal bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent text-[26px]">
              At Rento, we believe property management should be simple, smart,
              and stress-free.{' '}
            </span>
          </p>
        </div>
        {/* about */}
        {/* why */}

        <div className="bg-primary pt-7 pl-5 px-3 rounded-md">
          <h2 className="text-white  text-[26px] font-normal mb-4  ">
            At Rento, we believe property management should be simple, smart,
            and stress-free.
          </h2>

          <p className="text-white text-left font-light text-[16px] mb-5">
            We built Rento to empower landlords, property managers, and tenants
            with a modern platform that brings everything into one easy-to-use
            solution. From managing properties and tenants to tracking payments,
            sending invoices, and keeping records secure, Rento keeps you in
            control with just a few clicks.
          </p>

          <p className="text-white text-left font-light text-[16px] mb-5">
            Our mission is to transform the rental experience in Kuwait by
            combining technology, transparency, and trust. Whether you own a
            single villa or manage a large portfolio of buildings, Rento is
            designed to save you time, reduce paperwork, and improve
            communication.
          </p>

          <button
            onClick={() => navigate('/about-us')}
            className="text-[#5EBFA1] flex gap-3 items-center"
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

          <div className="mt-5">
            <img src={assets.images.aboutFix} alt="icon" />
          </div>
        </div>

        {/* price */}
        {/* <div className="mt-10 mb-6">
          <div className="flex gap-2 items-center">
            <img
              src={assets.images.priceIcon}
              alt="icon"
              className="w-[58px] h-[58px]"
            />
            <h4 className="capitalize text-[28px] font-normal leading-normal text-primary  mb-4">
              Pricing
            </h4>
          </div>

          <p className="max-w-[593px] font-light text-[20px] text-primary my-3">
            Simple pricing. No hidden fees. Pay only for the properties you
            manage.
          </p>
        </div>

        <div className="  flex items-center space-x-2 max-[1440px]:w-full max-[1440px]:justify-end">
          <div
            className={`w-10 h-5 flex items-center rounded-full p-0 cursor-pointer transition-colors duration-300 ${
              isToggled
                ? 'bg-gradient-to-r from-green-500 to-blue-500'
                : 'bg-gray-300'
            }`}
            onClick={handleToggle}
          >
            <div
              className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${
                isToggled ? 'translate-x-6' : 'translate-x-1'
              }`}
            ></div>
          </div>
          <span className="text-primary font-light text-[16px] select-none">
            Annually (Save up to 50%)
          </span>
        </div>
        <div className="flex justify-center gap-3 items-center   my-5 flex-col  ">
          <div className="flex-1">
            <div className="w-full max-w-[560px] rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
              <div className="space-y-4 mb-8">
                <h2 className="text-[36px] m-0 font-medium">Building</h2>
                <h1 className="text-[64px] m-0 font-medium tracking-tight">
                  40KD
                </h1>
                <p className="text-[20px] font-normal text-white ">
                  /property per month (billed annually)
                </p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Post unlimited building listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Highlighted placement for better reach</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Dedicated support assistance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Advanced property analytics & insights</span>
                </li>
              </ul>

              <p className="text-[20px] font-light text-white mb-8">
                A bold structure built for purpose and scale—where design meets
                ambition in every floor.
              </p>

              <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                Subscribe Now
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full max-w-[560px] rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
              <div className="space-y-4 mb-8">
                <h2 className="text-[36px] m-0 font-medium">House/Villa</h2>
                <h1 className="text-[64px] m-0 font-medium tracking-tight">
                  20KD
                </h1>
                <p className="text-[20px] font-normal text-white ">
                  /property per month (billed annually)
                </p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Post up to 5 house/villa listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Priority in search results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Option to add high-quality photos/videos</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Promote your property with “Featured” tag</span>
                </li>
              </ul>

              <p className="text-[20px] font-light text-white mb-8">
                A personal sanctuary wrapped in style and space, crafted for
                comfort and character.
              </p>

              <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                Subscribe Now1
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full max-w-[560px] rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
              <div className="space-y-4 mb-8">
                <h2 className="text-[36px] m-0 font-medium">Apartment</h2>
                <h1 className="text-[64px] m-0 font-medium tracking-tight">
                  10KD
                </h1>
                <p className="text-[20px] font-normal text-white ">
                  /property per month (billed annually)
                </p>
              </div>

              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Post up to 3 apartment listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Standard placement in search results</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Photo uploads included</span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-2 leading-none">•</span>
                  <span>Easy property management dashboard</span>
                </li>
              </ul>

              <p className="text-[20px] font-light text-white mb-8">
                Smart living stacked with convenience—urban rhythm in a compact,
                curated shell.
              </p>

              <button className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>*/}
      </div>

      <PricingSection
        billingCycle={billingCycle}
        defaultPlans={defaultPlans}
        loadingPlans={loadingPlans}
        openSubscribe={openSubscribe}
        plans={plans}
        setBillingCycle={setBillingCycle}
      />


      {/* contact */}
      <div className="my-10 p-5">
        <h3 className="text-center text-[28px] leading-tight text-primary font-normal mb-6">
          We're here to help.
        </h3>
        <div className=" p-3 rounded-md">
          {/* First Name */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Name
            </label>
            <input
              type="text"
              placeholder="Rashid Hamad"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Faisal Khamees"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-normal text-[#1d1b4c] mb-2">
              Phone No.
            </label>
            <input
              type="tel"
              placeholder="+971527992240"
              className="w-full rounded-lg border font-light border-transparent bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
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
        </div>
        <div className="  mx-auto mt-4">
          <img src={assets.images.phoneBanner} alt="banner"  className="max-w-full object-contain h-full w-full"/>
        </div>
      </div>
  <SelectedPlanModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              plan={selectedPlan}
              billingCycle={billingCycle}
            />
      <Footer />
    </div>
    
  );
};

export default HomeResponsive;
