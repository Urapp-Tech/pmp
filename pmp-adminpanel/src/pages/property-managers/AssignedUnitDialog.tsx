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
import service from '@/services/adminapp/property';
import { getItem } from '@/utils/storage';
import { Loader2 } from 'lucide-react';
import { MultiSelectGroupedDropDown } from '@/components/DropDown/MultiSelectGroupedDropDown';

type Lov = { id: string; name: string };
type GroupedOption = {
  label: string; // building name
  options: { id: string; name: string }[]; // units
};

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  assignedUnits: string[]; // Array of selected userIds (UUID)
  onAssignUnits: (userIds: string[], force?: boolean) => void;
};

const AssignUserDialog = ({
  isLoader,
  isOpen,
  setIsOpen,
  assignedUnits,
  onAssignUnits,
}: Props) => {
  const userDetails: any = getItem('USER');
  const { control, handleSubmit, reset, setValue } = useForm<{
    assignedUnits: string[];
  }>();
  const [unitList, setUnitList] = useState<GroupedOption[]>([]);

  const fetchUnitsLOV = async () => {
    try {
      const res = await service.Lov(userDetails?.landlordId);
      // console.log('raw response', res);
      const groupedUnits = res.data.map(
        (building: { name: string; items: Lov[] }) => ({
          label: building.name,
          options: building.items.map((unit) => ({
            id: unit.id,
            name: unit.name,
          })),
        })
      );

      setUnitList(groupedUnits);
      setValue('assignedUnits', assignedUnits);
    } catch (error) {
      toast({
        description: 'Failed to load units',
        className: cn(
          'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
        ),
        style: {
          backgroundColor: '#5CB85C',
          color: 'white',
        },
      });
    }
  };

  useEffect(() => {
    if (isOpen) fetchUnitsLOV();
    else reset();
  }, [isOpen]);

  const onSubmit = (data: { assignedUnits: string[] }) => {
    onAssignUnits(data.assignedUnits);
    // setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Users</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <MultiSelectGroupedDropDown
            control={control}
            name="assignedUnits"
            label="Select Property Units"
            items={unitList}
            placeholder="Choose units"
            rules={{ required: 'Please select at least one unit' }}
          />
          {/* <MultiSelectDropDown
            control={control}
            name="assignedUnits"
            label="Select Units"
            items={unitList.map((u) => ({
              id: u.id,
              name: u.name,
            }))}
            placeholder="Choose units"
            rules={{ required: 'Please select at least one user' }}
          /> */}
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
