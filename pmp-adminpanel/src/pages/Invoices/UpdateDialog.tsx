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
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/invoice';
import { useEffect, useState } from 'react';

const InvoiceUpdateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
}) => {
  const form = useForm<InvoiceFields>({
    defaultValues: formData,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = form;

  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [contracts, setContracts] = useState<[]>([]);

  useEffect(() => {
    form.reset(formData); // populate values when opened
  }, [formData]);

  useEffect(() => {
    const fetchTenants = async () => {
      const res = await service.get_all_tanents();
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

  const onSubmit = (data: InvoiceFields) => {
    callback({ ...data, id: formData.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[70vh] overflow-y-auto  cs-dialog-box" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Update Invoice</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="custom-form-section">
              <div className="form-group w-full flex ">
                <FormControl className="m-1 w-full">
                  <div>
                    <FormLabel>Contract No</FormLabel>
                    <SingleSelectDropDown
                      name="tenant_id"
                      items={tenants}
                      control={control}
                      value={form.watch('tenant_id') || ''}
                      onChange={(val) => {
                        setValue('tenant_id', val, { shouldValidate: true });
                        const selectedTenant = contracts.find(t => t.id === val);
                        if (selectedTenant) {
                          setValue('total_amount', selectedTenant.rent_price);
                          setValue('qty', selectedTenant.month);
                          setValue('due_date', selectedTenant.rentPayDay);
                        }
                      }}
                      placeholder="Select Contract No"
                    />
                  </div>
                </FormControl>

                <FormControl className="m-1 w-full">
                  <div>
                    <FormLabel>Total Amount</FormLabel>
                    <Input {...register('total_amount', { required: 'Required' })} />
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
                      value={form.watch('status') || 'paid'}
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
                <Button disabled={isLoader} type="submit">
                  {isLoader && <Loader2 className="animate-spin mr-2" />}
                  Update Invoice
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceUpdateDialog;
