import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

type PropertyUnitModalProps = {
  open: boolean;
  onClose: () => void;
  property: any;
};

const UnitDetailsModal = ({
  open,
  onClose,
  property,
}: PropertyUnitModalProps) => {
  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-0 w-full">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-tl-3xl relative text-center">
            <DialogTitle className="text-primary-bg text-4xl mt-2 font-extrabold tracking-wide">
              Property Details
            </DialogTitle>
            <DialogDescription className="text-sm text-primary-bg pt-1">
              {property.name}
            </DialogDescription>

            {/* 3) Custom rounded close button */}
            <button
              type="button"
              onClick={() => onClose()}
              className="absolute right-2 top-6 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-primary-bg text-white shadow-md hover:opacity-90"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        {/* <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Property Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {property.name}
          </DialogDescription>
        </DialogHeader> */}

        {/* Property Fields */}
        <div className="bg-white rounded-bl-3xl px-6 pb-6 pt-5">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-5 text-sm text-primary-bg mt-6">
            <div>
              <strong>City</strong>
              <p className="pt-1">{property.city}</p>
            </div>
            <div>
              <strong>Governance</strong>
              <p className="pt-1">{property.governance}</p>
            </div>
            <div>
              <strong>Address</strong>
              <p className="pt-1">{property.address}</p>
            </div>
            <div>
              <strong>Address2</strong>
              <p className="pt-1">{property.address2}</p>
            </div>
            <div>
              <strong>Property Type</strong>
              <p className="pt-1">{property.property_type}</p>
            </div>
            <div>
              <strong>Type</strong>
              <p className="pt-1">{property.type}</p>
            </div>
            <div>
              <strong>PACI No</strong>
              <p className="pt-1">{property.paci_no}</p>
            </div>
            <div>
              <strong>Property No</strong>
              <p className="pt-1">{property.property_no}</p>
            </div>
            <div>
              <strong>Civil No</strong>
              <p className="pt-1">{property.civil_no}</p>
            </div>
            <div>
              <strong>Build Year</strong>
              <p className="pt-1">{property.build_year}</p>
            </div>
            <div>
              <strong>Book Value</strong>
              <p className="pt-1">{property.book_value}</p>
            </div>
            <div>
              <strong>Estimate Value</strong>
              <p className="pt-1">{property.estimate_value}</p>
            </div>
            <div>
              <strong>Latitude</strong>
              <p className="pt-1">{property.latitude}</p>
            </div>
            <div>
              <strong>Longitude</strong>
              <p className="pt-1">{property.longitude}</p>
            </div>
            <div>
              <strong>Bank Name</strong>
              <p className="pt-1">{property.bank_name}</p>
            </div>
            <div>
              <strong>Account Name</strong>
              <p className="pt-1">{property.account_name}</p>
            </div>
            <div>
              <strong>Account No</strong>
              <p className="pt-1">{property.account_no}</p>
            </div>
            {/* <div>
            <strong>Status:</strong>{' '}
            <span
              className={cn(
                'font-semibold px-2 py-1 rounded-full text-xs',
                property.status === 'available'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              )}
            >
              {property.status}
            </span>
          </div> */}
          </div>

          {/* Units Section */}
          <h3 className="mt-8 text-2xl font-bold text-primary-bg border-b pb-1">
            Units
          </h3>
          <Accordion type="multiple" className="mt-4">
            {property?.units?.length > 0
              ? property?.units?.map((unit: any, idx: number) => (
                  <AccordionItem
                    value={`unit-${idx}`}
                    key={unit.id}
                    className="border-none rounded-2xl bg-white shadow-md overflow-hidden mb-4"
                  >
                    <AccordionTrigger className="px-6 py-6 text-[15px] font-medium text-gray-800 bg-white border-secondary-bg border-2 outline-none hover:outline-none hover:bg-secondary-bg transition rounded-t-2xl focus:outline-none focus:ring-0 focus-visible:ring-0">
                      <div className="w-full flex justify-between items-center">
                        <span className="text-lg font-semibold">
                          {unit.name} - {unit.unit_no}{' '}
                          {unit.is_active === false && (
                            <span
                              className={cn(
                                'ml-2 text-xs font-semibold px-5 py-[5px] rounded-full',
                                'bg-primary-bg text-white'
                              )}
                            >
                              {unit.is_active === false
                                ? 'Temporary Disabled'
                                : ''}
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-semibold px-5 mx-2 py-[2px] rounded-full',
                            unit.status === 'available'
                              ? 'bg-primary-bg text-white'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
                          {unit.status}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="bg-bodyBackground rounded-b-2xl px-6 py-5 border-secondary-bg border-2 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm text-primary-bg capitalize">
                        <div>
                          <strong>Assigned User</strong>
                          <p className="pt-1">
                            {unit.assignedUnitUserName ?? 'Not Assigned'}
                          </p>
                        </div>
                        <div>
                          <strong>Assigned Manager</strong>
                          <p className="pt-1">
                            {unit.assignedManagerName ?? 'Not Assigned'}
                          </p>
                        </div>
                        <div>
                          <strong>Type</strong>{' '}
                          <p className="pt-1">{unit.unit_type}</p>
                        </div>
                        <div>
                          <strong>Size</strong>
                          <p className="pt-1">{unit.size}</p>
                        </div>
                        <div>
                          <strong>Rent</strong>
                          <p className="pt-1">{unit.rent}</p>
                        </div>
                        <div>
                          <strong>Bedrooms</strong>
                          <p className="pt-1">{unit.bedrooms}</p>
                        </div>
                        <div>
                          <strong>Bathrooms</strong>
                          <p className="pt-1">{unit.bathrooms}</p>
                        </div>
                        <div>
                          <strong>Description</strong>
                          <p className="pt-1">{unit.description}</p>
                        </div>
                        <div>
                          <strong>Electricity Meter</strong>
                          <p className="pt-1">{unit.electricity_meter}</p>
                        </div>
                        <div>
                          <strong>Water Meter</strong>
                          <p className="pt-1">{unit.water_meter}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              : 'No units found.'}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnitDetailsModal;
