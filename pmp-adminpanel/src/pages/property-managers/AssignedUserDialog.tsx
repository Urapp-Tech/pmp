import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { MultiSelectDropDown } from '@/components/DropDown/MultiSelectDropDown';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import service from '@/services/adminapp/users';
import { getItem } from '@/utils/storage';
import { Loader2 } from 'lucide-react';

type User = { id: string; name: string; isAlreadyAssigned?: boolean };

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  assignedUsers: string[]; // Array of selected userIds (UUID)
  onAssignUsers: (userIds: string[], force?: boolean) => void;
};

const AssignUserDialog = ({
  isLoader,
  isOpen,
  setIsOpen,
  assignedUsers,
  onAssignUsers,
}: Props) => {
  const userDetails: any = getItem('USER');
  const { control, handleSubmit, reset, setValue } = useForm<{
    assignedUsers: string[];
  }>();
  const [userList, setUserList] = useState<User[]>([]);

  const fetchUsersLOV = async () => {
    try {
      const res = await service.Lov(userDetails?.landlordId);
      const list: User[] = res.data;
      setUserList(list);
      setValue('assignedUsers', assignedUsers);
    } catch (error) {
      toast({
        description: 'Failed to load users',
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
    if (isOpen) fetchUsersLOV();
    else reset();
  }, [isOpen]);

  const onSubmit = (data: { assignedUsers: string[] }) => {
    onAssignUsers(data.assignedUsers);
    // setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Users</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <MultiSelectDropDown
            control={control}
            name="assignedUsers"
            label="Select Users"
            items={userList.map((u) => ({
              id: u.id,
              name: u.name,
            }))}
            placeholder="Choose users"
            rules={{ required: 'Please select at least one user' }}
          />
          <DialogFooter className="mt-4">
            <Button
              disabled={isLoader}
              type="submit"
              className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
            >
              {isLoader ? <Loader2 className="animate-spin" /> : 'Assign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserDialog;
