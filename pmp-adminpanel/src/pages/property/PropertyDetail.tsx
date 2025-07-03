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

type PropertyUnitModalProps = {
  open: boolean;
  onClose: () => void;
  property: any;
};

const PropertyDetailModal = ({
  open,
  onClose,
  property,
}: PropertyUnitModalProps) => {
  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Property Details
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            {property.name}
          </DialogDescription>
        </DialogHeader>

        {/* Property Fields */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-sm text-gray-700 mt-6">
          <div>
            <strong>City:</strong> {property.city}
          </div>
          <div>
            <strong>Governance:</strong> {property.governance}
          </div>
          <div>
            <strong>Address:</strong> {property.address}
          </div>
          <div>
            <strong>Address2:</strong> {property.address2}
          </div>
          <div>
            <strong>Property Type:</strong> {property.property_type}
          </div>
          <div>
            <strong>Type:</strong> {property.type}
          </div>
          <div>
            <strong>PACI No:</strong> {property.paci_no}
          </div>
          <div>
            <strong>Property No:</strong> {property.property_no}
          </div>
          <div>
            <strong>Civil No:</strong> {property.civil_no}
          </div>
          <div>
            <strong>Build Year:</strong> {property.build_year}
          </div>
          <div>
            <strong>Book Value:</strong> {property.book_value}
          </div>
          <div>
            <strong>Estimate Value:</strong> {property.estimate_value}
          </div>
          <div>
            <strong>Latitude:</strong> {property.latitude}
          </div>
          <div>
            <strong>Longitude:</strong> {property.longitude}
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
        <h3 className="mt-8 text-lg font-semibold text-gray-800 border-b pb-1">
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
                  <AccordionTrigger className="px-6 py-4 text-[15px] font-medium text-gray-800 bg-sky-100 hover:bg-sky-200 transition rounded-t-2xl focus:outline-none focus:ring-0 focus-visible:ring-0">
                    <div className="w-full flex justify-between items-center">
                      <span>
                        {unit.name} - {unit.unit_no}{' '}
                        {unit.is_active === false && (
                          <span
                            className={cn(
                              'ml-2 text-xs font-semibold px-5 py-[5px] rounded-full',
                              'bg-red-100 text-red-700'
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
                          'text-xs font-semibold px-5 py-[2px] rounded-full',
                          unit.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        )}
                      >
                        {unit.status}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="bg-gray-50 rounded-b-2xl px-6 py-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700 capitalize">
                      <div>
                        <strong>Assigned User:</strong>{' '}
                        {unit.assignedUnitUserName ?? 'Not Assigned Yet'}
                      </div>
                      <div>
                        <strong>Type:</strong> {unit.unit_type}
                      </div>
                      <div>
                        <strong>Size:</strong> {unit.size}
                      </div>
                      <div>
                        <strong>Rent:</strong> {unit.rent}
                      </div>
                      <div>
                        <strong>Bedrooms:</strong> {unit.bedrooms}
                      </div>
                      <div>
                        <strong>Bathrooms:</strong> {unit.bathrooms}
                      </div>
                      <div>
                        <strong>Description:</strong> {unit.description}
                      </div>
                      <div>
                        <strong>Electricity Meter:</strong>{' '}
                        {unit.electricity_meter}
                      </div>
                      <div>
                        <strong>Water Meter:</strong> {unit.water_meter}
                      </div>
                      <div>
                        <strong>Bank Name:</strong> {unit.bank_name}
                      </div>
                      <div>
                        <strong>Account Name:</strong> {unit.account_name}
                      </div>
                      <div>
                        <strong>Account No:</strong> {unit.account_no}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            : 'No units found.'}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailModal;
