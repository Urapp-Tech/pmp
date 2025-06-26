import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { format } from 'date-fns';
import invoiceService from '@/services/adminapp/invoice';

const InvoiceItemCreateDialog = ({
  isOpen,
  setIsOpen,
  invoiceId,
  onCreated,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  invoiceId: string;
  onCreated: () => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const form = useForm({
    defaultValues: {
      amount: '',
      payment_method: '',
      currency: '$',
      payment_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      remarks: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

  const onSubmit = async (data: any) => {
    if (!invoiceId) return;
    const formData = new FormData();
    formData.append('invoice_id', invoiceId);
    formData.append('amount', data.amount);
    formData.append('payment_method', data.payment_method);
    formData.append('currency', data.currency);
    formData.append('payment_date', data.payment_date);
    formData.append('description', data.description);
    formData.append('remarks', data.remarks);
    formData.append('status', 'pending');
    if (file) formData.append('file', file);

    try {
      const res = await invoiceService.createInvoiceItem(formData);
      if (res?.data?.success) {
        onCreated();
        reset();
        setFile(null);
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error creating invoice item', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Invoice Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormControl className="w-full">
                <div>
                  <FormLabel className="text-sm font-medium">Amount</FormLabel>
                  <Input
                    type="number"
                    placeholder="200"
                    {...register('amount', {
                      required: 'Amount is required',
                    })}
                    className="mt-2 text-sm"
                  />
                  {errors.amount && (
                    <FormMessage>*{errors.amount.message}</FormMessage>
                  )}
                </div>
              </FormControl>

              <FormControl className="w-full">
                <div>
                  <FormLabel className="text-sm font-medium">Currency</FormLabel>
                  <Input
                    placeholder="$"
                    {...register('currency')}
                    className="mt-2 text-sm"
                  />
                </div>
              </FormControl>

              <FormControl className="w-full">
                <div>
                  <FormLabel className="text-sm font-medium">Payment Method</FormLabel>
                  <Input
                    placeholder="Cash / Bank"
                    {...register('payment_method', {
                      required: 'Payment method is required',
                    })}
                    className="mt-2 text-sm"
                  />
                  {errors.payment_method && (
                    <FormMessage>*{errors.payment_method.message}</FormMessage>
                  )}
                </div>
              </FormControl>

              <FormControl className="w-full">
                <div>
                  <FormLabel className="text-sm font-medium">Payment Date</FormLabel>
                  <Input
                    type="date"
                    {...register('payment_date', {
                      required: 'Payment date is required',
                    })}
                    className="mt-2 text-sm"
                  />
                  {errors.payment_date && (
                    <FormMessage>*{errors.payment_date.message}</FormMessage>
                  )}
                </div>
              </FormControl>
            </div>

            <FormControl className="w-full">
              <div>
                <FormLabel className="text-sm font-medium">Description</FormLabel>
                <Textarea
                  placeholder="Description of payment..."
                  {...register('description')}
                  className="mt-2 text-sm"
                />
              </div>
            </FormControl>

            <FormControl className="w-full">
              <div>
                <FormLabel className="text-sm font-medium">Remarks</FormLabel>
                <Textarea
                  placeholder="Remarks (optional)"
                  {...register('remarks')}
                  className="mt-2 text-sm"
                />
              </div>
            </FormControl>

            <FormControl className="w-full">
              <div>
                <FormLabel className="text-sm font-medium">Attachment (optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                  className="mt-2 text-sm"
                />
              </div>
            </FormControl>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  reset();
                  setFile(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceItemCreateDialog;
