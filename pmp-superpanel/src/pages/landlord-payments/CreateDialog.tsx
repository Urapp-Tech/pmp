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
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import { Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import lpService from '@/services/adminapp/manual-payment';
import { Textarea } from '@/components/ui/textarea';
import assets from '@/assets/images';
import { getItem } from '@/utils/storage';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // NOTE: callback now receives FormData (multipart)
  callback: (formData: FormData) => any;
};

type FormFields = {
  invoice: string;
  amount: string;
  currency: string;
  method?: string;
  deposit_reference?: string;
  deposit_date?: string;
  notes?: string;
  mark_as_paid: boolean;
};

const ACCEPTED = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ManualPaymentCreateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
}: Props) => {
  const form = useForm<FormFields>({
    defaultValues: {
      invoice: '',
      amount: '',
      currency: 'KWD',
      method: '',
      deposit_reference: '',
      deposit_date: '',
      notes: '',
      mark_as_paid: false,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;
  const [invoiceLov, setInvoiceLov] = useState<any[]>([]);
  const [loadingLov, setLoadingLov] = useState(false);

  // docs uploader state
  const [docs, setDocs] = useState<File[]>([]);
  const addFiles = (files: File[]) => {
    const filtered = files.filter((f) =>
      ACCEPTED.some((acc) =>
        acc.endsWith('/*')
          ? f.type.startsWith(acc.replace('/*', ''))
          : f.type === acc
      )
    );
    if (!filtered.length && files.length) {
      toast({
        description: 'Unsupported file type selected.',
        variant: 'destructive',
      });
      return;
    }
    setDocs((prev) => [...prev, ...filtered]);
  };
  const removeDoc = (idx: number) =>
    setDocs((prev) => prev.filter((_, i) => i !== idx));

  const ToastOK = (text: string) =>
    toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: { backgroundColor: '#5CB85C', color: 'white', zIndex: 9999 },
    });

  const fetchInvoiceLov = async () => {
    setLoadingLov(true);
    try {
      const res = await lpService.getInvoiceLov();
      setInvoiceLov(res?.data?.items ?? []);
    } catch {
      toast({
        description: 'Failed to load invoices.',
        variant: 'destructive',
      });
    } finally {
      setLoadingLov(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchInvoiceLov();
  }, [isOpen]);

  const onSubmit = (data: FormFields) => {
    const numAmount = Number(
      String(data.amount || '')
        .replace(/,/g, '')
        .trim()
    );
    if (Number.isNaN(numAmount) || numAmount <= 0) {
      return toast({
        description: 'Amount must be a positive number',
        variant: 'destructive',
      });
    }

    let isoDate: string | null = null;
    if (data.deposit_date?.trim()) {
      const d = new Date(data.deposit_date);
      if (!Number.isNaN(d.getTime())) isoDate = d.toISOString();
    }

    const payload = {
      invoice_id: data.invoice,
      amount: numAmount,
      currency: data.currency || 'KWD',
      method: data.method?.trim() || undefined,
      deposit_reference: data.deposit_reference?.trim() || undefined,
      deposit_date: isoDate || undefined,
      notes: data.notes?.trim() || undefined,
      mark_as_paid: !!data.mark_as_paid,
    };

    const fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    docs.forEach((f) => fd.append('files', f));
    callback(fd);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="!h-[110px] p-0 w-full">
          <div className="h-16 rounded-tl-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-12 text-4xl font-semibold tracking-wide text-center p-[126px]">
              Add Manual Payment
            </DialogTitle>
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

        <div className="bg-white rounded-bl-3xl px-6 pb-6 pt-5 relative z-20 pointer-events-auto">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="custom-form-section space-y-4">
                {/* Invoice + Amount */}
                <div className="form-group w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel className="text-sm font-medium my-2 block">
                        Invoice
                      </FormLabel>
                      <SingleSelectDropDown
                        control={control}
                        name="invoice"
                        label=""
                        items={invoiceLov}
                        placeholder={loadingLov ? 'Loading…' : 'Choose invoice'}
                        rules={{ required: 'Invoice is required' }}
                      />
                      {errors.invoice && (
                        <FormMessage>*{errors.invoice.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>

                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel
                        htmlFor="amount"
                        className="text-sm font-medium"
                      >
                        Amount
                      </FormLabel>
                      <Input
                        id="amount"
                        placeholder="e.g. 100.000"
                        type="text"
                        className="mt-2 text-[11px]"
                        {...register('amount', {
                          required: 'Amount is required',
                          pattern: {
                            value: /^\d+(\.\d{1,3})?$/,
                            message:
                              'Use up to 3 decimal places (e.g., 100.000)',
                          },
                        })}
                      />
                      {errors.amount && (
                        <FormMessage>*{errors.amount.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                </div>

                {/* Currency + Method */}
                <div className="form-group w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel
                        htmlFor="currency"
                        className="text-sm font-medium"
                      >
                        Currency
                      </FormLabel>
                      <SingleSelectDropDown
                        control={control}
                        name="currency"
                        label=""
                        items={[{ id: 'KWD', name: 'KWD' }]}
                        placeholder="Select currency"
                        rules={{ required: 'Currency is required' }}
                      />
                      {errors.currency && (
                        <FormMessage>*{errors.currency.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>

                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel
                        htmlFor="method"
                        className="text-sm font-medium"
                      >
                        Method (optional)
                      </FormLabel>
                      <SingleSelectDropDown
                        control={control}
                        name="method"
                        label=""
                        items={[
                          { id: 'bank_transfer', name: 'Bank Transfer' },
                          { id: 'cash', name: 'Cash' },
                          { id: 'pos', name: 'POS' },
                        ]}
                        placeholder="Choose a method"
                      />
                    </div>
                  </FormControl>
                </div>

                {/* Reference + Date */}
                <div className="form-group w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel
                        htmlFor="deposit_reference"
                        className="text-sm font-medium"
                      >
                        Deposit Reference (optional)
                      </FormLabel>
                      <Input
                        id="deposit_reference"
                        placeholder="Bank statement ref"
                        type="text"
                        className="mt-2 text-[11px]"
                        {...register('deposit_reference')}
                      />
                    </div>
                  </FormControl>

                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel
                        htmlFor="deposit_date"
                        className="text-sm font-medium"
                      >
                        Deposit Date (optional)
                      </FormLabel>
                      <div className="relative">
                        <Input
                          id="deposit_date"
                          type="datetime-local"
                          className="
                            mt-2 text-[11px] pr-10
                            outline-none focus:outline-none focus:border-none focus-visible:ring-0
                            appearance-none
                            [&::-webkit-calendar-picker-indicator]:opacity-0
                            [&::-webkit-clear-button]:hidden
                            [&::-ms-reveal]:hidden
                            [&::-ms-clear]:hidden
                          "
                          {...register('deposit_date')}
                        />
                        <button
                          type="button"
                          aria-label="Open date picker"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                          onClick={() => {
                            const el: any =
                              document.getElementById('deposit_date');
                            // @ts-ignore
                            if (el && typeof el.showPicker === 'function')
                              el.showPicker();
                            else el?.focus();
                          }}
                        >
                          <img
                            src={assets.images.calender}
                            alt="Calendar"
                            className="h-4 w-4 pointer-events-none"
                          />
                        </button>
                      </div>
                    </div>
                  </FormControl>
                </div>

                {/* Notes */}
                <FormControl className="m-1 w-full">
                  <div>
                    <FormLabel htmlFor="notes" className="text-sm font-medium">
                      Notes (optional)
                    </FormLabel>
                    <Textarea
                      id="notes"
                      placeholder="Any notes about this deposit"
                      rows={6}
                      className="mt-2 w-full !rounded border border-input !bg-secondary-bg px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...register('notes')}
                    />
                  </div>
                </FormControl>

                {/* Docs uploader */}
                <div className="m-1 w-full">
                  <FormLabel className="text-sm font-medium my-2 block">
                    Attach documents (images / PDF / Word)
                  </FormLabel>

                  <div className="grid grid-cols-12 gap-4 items-start">
                    {/* LEFT: drop/click */}
                    <div className="col-span-12 xl:col-span-6">
                      <label
                        htmlFor="lpDocsInput"
                        className="flex flex-col items-center justify-center w-full h-36 border-2 border-scrollbar rounded cursor-pointer bg-dialogBg hover:bg-muted transition"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          addFiles(Array.from(e.dataTransfer.files || []));
                        }}
                      >
                        <div className="text-center">
                          <p className="text-sm font-medium text-primary-bg">
                            Drag & Drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            or click to browse
                          </p>
                        </div>
                        <input
                          id="lpDocsInput"
                          type="file"
                          multiple
                          accept={ACCEPTED.join(',')}
                          className="hidden"
                          onChange={(e) => {
                            addFiles(Array.from(e.target.files || []));
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>

                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8"
                          onClick={() =>
                            document.getElementById('lpDocsInput')?.click()
                          }
                        >
                          Choose files
                        </Button>
                        {!!docs.length && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 text-destructive"
                            onClick={() => setDocs([])}
                          >
                            Clear all
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: previews */}
                    <div className="col-span-12 xl:col-span-6">
                      {docs.length ? (
                        <div className="grid grid-cols-2 gap-3">
                          {docs.map((doc, idx) => {
                            const isImg = doc.type.startsWith('image/');
                            const src = isImg ? URL.createObjectURL(doc) : '';
                            return (
                              <div
                                key={idx}
                                className="relative rounded-lg border p-3 bg-white flex items-center gap-3"
                              >
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 h-6 w-6 grid place-items-center rounded-full bg-secondary-bg text-primary-bg"
                                  onClick={() => removeDoc(idx)}
                                  aria-label="Remove file"
                                >
                                  ✕
                                </button>

                                {isImg ? (
                                  <img
                                    src={src}
                                    className="h-12 w-12 rounded object-cover"
                                    alt={doc.name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 grid place-items-center rounded bg-muted text-xs">
                                    FILE
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <div className="text-sm font-medium truncate max-w-[160px]">
                                    {doc.name}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {(doc.size / 1024).toFixed(1)} KB
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border-2 border-dashed border-scrollbar p-6 text-sm text-muted-foreground">
                          No documents selected yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mark as Paid */}
                <FormControl className="m-1 w-full">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      {...register('mark_as_paid')}
                    />
                    <span className="text-sm font-medium">
                      Mark this invoice as PAID
                    </span>
                  </label>
                </FormControl>

                <DialogFooter className="mt-6">
                  <Button
                    disabled={isLoader}
                    type="submit"
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded text-[12px] leading-[16px] font-semibold text-quinary-bg"
                  >
                    {isLoader && <Loader2 className="animate-spin mr-2" />}
                    Add
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

export default ManualPaymentCreateDialog;
