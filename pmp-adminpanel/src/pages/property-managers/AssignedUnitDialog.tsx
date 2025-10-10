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
import { Loader2, X } from 'lucide-react';
import { MultiSelectGroupedDropDown } from '@/components/DropDown/MultiSelectGroupedDropDown';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';

type Lov = { id: string; name: string; unit_no: string };
type GroupedOption = {
  label: string; // building name
  options: { id: string; name: string; unit_no: string }[]; // units
};

type Props = {
  isLoader: boolean;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  assignedProperties: string[]; // Array of selected userIds (UUID)
  onAssignProperties: (userIds: string[], force?: boolean) => void;
};
type GroupedUnit = {
  id: string;
  name: string;
  rent?: number;
};

type GroupedProperty = {
  id: string;
  name: string;
  units: GroupedUnit[];
};
const AssignUserDialog = ({
  isLoader,
  isOpen,
  setIsOpen,
  assignedProperties,
  onAssignProperties,
}: Props) => {
  const userDetails: any = getItem('USER');
  const { control, handleSubmit, reset, setValue } = useForm<{
    assignedProperties: string[];
  }>();
  const [unitList, setUnitList] = useState<GroupedOption[]>([]);
  const [propertyList, setPropertyList] = useState<GroupedProperty[]>([]);

  const fetchPropertyLOV = async () => {
    const res = await service.availablePropertyLov(userDetails?.landlordId);
    // Format for dropdown
    const formatted = res.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      units:
        p.units?.map((u: any) => ({
          id: u.id,
          name: u.unit_no, // or whatever your unit display field is
          rent: u.rent,
        })) || [],
    }));
    // console.log('formatted', formatted);

    setPropertyList(formatted);
    setValue('assignedProperties', assignedProperties);
  };

  // useEffect(() => {
  //   fetchPropertyLOV();
  // }, []);
  const fetchUnitsLOV = async () => {
    try {
      const res = await service.Lov(userDetails?.landlordId);
      console.log('raw response', res);
      const groupedUnits = res.data.map(
        (building: { name: string; items: Lov[] }) => ({
          label: building.name,
          options: building.items.map((unit) => ({
            id: unit.id,
            name: unit.unit_no,
            // unit_no:
          })),
        })
      );

      setUnitList(groupedUnits);
      setValue('assignedProperties', assignedProperties);
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
    if (isOpen) fetchPropertyLOV();
    else reset();
  }, [isOpen]);

  const onSubmit = (data: { assignedProperties: string[] }) => {
    console.log('data', data.assignedProperties);

    onAssignProperties(data.assignedProperties);
    // setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] !bg-transparent [&>button]:hidden">
        <DialogHeader className="p-0 w-full rounded-t-3xl">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-t-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-2 text-4xl font-semibold tracking-wide">
              Assign Tenants
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
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full m-1 mt-[8px]">
              <label className="text-sm font-semibold">Select Property</label>
              <MultiSelectDropDown
                control={control}
                name="assignedProperties"
                label="Property"
                items={propertyList}
                placeholder="Choose Property"
                rules={{ required: 'Please select at least one unit' }}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                disabled={isLoader}
                type="submit"
                className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
              >
                {isLoader ? <Loader2 className="animate-spin" /> : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignUserDialog;
