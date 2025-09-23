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
import { Loader2, X } from 'lucide-react';
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
  options: { id: string; name: string }[];
};

const CreateContractDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader,
  formData,
}: Props) => {
  const form = useForm<Fields>();
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

  const [file, setFile] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<any>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [unitList, setUnitList] = useState<GroupedOption[]>([]);

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
      propertyUnitId: data.propertyUnitId,
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
    if (file) obj.agreementDoc = file;
    console.log('s', obj);
    callback(obj);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const fetchUnitsLOV = async () => {
    try {
      const res = await service.availableLov(userDetails?.landlordId);
      // console.log('raw response', res);
      const groupedUnits = res.data.map(
        (building: { name: string; items: any[] }) => ({
          label: building.name,
          options: building.items.map((unit) => ({
            id: unit.id,
            name: unit.name,
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

  // ---- helpers for preview ----
  const isImageSrc = (src?: string) =>
    !!src &&
    (/^data:image\//.test(src) || /\.(jpg|jpeg|png|gif|webp)$/i.test(src));

  const fileKind = (name?: string, type?: string) => {
    if (type === 'application/pdf' || /\.pdf$/i.test(name ?? '')) return 'pdf';
    if (
      /msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document/.test(
        type ?? ''
      ) ||
      /\.(doc|docx)$/i.test(name ?? '')
    )
      return 'word';
    if (type === 'text/xml' || /\.xml$/i.test(name ?? '')) return 'xml';
    return 'other';
  };

  const FileIcon = ({ kind }: { kind: 'pdf' | 'word' | 'xml' | 'other' }) => {
    const common = 'w-10 h-10';
    if (kind === 'pdf')
      return (
        <svg viewBox="0 0 24 24" className={`${common} text-red-500`}>
          <path
            fill="currentColor"
            d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM7 13h3.2c1.1 0 1.8.7 1.8 1.7s-.7 1.8-1.8 1.8H8.5V18H7v-5Zm1.5 1.2v1.1h1.5c.4 0 .6-.2.6-.6s-.2-.5-.6-.5H8.5Zm6.1-1.2h1.5V18h-1.5v-1.9h-1.5V18H12v-5h1.1v1.9h1.5V13Z"
          />
        </svg>
      );
    if (kind === 'word')
      return (
        <svg viewBox="0 0 24 24" className={`${common} text-blue-500`}>
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm5 6h-5V3.98Z"
          />
          <path
            fill="currentColor"
            d="M7.5 10h1.6l.9 3.4L11 10h1.6l-1.6 5H9.6L8.8 12.7 8 15H6.7Z"
          />
        </svg>
      );
    if (kind === 'xml')
      return (
        <svg viewBox="0 0 24 24" className={`${common} text-amber-500`}>
          <path
            fill="currentColor"
            d="M8.6 16.6 3.9 12l4.7-4.6L10 8.8 6.9 12 10 15.2Zm6.8 0-1.4-1.4L17.1 12 14 8.8l1.4-1.4L20.1 12Z"
          />
        </svg>
      );
    return (
      <svg viewBox="0 0 24 24" className={`${common} text-gray-400`}>
        <path
          fill="currentColor"
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm5 6h-5V3.98Z"
        />
      </svg>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="!h-[110px] p-0 w-full">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-tl-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-12 text-4xl font-extrabold tracking-wide text-center p-[126px]">
              Add New Contract for {formData?.fname} {formData?.lname}
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
                    <FormLabel
                      htmlFor="firstName"
                      className="text-sm font-medium"
                    >
                      Select Unit
                    </FormLabel>
                    <SingleSelectGroupDropdown
                      control={control}
                      name="propertyUnitId"
                      label="Select Property Units"
                      items={unitList}
                      placeholder="Choose units"
                      rules={{ required: 'Please select at least one unit' }}
                    />
                  </div>
                  <FormControl className="m-1 w-full">
                    <div className="">
                      <FormLabel
                        htmlFor="rentPrice"
                        className="text-sm font-medium "
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
                        className="w-full"
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
                <div>
                  <div className="flex justify-between">
                    <FormLabel
                      htmlFor="address"
                      className="text-sm font-medium my-3"
                    >
                      Upload Docs
                    </FormLabel>
                  </div>
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 border-2 rounded border-scrollbar mb-1">
                      <DragDropFile
                        setFile={setFile}
                        setImg={setSelectedImg}
                        setIsNotify={ToastHandler}
                      />
                    </div>
                    {/* RIGHT: preview */}
                    {selectedImg || getValues('agreementDoc') || file ? (
                      <div className="col-span-6 relative h-full rounded border-2 border-scrollbar flex items-center justify-center xl:justify-center 2xl:justify-start p-3">
                        {/* remove button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImg(null);
                            setFile(null);
                            // clear saved value if you want:
                            // form?.setValue?.('agreementDoc', '');
                          }}
                          className="absolute -right-3 -top-3 h-7 w-7 grid place-items-center rounded-full bg-scrollbar text-white shadow hover:opacity-90"
                          aria-label="Remove file"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {(() => {
                          const persisted = getValues('agreementDoc');
                          const src = selectedImg || persisted || '';
                          const name =
                            file?.name ||
                            (typeof src === 'string'
                              ? src.split('/').pop()
                              : 'file');
                          const kind = fileKind(name, file?.type);

                          // image preview
                          if (isImageSrc(src)) {
                            return (
                              <img
                                className="max-h-[140px] max-w-[240px] rounded-md object-contain"
                                src={src}
                                alt="Uploaded document"
                              />
                            );
                          }

                          // non-image: icon + name
                          return (
                            <div className="flex items-center gap-3">
                              <FileIcon kind={kind} />
                              <div className="max-w-[260px] text-sm text-primary-bg/80 truncate">
                                {name}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    ) : null}
                  </div>
                </div>
                <DialogFooter className="mt-3">
                  <Button
                    disabled={isLoader}
                    type="submit"
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                  >
                    {isLoader && <Loader2 className="animate-spin" />} Add
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

export default CreateContractDialog;
