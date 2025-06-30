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
import { Loader2 } from 'lucide-react';
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
        backgroundColor: '#FF5733',
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[600px] cs-dialog-box"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="capitalize">
            Add New Contract for {formData?.fname} {formData?.lname}{' '}
          </DialogTitle>
        </DialogHeader>
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
                  <div className="">
                    <FormLabel
                      htmlFor="leavingDate"
                      className="text-sm font-medium"
                    >
                      Leaving Date
                    </FormLabel>
                    <Input
                      id="leavingDate"
                      type="date"
                      className="mt-2 text-[11px] outline-none focus:outline-none focus:border-none focus-visible:ring-offset-[1px] focus-visible:ring-0"
                      {...register('leavingDate', {
                        required: 'Please select leaving date',
                      })}
                    />
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
                      onDateRangeChange={(
                        startDate: string,
                        endDate: string
                      ) => {
                        setValue('contractStart', startDate);
                        setValue('contractEnd', endDate);
                      }}
                    />
                    {errors.contractStart && (
                      <FormMessage>*{errors.contractStart.message}</FormMessage>
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
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-5 mb-1">
                    <DragDropFile
                      setFile={setFile}
                      setImg={setSelectedImg}
                      setIsNotify={ToastHandler}
                    />
                  </div>
                  {/* {selectedImg ? (
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedImg) ? (
                      // ✅ If image: show preview
                      <div className="col-span-6 flex items-center justify-center xl:justify-center 2xl:justify-start">
                        <img
                          className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                          src={selectedImg}
                          alt="Uploaded"
                        />
                      </div>
                    ) : (
                      // ✅ If not image: show file name
                      <div className="col-span-6 flex items-center justify-center xl:justify-center 2xl:justify-start">
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {selectedImg.split('/').pop()}
                        </p>
                      </div>
                    )
                  ) : getValues('agreementDoc') ? (
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(
                      getValues('agreementDoc')
                    ) ? (
                      <div className="col-span-6 flex items-center justify-center xl:justify-center 2xl:justify-start">
                        <img
                          className="max-h-[100px] max-w-[150px] rounded-md mx-auto"
                          src={getValues('agreementDoc')}
                          alt="agreementDoc"
                        />
                      </div>
                    ) : (
                      <div className="col-span-6 flex items-center justify-center xl:justify-center 2xl:justify-start">
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {getValues('agreementDoc').split('/').pop()}
                        </p>
                      </div>
                    )
                  ) : null} */}
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
              </div>
              <DialogFooter className="mt-3">
                <Button
                  disabled={isLoader}
                  type="submit"
                  className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
                >
                  {isLoader && <Loader2 className="animate-spin" />} Add
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateContractDialog;
