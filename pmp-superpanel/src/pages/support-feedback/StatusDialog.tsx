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
import { Loader2 } from 'lucide-react';
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
        className="sm:max-w-[400px] sm:max-h-[300px] cs-dialog-box"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
        </DialogHeader>
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
                className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
              >
                {isLoader && (
                  <Loader2 className="animate-spin mr-1" size={16} />
                )}
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeDialog;
