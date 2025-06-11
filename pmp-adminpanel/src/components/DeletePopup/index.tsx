import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type Props = {
  title: string;
  isLoader: boolean;
  isOpen: boolean;
  formData: any;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  callback: (...args: any[]) => any;
};

const DeleteDialog = ({
  title,
  isOpen,
  formData,
  setIsOpen,
  callback,
  isLoader,
}: Props) => {
  const handleOnClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={handleOnClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Delete {title}</DialogTitle>
        </DialogHeader>
        <div className="">
          <div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete this {title}?
            </p>
          </div>
          <DialogFooter className="mt-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
              }}
              className="ml-auto w-[148px] h-[35px] bg-white rounded-[20px] text-[12px] leading-[16px] font-semibold text-venus-bg border-[2px]"
            >
              No
            </Button>
            <Button
              disabled={isLoader}
              onClick={() => callback({ id: formData.id, text: 'yes' })}
              className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
            >
              {isLoader && <Loader2 className="animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
