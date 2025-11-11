import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormItem, FormLabel } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  FormControl,
  FormField,
  FormMessage,
  Form,
} from '@/components/ui/form';
import { useForm, FormProvider } from 'react-hook-form';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import invoiceService from '@/services/adminapp/invoice';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import { InvoiceItemFields } from '@/interfaces/invoice-items.interface';

const InvoiceItemCreateDialog = ({
  isOpen,
  setIsOpen,
  invoiceId,
  amount,
  invoiceItemId,
  onComplete,
  setList,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  invoiceId: string;
  amount?: number;
  invoiceItemId?: string;
  onComplete?: () => void;
  setList: any;
}) => {
  const isEditMode = Boolean(invoiceItemId);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const getValidDate = (dateString: string | null | undefined) => {
    const parsed = new Date(dateString || '');
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };
  const form = useForm<InvoiceItemFields>({
    defaultValues: {
      amount: amount || 0,
      payment_method: '',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    },
  });

  const { handleSubmit, setValue, control, watch, reset } = form;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && invoiceItemId) {
        (async () => {
          try {
            const res = await invoiceService.getInvoiceItemById(invoiceItemId);
            const item = res?.data.items;

            if (item) {
              reset({
                amount: item.amount,
                payment_method: item.payment_method,
                payment_date: format(
                  getValidDate(item.payment_date),
                  'yyyy-MM-dd'
                ),
                description: item.description || '',
              });
            }
          } catch (err) {
            console.error('Failed to fetch invoice item:', err);
          }
        })();
      } else {
        reset({
          amount: amount || 0,
          payment_method: '',
          payment_date: format(new Date(), 'yyyy-MM-dd'),
          description: '',
        });
      }
    }
  }, [invoiceItemId, amount, isEditMode]);

  const onSubmit = async (data: InvoiceItemFields) => {
    const formData = new FormData();
    formData.append('invoice_id', invoiceId);
    formData.append('amount', String(data.amount));
    formData.append('payment_method', data.payment_method);
    formData.append('payment_date', data.payment_date);
    formData.append('description', data.description || '');
    if (file) formData.append('file', file);

    try {
      setLoading(true);
      const res = isEditMode
        ? await invoiceService.updateInvoiceItem(invoiceItemId!, formData)
        : await invoiceService.createInvoiceItem(formData);

      if (res?.data?.success) {
        toast({
          description: res.data.message,
          className: cn(
            'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
          ),
          style: {
            backgroundColor: '#5CB85C',
            color: 'white',
          },
        });
        reset();
        setFile(null);
        setIsOpen(false);

        onComplete?.();
      }
    } catch (err) {
      console.error('Error saving invoice item', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Update Rent Payment' : 'Create Rent Payment'}
          </DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 py-2">
            <div className="custom-form-section">
              <div className="form-group w-full flex gap-4">
                <div className="w-1/2">
                  <FormField
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            readOnly={!isEditMode}
                            placeholder="Enter amount"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="w-1/2">
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <SingleSelectDropDown
                        name="payment_method"
                        control={control}
                        label="payment_method"
                        items={[
                          { name: 'Cash', id: 'cash' },
                          { name: 'Bank', id: 'bank' },
                          { name: 'Online', id: 'online' },
                        ]}
                        placeholder="Select Method"
                        rules={{ required: 'Select payment method' }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </div>
              </div>

              <div className="form-group w-full flex gap-4">
                <div className="form-group w-full mt-4">
                  <FormField
                    control={control}
                    name="payment_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="form-group w-full mt-4">
                  <FormItem>
                    <FormLabel>Upload File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>

              <div className="form-group w-full mt-4">
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional description"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceItemCreateDialog;
