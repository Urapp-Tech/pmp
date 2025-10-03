import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '@/assets/images';
import Footer from '@/components/Static/Footer';
import Header from '@/components/Static/Header';
import SelectedPlanModal from '@/components/Static/Model'; // keep your alias/path
import plan from '@/services/adminapp/static';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';

type BillingCycle = 'annual' | 'monthly';

type Plan = {
  id: string;
  code: string; // e.g., "building" | "house_villa" | "apartment"
  name: string; // title for UI
  description?: string;
  currency: string; // e.g., "KWD"
  monthlyPrice: number; // per property
  annualPrice: number; // per property (billed annually)
  features?: string[];
  // You can extend with more fields if your API returns them
};

const defaultPlans: Plan[] = [
  {
    id: 'building',
    code: 'building',
    name: 'Building',
    description:
      'A bold structure built for purpose and scale—where design meets ambition in every floor.',
    currency: 'KD',
    monthlyPrice: 40, // UI says “/property per month (billed annually)”
    annualPrice: 40, // same visual price, but you can discount if needed
    features: [
      'Post unlimited building listings',
      'Highlighted placement for better reach',
      'Dedicated support assistance',
      'Advanced property analytics & insights',
    ],
  },
  {
    id: 'villa_house',
    code: 'villa_house',
    name: 'Villa/House',
    description:
      'A personal sanctuary wrapped in style and space, crafted for comfort and character.',
    currency: 'KD',
    monthlyPrice: 20,
    annualPrice: 20,
    features: [
      'Post up to 5 house/villa listings',
      'Priority in search results',
      'Option to add high-quality photos/videos',
      'Promote your property with “Featured” tag',
    ],
  },
  {
    id: 'apartment',
    code: 'apartment',
    name: 'Apartment',
    description:
      'Smart living stacked with convenience—urban rhythm in a compact, curated shell.',
    currency: 'KD',
    monthlyPrice: 10,
    annualPrice: 10,
    features: [
      'Post up to 3 apartment listings',
      'Standard placement in search results',
      'Photo uploads included',
      'Easy property management dashboard',
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const authState: any = useSelector((state: any) => state.authState);

  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual'); // default Annually
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const ToastHandler = (text: string, color = 'red') =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: color, color: 'white' },
    });

  // helper: lowercase-only name key (aap ne "strlower" bola)
  const nameKey = (s: string) => (s || '').trim().toLowerCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await plan.planService(); // GET subscriptions/list
        if (!mounted) return;
        // API result shapes handle: data.items | data.plans | data | []
        const items = res?.data?.items ?? res?.data?.plans ?? res?.data ?? [];
        const map: Record<string, string> = {};

        (Array.isArray(items) ? items : []).forEach((it: any) => {
          const nm = (it?.plan_name ?? '').toString();
          const id = it?.id != null ? String(it.id) : '';
          if (nm && id) map[nameKey(nm)] = id;
        });

        // 👉 sirf id override karo, baqi sab defaultPlans ka as-is
        setPlans(
          defaultPlans.map((p) => ({
            ...p,
            id: map[nameKey(p.name)] ?? p.id, // API id if match, else keep existing
          }))
        );
        loadingPlans && setLoadingPlans(false);
      } catch {
        // API fail ho to defaults hi rehne do
        setPlans(defaultPlans);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = () => {
    setBillingCycle((prev) => (prev === 'annual' ? 'monthly' : 'annual'));
  };

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
    setSelectedPlan(p);
    setIsModalOpen(true);
  };

  return (
    <div className="">
      <Header />
      <div className="h-[800px] flex justify-start max-[1260px]:items-center max-[992px]:h-[700px]">
        <img
          src={assets.images.priceBanner}
          className="w-full object-cover absolute top-0 z-[-1] max-[1260px]:h-[900px] max-[992px]:h-[650px]"
          alt="Pricing banner"
        />
        <div className="relative h-full flex-1 flex w-full">
          <div className="w-full flex-1 flex absolute bottom-40 gap-10 items-center justify-between px-4 max-[1260px]:flex-col max-[1260px]:items-start">
            <div className="max-w-[1024px] flex gap-x-10 items-center justify-between max-[1440px]:flex-col max-[1440px]:gap-13 max-[1440px]:items-start max-[1440px]:w-full">
              <h1 className="capitalize text-[100px] font-normal leading-1 text-primary max-[1260px]:text-[70px] max-[1024px]:text-[50px]">
                Pricing
              </h1>
              <p className="max-w-[593px] font-light text-[24px] text-primary max-[1024px]:text-[20px]">
                Simple pricing. No hidden fees. Pay only for the properties you
                manage.
              </p>
            </div>

            <div className="flex items-center space-x-2 max-[1440px]:w-full max-[1440px]:justify-end">
              {/* <div
                className={cn(
                  'w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300',
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500'
                    : 'bg-gray-300'
                )}
                onClick={handleToggle}
                role="switch"
                aria-checked={billingCycle === 'annual'}
                aria-label="Toggle billing cycle"
              >
                <div
                  className={cn(
                    'bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300',
                    billingCycle === 'annual'
                      ? 'translate-x-6'
                      : 'translate-x-0'
                  )}
                />
              </div> */}
              {/* <span className="text-primary font-light text-[20px] select-none">
                Annually (Save up to 50%)
              </span> */}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full pb-10 bg-[#DFF4EC]">
        <div className="flex justify-center gap-3 items-center p-4 max-[992px]:flex-col translate-y-[-100px]">
          {loadingPlans ? (
            <div className="text-primary text-lg py-10">Loading plans…</div>
          ) : (
            plans.slice(0, 3).map((p) => (
              <div key={p.id} className="flex-1 min-w-[280px]">
                <div className="w-full rounded-3xl bg-gradient-to-br from-[#1b1c3c] to-[#2a2c58] hover:from-[#1665D8] hover:to-[#1665D8] transition-all duration-500 text-white p-8 shadow-xl group max-[992px]:max-w-full">
                  <div className="space-y-4 mb-8">
                    <h2 className="text-[36px] m-0 font-medium">{p.name}</h2>
                    <h1 className="text-[64px] m-0 font-medium tracking-tight">
                      {priceFor(p)}
                      {p.currency}
                    </h1>
                    <p className="text-[20px] font-normal text-white">
                      {cycleNote}
                    </p>
                  </div>

                  <ul className="space-y-4 mb-8 text-white">
                    {(p.features?.length
                      ? p.features
                      : defaultPlans.find((d) => d.code === p.code)?.features ||
                        []
                    ).map((f, i) => (
                      <li className="flex items-start" key={i}>
                        <span className="text-xl mr-2 leading-none">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-[20px] font-light text-white mb-8">
                    {p.description ||
                      defaultPlans.find((d) => d.code === p.code)
                        ?.description ||
                      'Flexible plan tailored for property managers and landlords.'}
                  </p>

                  <button
                    className="w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] group-hover:bg-none group-hover:bg-white text-white group-hover:text-[#1665D8] font-semibold text-lg transition-all duration-500"
                    onClick={() => {
                      if (!authState.user) {
                        navigate('/admin-panel/auth/login'); // 🔹 login page redirect
                      } else {
                        openSubscribe(p);
                      }
                    }}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- All plans include --- */}
        <div className="max-w-[1372px] mx-auto px-5">
          <h3 className="mt-5 text-primary text-[100px] font-normal leading-norma max-[1440px]:text-[80px] max-[1260px]:text-[60px] max-[1024px]:text-[40px] max-[768px]:text-[26px]">
            All plans include
          </h3>
          {/* keep your “include” grid as-is */}
          {/* ... (unchanged content below) ... */}
          {/* ICON 1 */}
          <div className="mt-18 mb-5 flex justify-between gap-x-5 gap-y-10 flex-wrap">
            <div className="flex-basis-[40%] max-w-[593px] max-[1260px]:max-w-full">
              <div className="w-[50px] mb-4">
                <img
                  src={assets.images.icon1}
                  className="w-full h-full"
                  alt="icon"
                />
              </div>
              <h4 className="text-[45px] font-light text-primary mb-4 max-[1024px]:text-[34px]">
                Property Dashboard
              </h4>
              <p className="text-[24px] font-light text-primary max-[992px]:text-[18px]">
                Manage all your properties in one place. From rent collection to
                tenant details, everything is organized in a clean, easy-to-use
                dashboard designed to save you time.
              </p>
            </div>
            {/* ... keep the rest of your “All plans include” items ... */}
          </div>
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

export default Pricing;
