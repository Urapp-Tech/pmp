import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { InvoiceFields } from '@/interfaces/invoice.interface';
import { Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/invoice';
import { useEffect, useState } from 'react';
import { getItem } from '@/utils/storage';

interface InvoiceUpdateDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  callback: (data: InvoiceFields) => void;
  isLoader: boolean;
  formData: InvoiceFields;
}

const InvoiceUpdateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
}: InvoiceUpdateDialogProps) => {
  const form = useForm<InvoiceFields>({
    defaultValues: formData,
  });

  const {
    register,
    handleSubmit,
    control,
    // setValue,/
    formState: { errors },
  } = form;

  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [contracts, setContracts] = useState<[]>([]);

  useEffect(() => {
    form.reset(formData); // populate values when opened
  }, [formData]);

  const userDetails: any = getItem('USER');
  useEffect(() => {
    const fetchTenants = async () => {
      const res = await service.get_all_tanents(userDetails?.landlordId);
      if (res?.data?.success) {
        setContracts(res.data.items);
        const mapped = res.data.items.map((t: any) => ({
          id: t.id,
          name: t.contract_number,
        }));
        setTenants(mapped);
      }
    };
    fetchTenants();
  }, []);
  // useEffect(() => {
  //         const selectedTenant:any = contracts.find((t:any) => t.id === form.watch('tenant_id'));
  //         if (selectedTenant) {
  //           setValue('contract_number', selectedTenant.contractNumber);
  //         }
  //   },[form.watch('tenant_id')])
  const onSubmit = (data: InvoiceFields) => {
    callback({ ...data, id: formData.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-0 w-full">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-tl-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-2 text-4xl font-extrabold tracking-wide">
              Update Invoice
            </DialogTitle>
            {/* 3) Custom rounded close button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-2 top-6 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-primary-bg text-white shadow-md hover:opacity-90"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="bg-white rounded-bl-3xl px-6 pb-6 pt-5">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="custom-form-section">
                <div className="form-group w-full flex ">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel>Contract No </FormLabel>
                      <SingleSelectDropDown
                        name="tenant_id"
                        items={tenants}
                        control={control}
                        disabled={true}
                        label="Contract No"
                        placeholder="Select Contract No"
                      />
                    </div>
                  </FormControl>

                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel>Total Amount</FormLabel>
                      <Input
                        {...register('total_amount', { required: 'Required' })}
                      />
                    </div>
                  </FormControl>
                </div>

                <div className="form-group w-full flex gap-3">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel>Status</FormLabel>
                      <SingleSelectDropDown
                        control={control}
                        name="status"
                        label="Status"
                        items={[
                          { name: 'Paid', id: 'paid' },
                          { name: 'Unpaid', id: 'unpaid' },
                          // { name: 'Partial', id: 'partial' },
                          { name: 'Overdue', id: 'overdue' },
                        ]}
                        placeholder="Select Status"
                        rules={{ required: 'Required' }}
                      />
                    </div>
                  </FormControl>
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel>Payment Method</FormLabel>
                      <SingleSelectDropDown
                        control={control}
                        label="Payment Method"
                        name="payment_method"
                        items={[
                          { name: 'Cash', id: 'cash' },
                          { name: 'Bank', id: 'bank' },
                          { name: 'Online', id: 'online' },
                        ]}
                        placeholder="Select Method"
                        rules={{ required: 'Required' }}
                      />
                    </div>
                  </FormControl>
                </div>

                <div className="form-group w-full flex gap-3">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel>Quantity</FormLabel>
                      <Input {...register('qty')} />
                    </div>
                  </FormControl>

                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel>Due Date</FormLabel>
                      <Input type="date" {...register('due_date')} />
                    </div>
                  </FormControl>

                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel>Invoice Date</FormLabel>
                      <Input type="date" {...register('invoice_date')} />
                    </div>
                  </FormControl>
                </div>

                <FormControl className="m-1 w-full">
                  <div>
                    <FormLabel>Description</FormLabel>
                    <Input {...register('description')} />
                  </div>
                </FormControl>

                <DialogFooter className="mt-3">
                  <Button
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                    disabled={isLoader}
                    type="submit"
                  >
                    {isLoader && <Loader2 className="animate-spin mr-2" />}
                    Update Invoice
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceUpdateDialog;
