import { useMemo, useState } from 'react';
import plan from '@/services/adminapp/static';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getItem } from '@/utils/storage';

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

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  billingCycle: BillingCycle;
};

const SelectedPlanModal = ({
  isOpen,
  onClose,
  plan: selectedPlan,
  billingCycle,
}: ModalProps) => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const user: any = getItem('USER');
  const ToastHandler = (text: string, color = 'red') =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: color, color: 'white' },
    });

  const pricePerProperty = useMemo(() => {
    if (!selectedPlan) return 0;
    return billingCycle === 'annual'
      ? selectedPlan.annualPrice
      : selectedPlan.monthlyPrice;
  }, [selectedPlan, billingCycle]);

  const totalAmount = useMemo(() => {
    const n = Number(properties);
    if (!isFinite(n) || n <= 0) return 0;
    return n * pricePerProperty;
  }, [properties, pricePerProperty]);

  if (!isOpen) return null;

  const submit = async () => {
    if (!selectedPlan) return ToastHandler('No plan selected.');

    const message = [
      `Subscription interest`,
      `Plan: ${selectedPlan.name} (${billingCycle})`,
      `Price/Property: ${pricePerProperty} ${selectedPlan.currency}`,
      `Qty: ${properties}`,
      `Total: ${totalAmount} ${selectedPlan.currency}`,
    ].join(' | ');

    setSubmitting(true);
    try {
      // POST contact (your backend will receive the intent)
      const res = await plan.subscriptions({
        landlord_id: user.landlordId,
        subscription_id: selectedPlan.id,
        holding_properties: properties,
      });
      if (res?.data?.payment_link) {
        window.location.href = res?.data?.payment_link;
      } else {
        ToastHandler('Payment link not found please try again');
      }
    } catch (e: any) {
      ToastHandler(e?.message || 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed overflow-y-auto inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row gap-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Left Section */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-semibold text-[#1B1B3A]">
            Selected Plan
          </h2>

          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {selectedPlan?.name ?? '—'}
              </h3>
              <span className="text-3xl font-bold">
                {pricePerProperty} {selectedPlan?.currency}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/90">
              / property per month{' '}
              {/* {billingCycle === 'annual' ? '(billed annually)' : ''} */}
            </p>
            <p className="mt-4 text-sm text-white/80">
              {selectedPlan?.description ??
                'Flexible plan tailored for property managers and landlords.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. Of Properties
            </label>
            <input
              type="number"
              min={1}
              value={properties}
              onChange={(e) =>
                setProperties(parseInt(e.target.value || '0', 10))
              }
              className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter how many properties you want to subscribe for.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-gray-50 rounded-xl p-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold text-[#1B1B3A]">Your Details</h3>

          <div className="mt-4">
            <h4 className="text-lg font-semibold text-[#1B1B3A] mb-3">
              Payment Summary
            </h4>
            <div className="flex justify-between text-gray-600 text-sm mb-2">
              <span>Price</span>
              <span>
                {pricePerProperty} {selectedPlan?.currency}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm mb-2">
              <span>
                Qty x{properties} ({pricePerProperty}
                {selectedPlan?.currency})
              </span>
              <span>
                {totalAmount} {selectedPlan?.currency}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-3 border-t pt-3">
              <span>Total Amount</span>
              <span>
                {totalAmount} {selectedPlan?.currency}
              </span>
            </div>
          </div>

          <button
            className={cn(
              'mt-auto w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] hover:from-white hover:to-white text-white hover:text-[#1665D8] font-semibold text-lg transition-all duration-500',
              submitting && 'opacity-70 cursor-not-allowed'
            )}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedPlanModal;
