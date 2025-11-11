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
import { ASSET_BASE_URL } from '@/utils/constants';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // callback gets (paymentId, formData)
  callback: (paymentId: string, formData: FormData) => any;
  formData: any; // existing row (id, invoice_id, amount, currency, method, deposit_reference, deposit_date, notes, docs, etc.)
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

const ManualPaymentUpdateDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
}: Props) => {
  const form = useForm<FormFields>({
    defaultValues: {
      invoice: formData?.invoice_id ?? '',
      amount: formData?.amount ? String(formData.amount) : '',
      currency: formData?.currency ?? 'KWD',
      method: formData?.method ?? '',
      deposit_reference: formData?.deposit_reference ?? '',
      deposit_date: formData?.deposit_date
        ? new Date(formData.deposit_date).toISOString().slice(0, 16)
        : '',
      notes: formData?.notes ?? '',
      mark_as_paid: false,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = form;

  const [invoiceLov, setInvoiceLov] = useState<any[]>([]);
  const [loadingLov, setLoadingLov] = useState(false);

  // docs uploader
  const existingAttachments: any[] = useMemo(
    () => formData?.docs?.attachments || [],
    [formData]
  );
  const [keptExisting, setKeptExisting] = useState<any[]>(existingAttachments);
  const [newFiles, setNewFiles] = useState<File[]>([]);

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
    setNewFiles((prev) => [...prev, ...filtered]);
  };
  const removeNew = (idx: number) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  const removeExisting = (idx: number) =>
    setKeptExisting((prev) => prev.filter((_, i) => i !== idx));

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

    // include kept existing attachments so backend will preserve them (your update merges)
    // const docs =
    //   keptExisting.length > 0
    //     ? {
    //         attachments: keptExisting, // expected shape: array of {url, name, mime} from backend
    //       }
    //     : undefined;
    const docs = {};

    const payload: any = {
      // invoice_id: data.invoice,
      amount: numAmount,
      currency: data.currency || 'KWD',
      method: data.method?.trim() || undefined,
      deposit_reference: data.deposit_reference?.trim() || undefined,
      deposit_date: isoDate || undefined,
      notes: data.notes?.trim() || undefined,
      // mark_as_paid: !!data.mark_as_paid,
    };
    if (docs) payload.docs = docs;

    const fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    newFiles.forEach((f) => fd.append('files', f));

    callback(formData.id, fd);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="!h-[110px] p-0 w-full">
          <div className="h-16 relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-12 text-4xl font-semibold tracking-wide text-center p-[126px]">
              Update Manual Payment
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
                <div className="form-group w-full grid grid-cols-1 sm:grid-cols-1 gap-3">
                  {/* <FormControl className="m-1 w-full">
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
                  </FormControl> */}

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
                      <Input
                        id="deposit_date"
                        type="datetime-local"
                        className="mt-2 text-[11px]"
                        {...register('deposit_date')}
                      />
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
                    Attachments
                  </FormLabel>

                  <div className="grid grid-cols-12 gap-4 items-start">
                    {/* LEFT: drop/click */}
                    <div className="col-span-12 xl:col-span-6">
                      <label
                        htmlFor="lpDocsUpdateInput"
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
                          id="lpDocsUpdateInput"
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
                            document
                              .getElementById('lpDocsUpdateInput')
                              ?.click()
                          }
                        >
                          Choose files
                        </Button>
                        {!!newFiles.length && (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 text-destructive"
                            onClick={() => setNewFiles([])}
                          >
                            Clear new
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* RIGHT: previews (existing + new) */}
                    <div className="col-span-12 xl:col-span-6 space-y-3">
                      {/* Existing (kept) */}
                      {keptExisting.length ? (
                        <div className="grid grid-cols-2 gap-3">
                          {keptExisting.map((att: any, idx: number) => {
                            const name =
                              att?.name || att?.url || `Attachment ${idx + 1}`;
                            const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(
                              name
                            );
                            return (
                              <div
                                key={`ex-${idx}`}
                                className="relative rounded-lg border p-3 bg-white flex items-center gap-3"
                              >
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 h-6 w-6 grid place-items-center rounded-full bg-secondary-bg text-primary-bg"
                                  onClick={() => removeExisting(idx)}
                                  aria-label="Remove file"
                                >
                                  ✕
                                </button>
                                {isImg ? (
                                  <img
                                    src={ASSET_BASE_URL + att.url}
                                    className="h-12 w-12 rounded object-cover"
                                    alt={name}
                                  />
                                ) : (
                                  <div className="h-12 w-12 grid place-items-center rounded bg-muted text-xs">
                                    FILE
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-sm font-medium truncate max-w-[160px]">
                                    {name}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* Newly added */}
                      {newFiles.length ? (
                        <div className="grid grid-cols-2 gap-3">
                          {newFiles.map((doc, idx) => {
                            const isImg = doc.type.startsWith('image/');
                            const src = isImg ? URL.createObjectURL(doc) : '';
                            return (
                              <div
                                key={`new-${idx}`}
                                className="relative rounded-lg border p-3 bg-white flex items-center gap-3"
                              >
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 h-6 w-6 grid place-items-center rounded-full bg-secondary-bg text-primary-bg"
                                  onClick={() => removeNew(idx)}
                                  aria-label="Remove file"
                                >
                                  ✕
                                </button>
                                {isImg ? (
                                  <img
                                    src={ASSET_BASE_URL + src}
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
                      ) : null}

                      {!keptExisting.length && !newFiles.length ? (
                        <div className="rounded-xl border-2 border-dashed border-scrollbar p-6 text-sm text-muted-foreground">
                          No documents selected yet.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Mark as Paid */}
                {/* <FormControl className="m-1 w-full">
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
                </FormControl> */}

                <DialogFooter className="mt-6">
                  <Button
                    disabled={isLoader}
                    type="submit"
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded text-[12px] leading-[16px] font-semibold text-quinary-bg"
                  >
                    {isLoader && <Loader2 className="animate-spin mr-2" />}
                    Update
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

export default ManualPaymentUpdateDialog;
