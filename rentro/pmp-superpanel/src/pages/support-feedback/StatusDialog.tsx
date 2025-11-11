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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { Loader2, X } from 'lucide-react';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';

type StatusChangeForm = {
  ticketId?: string;
  status: string;
};

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  callback: (data: StatusChangeForm) => void;
  isLoader?: boolean;
  formData?: any;
};

const statusOptions = [
  { name: 'Open', id: 'open' },
  { name: 'In Progress', id: 'in_progress' },
  { name: 'Resolved', id: 'resolved' },
  { name: 'Closed', id: 'closed' },
];

const StatusChangeDialog = ({
  isOpen,
  setIsOpen,
  callback,
  isLoader = false,
  formData = '',
}: Props) => {
  const form = useForm<StatusChangeForm>({
    defaultValues: {
      status: formData?.status,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const onSubmit = (data: StatusChangeForm) => {
    // console.log('data', data);
    data.ticketId = formData.id;
    callback(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[500px] !bg-transparent [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-0 w-full rounded-t-3xl">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-t-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-2 text-4xl font-extrabold tracking-wide">
              Change Status
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
        <div className="bg-white rounded-b-3xl px-6 pb-6 pt-5">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormLabel
                htmlFor="status"
                className="text-sm font-medium my-2 block"
              >
                Change Status
              </FormLabel>
              <div>
                <SingleSelectDropDown
                  control={control}
                  name="status"
                  label="Select Status"
                  items={statusOptions}
                  placeholder="Choose an option"
                  rules={{ required: 'This field is required' }}
                />
              </div>

              <DialogFooter>
                <Button
                  disabled={isLoader}
                  type="submit"
                  className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                >
                  {isLoader && (
                    <Loader2 className="animate-spin mr-1" size={16} />
                  )}
                  Update
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeDialog;
