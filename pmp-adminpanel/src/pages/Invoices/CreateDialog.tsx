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
// import { InvoiceItemFields } from '@/interfaces/invoice-items.interface';
import { Loader2 } from 'lucide-react';
import { useForm  } from 'react-hook-form';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/invoice' ;
import { useEffect, useState } from 'react';

interface InvoiceCreateDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  callback: (data: InvoiceFields) => void;
  isLoader: boolean;
}

const InvoiceCreateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
}: InvoiceCreateDialogProps) => {
  const form = useForm<InvoiceFields>();
  const {
    register,
    handleSubmit,
    control,
    reset,
    // setValue ,
    formState: { errors },
  } = form;
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);

  const [contracts, setContracts] = useState<[]>([]);

const cycleMap: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

/**
 * Handles the form submission for creating an invoice.
 * 
 * @param {InvoiceFields} data - The data collected from the form, 
 * containing details required to create a new invoice.
 * 
 * This function triggers a callback with the submitted invoice data.
 */

  const onSubmit = (data: InvoiceFields) => {
    callback(data);
    reset()
  };

  useEffect(() => {
     const fetchTenants = async () => {
      
      const res = await service.get_all_tanents();
      if (res?.data?.success) {
        // console.log('res111', res);
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

  useEffect(() => {
        const selectedTenant:any = contracts.find((t:any) => t.id === form.watch('tenant_id'));
        form.setValue('total_amount', selectedTenant?.rent_price, { shouldValidate: true });
        const cycleRaw = selectedTenant?.payment_cycle || 'monthly';
        const cycle = cycleRaw.toLowerCase(); 
        const cycleMonths = cycleMap[cycle] || 1; 
        form.setValue('qty', cycleMonths, { shouldValidate: true });
        const rentPayDay = selectedTenant?.rent_payDay || 1; // fallback to 1st of month
        const nextDate = new Date();
        nextDate.setMonth(nextDate.getMonth() + cycleMonths);
        nextDate.setDate(rentPayDay);
        const formattedDate = nextDate.toISOString().slice(0, 10); // "2025-09-05"
        form.setValue('due_date', formattedDate, { shouldValidate: true });
  },[form.watch('tenant_id')])

  // console.log("tenants", tenants);
  

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>

      <DialogContent className="sm:max-w-[600px]  max-h-[70vh] cs-dialog-box" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add New Invoice</DialogTitle>
        </DialogHeader>

        <Form {...form}>
  <form onSubmit={handleSubmit(onSubmit)}>
    <div className="custom-form-section">

      <div className="form-group w-full flex gap-3">

        <FormControl className="m-1 w-full">
                  <div>
            <FormLabel>Contract Number</FormLabel>
           <SingleSelectDropDown
                      name="tenant_id"
                      items={tenants}
                      control={control}
                      // value={form.watch('tenant_id') || ''} 
                      placeholder="Select Contract Number" label={'Contract Number'}    />
          </div>
        </FormControl>
        <FormControl className="m-1 w-full">
          <div>
            <FormLabel>Total Amount</FormLabel>
            <Input readOnly  {...register('total_amount', { required: 'Required' })} />
          </div>
        </FormControl>
      </div>

      <div className="form-group w-full flex gap-3">
        
      </div>

      <div className="form-group w-full flex gap-3">
        
        <FormControl className="m-1 w-full">
          <div>
            <FormLabel>Status</FormLabel>
            <SingleSelectDropDown
              control={control}
              name="status"
              // value={form.watch('status') || 'paid'}
              items={[
                { name: 'Paid', id: 'paid' },
                { name: 'Unpaid', id: 'unpaid' },
                // { name: 'Partial', id: 'partial' },
                { name: 'Overdue', id: 'overdue' },
              ]}
              // selectedValue={ 'paid'}
              label='Status'
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
                      rules={{ required: 'Required' }} label={'Payment Method'}            />
          </div>
        </FormControl>
      
      </div>


      <div className="form-group w-full flex gap-3">
        
          <FormControl className="m-1 w-full">
          <div>
            <FormLabel>Month Qty</FormLabel>
            <Input type="number" readOnly {...register('qty')} />
          </div>
        </FormControl>

        <FormControl className="m-1 w-full">
          <div>
            <FormLabel>Due Date</FormLabel>
            <Input type="date" readOnly {...register('due_date')} />
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
          {isLoader && <Loader2 className="animate-spin mr-2" />} Add Invoice
        </Button>
      </DialogFooter>
    </div>
  </form>
</Form>

      </DialogContent>
      
    </Dialog>
  );
};

export default InvoiceCreateDialog;
