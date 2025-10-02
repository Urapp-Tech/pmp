// src/components/SelectedPlanModal.tsx
import { useState } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SelectedPlanModal = ({ isOpen, onClose }: ModalProps) => {
  const [properties, setProperties] = useState(5);
  const pricePerProperty = 20;
  const totalAmount = properties * pricePerProperty;

  if (!isOpen) return null; // hide modal when not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 max-[992px]:h-[50vh]">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row gap-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
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
              <h3 className="text-xl font-semibold">House/Villa</h3>
              <span className="text-3xl font-bold">20 KD</span>
            </div>
            <p className="mt-2 text-sm text-white/90">
              / property per month (billed annually)
            </p>
            <p className="mt-4 text-sm text-white/80">
              A personal sanctuary wrapped in style and space, crafted for
              comfort and character.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. Of Properties
            </label>
            <input
              type="number"
              value={properties}
              onChange={(e) => setProperties(parseInt(e.target.value) || 0)}
              className="w-full h-12 rounded-lg border border-gray-300 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-2">
              Cupiditate minus non quisquam quia accusamus quod culpa.
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 bg-gray-50 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#1B1B3A] mb-6">
              Payment Summary
            </h3>
            <div className="flex justify-between text-gray-600 text-sm mb-3">
              <span>Price</span>
              <span>{pricePerProperty} KD</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm mb-3">
              <span>
                Qty x{properties} ({pricePerProperty}KD)
              </span>
              <span>{totalAmount} KD</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4 border-t pt-4">
              <span>Total Amount</span>
              <span>{totalAmount} KD</span>
            </div>
          </div>

          <button className="mt-6 w-full h-12 rounded-[14px] bg-gradient-to-r from-[#00d494] to-[#00b5e2] hover:from-white hover:to-white text-white hover:text-[#1665D8] font-semibold text-lg transition-all duration-500">
            Subscribe Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedPlanModal;
