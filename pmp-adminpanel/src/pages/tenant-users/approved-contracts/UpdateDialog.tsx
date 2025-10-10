import {
  Dialog,
  DialogContent,
  //   DialogTrigger,
  DialogFooter,
  //   DialogDescription,
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
// import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Fields } from '@/interfaces/back-office-user.interface';
import { FileText, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import DragDropFile from '@/components/DragDropImgFile';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import service from '@/services/adminapp/property';
import { SingleSelectGroupDropdown } from '@/components/DropDown/SingleSelectGroupedDropDown';
import { getItem } from '@/utils/storage';
import { DatePickerWithRange } from '@/components/DateRange';
import dayjs from 'dayjs';
import { ASSET_BASE_URL } from '@/utils/constants';
import assets from '@/assets/images';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
  formData?: any;
};

type GroupedOption = {
  label: string;
  options: { id: string; name: string; unit_no: string }[];
};

const UpdateContractDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
}: Props) => {
  const form = useForm<Fields>({
    defaultValues: {
      propertyUnitId: formData?.unitDetail?.id || '',
      civilId: formData?.civilId || '',
      nationality: formData?.nationality || '',
      rentPrice: formData?.rentPrice || '',
      rentPayDay: formData?.rentPayDay || '',
      tenantType: formData?.tenantType || '',
      legalCase: formData?.legalCase || '',
      contractStart: dayjs(formData?.contractStart).format('YYYY-MM-DD'),
      contractEnd: dayjs(formData?.contractEnd).format('YYYY-MM-DD'),
      leavingDate: dayjs(formData?.leavingDate).format('YYYY-MM-DD'),
      paymentCycle: formData?.paymentCycle || '',
      language: formData?.language || '',
    },
  });
useEffect(() => {
  if (!formData) return;

  // Try common backend shapes; fall back to IDs if no names present
  const pName =
    formData.unitDetail?.property.name ||
    '';

  const uName =
    formData.unitDetail?.unitNo ||
    '';

  setPropertyLabel(String(pName));
  setUnitLabel(String(uName));
}, [formData]);

  const userDetails: any = getItem('USER');
  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: '#5CB85C',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  console.log('formData', formData);

  const [file, setFile] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [unitList, setUnitList] = useState<GroupedOption[]>([]);
  const [propertyLabel, setPropertyLabel] = useState<string>('');
  const [unitLabel, setUnitLabel] = useState<string>('');

  const [docs, setDocs] = useState<File[]>([]);

  const isImageFile = (f: File) => /^image\//.test(f.type);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    control,
    watch,
    formState: { errors },
  } = form;

  const onSubmit = async (data: Fields) => {
    let obj: Fields = {
      propertyId: data.propertyId,
      propertyUnitId: data.propertyUnitId || formData?.unitDetail?.id,
      civilId: data.civilId,
      nationality: data.nationality,
      rentPrice: Number(data.rentPrice),
      rentPayDay: Number(data.rentPayDay),
      tenantType: data.tenantType,
      legalCase: data.legalCase,
      contractStart: dayjs(data.contractStart).format('YYYY-MM-DD'),
      contractEnd: dayjs(data.contractEnd).format('YYYY-MM-DD'),
      leavingDate: dayjs(data.leavingDate).format('YYYY-MM-DD'),
      paymentCycle: data.paymentCycle,
      language: data.language,
    };
    if (docs.length) (obj as any).agreementDoc = docs;
    // if (file) obj.agreementDoc = file;
    // console.log('s', obj);
    callback(obj);
  };

  useEffect(() => {
    if (formData) {
      setValue('contractStart', formData.contractStart);
      setValue('contractEnd', formData.contractEnd);
    }
  }, [formData, setValue]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const fetchUnitsLOV = async () => {
    try {
      const res = await service.availableUnitLov(userDetails?.landlordId);
      // console.log('raw response', res);
      const groupedUnits = res.data.map(
        (building: { name: string; items: any[] }) => ({
          label: building.name,
          options: building.items.map((unit) => ({
            id: unit.id,
            name: unit.unit_no,

            rent: unit.rent,
          })),
        })
      );

      setUnitList(groupedUnits);
    } catch (error) {
      toast({
        description: 'Failed to load units',
        className: cn(
          'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
        ),
        style: {
          backgroundColor: '#FF5733',
          color: 'white',
        },
      });
    }
  };

  useEffect(() => {
    fetchUnitsLOV();
  }, []);

  useEffect(() => {
    const selectedUnitId = watch('propertyUnitId');

    if (selectedUnitId) {
      const selectedUnit: any = unitList
        .flatMap((group) => group.options)
        .find((unit) => unit.id === selectedUnitId);

      if (selectedUnit?.rent) {
        setValue('rentPrice', selectedUnit.rent);
      }
    }
  }, [watch('propertyUnitId'), unitList, setValue]);

  console.log('selected unit', selectedImg, file);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="!h-[110px] p-0 w-full">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-tl-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg capitalize mt-12 text-4xl font-semibold tracking-wide text-center p-[126px]">
              Update Contract for {formData?.userDetail?.fname}{' '}
              {formData?.userDetail?.lname}{' '}
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
                  <div className="form-group w-full flex gap-3">
                <div className="w-full m-1 mt-[8px]">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel className="text-sm font-medium">
                        Property
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px]"
                        value={propertyLabel}
                        readOnly
                      />
                    </div>
                  </FormControl>
                </div>
                <div className="w-full m-1 mt-[8px]">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel className="text-sm font-medium">
                        Unit
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px]"
                        value={unitLabel}
                        readOnly
                      />
                    </div>
                  </FormControl>
                </div>
                </div>
                <div className="form-group w-full flex gap-3">
                   <div className="w-full m-1 mt-[8px]">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel className="text-sm font-medium">
                        Contract no
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px]"
                        value={formData?.contractNumber}
                        readOnly
                      />
                    </div>
                  </FormControl>
                </div>
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="rentPrice"
                        className="text-sm font-medium"
                      >
                        Rent Price
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="rentPrice"
                        placeholder="1500"
                        type="number"
                        {...register('rentPrice')}
                      />
                      {errors.rentPrice && (
                        <FormMessage>*{errors.rentPrice.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                </div>
                <div className="form-group w-full flex items-center justify-center gap-5 m-1">
                  <div className="w-full">
                    <FormLabel
                      htmlFor="tenantType"
                      className="text-sm font-medium my-2 block"
                    >
                      Tenant Type
                    </FormLabel>
                    <SingleSelectDropDown
                      control={control}
                      name="tenantType"
                      label=""
                      items={[
                        { id: 'individual', name: 'Individual' },
                        { id: 'company', name: 'Company' },
                      ]}
                      placeholder="Choose an option"
                      rules={{ required: 'This field is required' }}
                    />
                  </div>
                  <div className="w-full">
                    <FormLabel
                      htmlFor="paymentCycle"
                      className="text-sm font-medium my-2 block"
                    >
                      Payment Cycle
                    </FormLabel>
                    <SingleSelectDropDown
                      control={control}
                      name="paymentCycle"
                      label=""
                      items={[
                        { id: 'Monthly', name: 'Monthly' },
                        { id: 'Quarterly', name: 'Quarterly' },
                        { id: 'Yearly', name: 'Yearly' },
                      ]}
                      placeholder="Choose an option"
                      rules={{ required: 'This field is required' }}
                    />
                  </div>
                </div>
                <div className="form-group w-full flex items-center justify-center gap-5 m-1">
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="nationality"
                        className="text-sm font-medium"
                      >
                        Nationality
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="nationality"
                        placeholder="Pakistani"
                        type="text"
                        {...register('nationality', {
                          required: 'Please enter your first name',
                        })}
                      />
                      {errors.nationality && (
                        <FormMessage>*{errors.nationality.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="language"
                        className="text-sm font-medium"
                      >
                        Language
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="language"
                        placeholder="English"
                        type="text"
                        {...register('language', {
                          required: 'Please enter your first name',
                        })}
                      />
                      {errors.language && (
                        <FormMessage>*{errors.language.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                </div>
                <div className="form-group w-full flex items-center justify-center gap-5 m-1">
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="rentPayDay"
                        className="text-sm font-medium"
                      >
                        Rent Payment Day
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="rentPayDay"
                        placeholder="Ex: write integer number (1 - 31)"
                        type="number"
                        {...register('rentPayDay')}
                      />
                      {errors.rentPayDay && (
                        <FormMessage>*{errors.rentPayDay.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="civilId"
                        className="text-sm font-medium"
                      >
                        Civil Id
                      </FormLabel>
                      <Input
                        className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                        id="civilId"
                        placeholder="23473724"
                        type="number"
                        {...register('civilId')}
                      />
                      {errors.civilId && (
                        <FormMessage>*{errors.civilId.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                </div>
                <div className="form-group w-full flex items-center justify-center gap-5 m-1">
                  <FormControl className="m-1 w-full">
                    <div>
                      <FormLabel
                        htmlFor="leavingDate"
                        className="text-sm font-medium"
                      >
                        Leaving Date
                      </FormLabel>

                      <div className="relative">
                        <Input
                          id="leavingDate"
                          type="date"
                          className="
                            mt-2 text-[11px] pr-10
                            outline-none focus:outline-none focus:border-none focus-visible:ring-0
                            appearance-none
                            [&::-webkit-calendar-picker-indicator]:opacity-0
                            [&::-webkit-clear-button]:hidden
                            [&::-ms-reveal]:hidden
                            [&::-ms-clear]:hidden
                          "
                          {...register('leavingDate', {
                            required: 'Please select leaving date',
                          })}
                        />

                        <button
                          type="button"
                          aria-label="Open date picker"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                          onClick={() => {
                            const el: any =
                              document.getElementById('leavingDate');
                            // @ts-ignore: showPicker not in all TS libs
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

                      {errors.leavingDate && (
                        <FormMessage>*{errors.leavingDate.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                  <FormControl className="flex w-full items-center gap-2 mt-1">
                    <div>
                      <input
                        type="checkbox"
                        id="legalCase"
                        {...register('legalCase')}
                        className="h-[16px] w-[16px] cursor-pointer accent-bg-primary-bg"
                      />
                      <FormLabel
                        htmlFor="legalCase"
                        className="text-sm font-medium mt-[2px]"
                      >
                        Legal Case
                      </FormLabel>
                    </div>
                  </FormControl>
                </div>
                <div className="form-group w-full flex gap-3">
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="contractStart"
                        className="text-sm font-medium my-2 block"
                      >
                        Contract Dates
                      </FormLabel>
                      <DatePickerWithRange
                        initialFrom={formData.contractStart}
                        initialTo={formData.contractEnd}
                        onDateRangeChange={(
                          startDate: string,
                          endDate: string
                        ) => {
                          setValue('contractStart', startDate);
                          setValue('contractEnd', endDate);
                        }}
                      />
                      {errors.contractStart && (
                        <FormMessage>
                          *{errors.contractStart.message}
                        </FormMessage>
                      )}
                      {errors.contractEnd && (
                        <FormMessage>*{errors.contractEnd.message}</FormMessage>
                      )}
                    </div>
                  </FormControl>
                </div>
                {/* <div>
                <div className="flex justify-between">
                  <FormLabel
                    htmlFor="address"
                    className="text-sm font-medium my-3"
                  >
                    Upload Docs
                  </FormLabel>
                </div>
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-5 mb-1">
                    <DragDropFile
                      setFile={setFile}
                      setImg={setSelectedImg}
                      setIsNotify={ToastHandler}
                    />
                  </div>
                  {selectedImg ? (
                    <div className="col-span-6 flex items-center justify-center xl:justify-center 2xl:justify-start">
                      {/^data:image\//.test(selectedImg) ||
                      /\.(jpg|jpeg|png|webp|gif)$/i.test(selectedImg) ? (
                        <img
                          className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                          src={selectedImg}
                          alt="Doc Uploaded"
                        />
                      ) : (
                        <div>{file?.name}</div>
                      )}
                    </div>
                  ) : getValues('agreementDoc') ? (
                    <div className="col-span-6 flex items-center justify-center  xl:justify-center 2xl:justify-start">
                      <img
                        className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                        src={getValues('agreementDoc')}
                        alt="agreementDoc"
                      />
                    </div>
                  ) : null}
                </div>
              </div> */}

                <FormLabel className="text-sm font-medium my-3">
                  Upload Docs
                </FormLabel>

                <div className="grid grid-cols-12 gap-4 items-start">
                  <div className="col-span-6 border-2 rounded border-scrollbar p-3">
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        setDocs((prev) => [...prev, ...files]);
                      }}
                      className="!bg-white"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.gif"
                    />
                    <p className="text-[11px] text-muted-foreground mt-2">
                      You can add multiple files. Supported: images, PDF, Word,
                      TXT.
                    </p>
                  </div>

                  {/* NEW DOCS PREVIEW (not yet saved) */}
                  <div className="col-span-6">
                    {docs.length > 0 && (
                      <div>
                        <p className="text-xs text-primary-bg/70 mb-2">
                          New files to upload:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {docs.map((f, idx) => (
                            <div
                              key={`${f.name}-${idx}`}
                              className="w-20 h-20 relative border rounded flex items-center justify-center overflow-hidden"
                              title={f.name}
                            >
                              {isImageFile(f) ? (
                                <img
                                  className="w-full h-full object-cover"
                                  src={URL.createObjectURL(f)}
                                  alt={f.name}
                                />
                              ) : (
                                <img
                                  className="w-10 h-10 object-contain"
                                  src={assets.images.tenantAssign}
                                  alt={f.name}
                                />
                                // <FileText
                                //   size={18}
                                //   className="text-primary-bg"
                                // />
                              )}
                              <button
                                type="button"
                                className="absolute z-50 -top-0 -right-0 h-6 w-6 grid place-items-center rounded-full bg-red-500 text-white text-xs"
                                onClick={() =>
                                  setDocs((prev) =>
                                    prev.filter((_, i) => i !== idx)
                                  )
                                }
                                aria-label="Remove"
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* EXISTING (already saved) DOCS */}
                {Array.isArray(formData?.agreement_doc) &&
                  formData.agreement_doc.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-primary-bg/70 mb-2">
                        Existing documents:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.agreement_doc.map(
                          (path: string, idx: number) => {
                            const href = ASSET_BASE_URL + path;
                            const isImg = /\.(png|jpe?g|webp|gif)$/i.test(path);
                            return (
                              <a
                                key={idx}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-20 h-20 border rounded overflow-hidden flex items-center justify-center"
                                title={path.split('/').pop()}
                              >
                                {isImg ? (
                                  <img
                                    src={href}
                                    alt="doc"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    className="w-10 h-10 object-contain"
                                    src={assets.images.tenantAssign}
                                    alt={'file'}
                                  />
                                )}
                              </a>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}
                <DialogFooter className="mt-3">
                  <Button
                    disabled={isLoader}
                    type="submit"
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                  >
                    {isLoader && <Loader2 className="animate-spin" />} Update
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

export default UpdateContractDialog;
