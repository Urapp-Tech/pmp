import { useState } from 'react';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  //   DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AssignCabinFields } from '@/interfaces/employee.interface';
import { Controller, useForm } from 'react-hook-form';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  formData: any;
  allData?: any;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
};

const EmployeeAssignDialog = ({
  isOpen,
  setIsOpen,
  formData,
  allData,
  callback,
  isLoader,
}: Props) => {
  const form = useForm<AssignCabinFields>();
  const { toast } = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: {
        backgroundColor: '#FF5733',
        color: 'white',
      },
    });
  };

  const [isPopOpen, setIsPopOpen] = useState<boolean>(false);
  const [cabinData, setCabinData] = useState<any>();

  const handleYesSelection = () => {
    callback(cabinData);
    // console.log('data,', cabinData);
  };

  const handleNoSelection = () => {
    setIsPopOpen(false);
    setCabinData(null);
  };

  const onSubmit = async (data: AssignCabinFields | any) => {
    data.employee = formData.id;
    const isCheckAssigned = allData?.some(
      (obj: any) => obj.cabin === data.cabin
    );
    if (isCheckAssigned && formData?.cabin === data.cabin) {
      ToastHandler('This cabin is already assigned to this employee');
    } else if (isCheckAssigned) {
      setIsPopOpen(true);
      setCabinData(data);
    } else {
      console.log('data,', data);
      callback(data);
    }
  };

  const ReassignDialogHandler = () => {
    return (
      <Dialog open={isPopOpen} onOpenChange={setIsPopOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Re-assign Cabin to {formData?.name}</DialogTitle>
            <DialogDescription>
              This cabin is already assigned, Are you sure to re-assign.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <Button onClick={() => handleNoSelection()} className="w-24">
              No
            </Button>
            <Button
              variant={'outline'}
              disabled={isLoader}
              onClick={() => handleYesSelection()}
              className="w-24 hover:bg-green-700 hover:text-white"
            >
              {isLoader && <Loader2 className="animate-spin" />} Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return isPopOpen ? (
    <ReassignDialogHandler />
  ) : (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Cabin to {formData?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="">
              <Controller
                name="cabin"
                control={control}
                defaultValue=""
                rules={{ required: 'Option is required' }}
                render={({ field, fieldState }: any) => (
                  <div>
                    <SingleSelectDropDown
                      label="Cabins"
                      placeHolder="Select an option"
                      items={formData?.items ?? []}
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.error && (
                      <FormMessage>*{fieldState.error.message}</FormMessage>
                    )}
                  </div>
                )}
              />
              <DialogFooter className="mt-3">
                <Button disabled={isLoader} type="submit" className="w-24">
                  {isLoader && <Loader2 className="animate-spin" />} Assign
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAssignDialog;
