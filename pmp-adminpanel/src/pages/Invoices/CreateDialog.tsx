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
import { InvoiceItemFields } from '@/interfaces/invoice-items.interface';
import { Loader2 } from 'lucide-react';
import { useForm,Controller  } from 'react-hook-form';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/invoice' ;
import { useEffect, useState } from 'react';

const InvoiceCreateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
}) => {
  const form = useForm<InvoiceFields>();
  const {
    register,
    handleSubmit,
    control,
    setValue ,
    formState: { errors },
  } = form;
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);

  const [contracts, setContracts] = useState<[]>([]);



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
  };

  useEffect(() => {
     const fetchTenants = async () => {
      const res = await service.get_all_tanents();
      if (res?.data?.success) {
        // console.log('res', res);
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
            <FormLabel>Tenant Name</FormLabel>
           <SingleSelectDropDown
      name="tenant_id"
      items={tenants}
      control={control}
      value={form.watch('tenant_id') || ''} 
      onChange={(val) => {
        form.setValue('tenant_id', val, { shouldValidate: true });
        const selectedTenant = contracts.find(t => t.id === val);
        form.setValue('total_amount', selectedTenant?.rent_price, { shouldValidate: true });
        form.setValue('qty', selectedTenant?.month, { shouldValidate: true });
        form.setValue('due_date', selectedTenant?.rentPayDay, { shouldValidate: true });
        form.setValue('due_date', selectedTenant?.rentPayDay, { shouldValidate: true });
      }}
      placeholder="Select Tenant"
    />
          </div>
        </FormControl>
        {form.watch('tenant_id') }
        <FormControl className="m-1 w-full">
          <div>
            <FormLabel>Total Amount</FormLabel>
            <Input {...register('total_amount', { required: 'Required' })} />
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
              value={form.watch('status') || 'paid'}
              items={[
                { name: 'Paid', id: 'paid' },
                { name: 'Unpaid', id: 'unpaid' },
                // { name: 'Partial', id: 'partial' },
                { name: 'Overdue', id: 'overdue' },
              ]}
              selectedValue={ 'paid'}
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
