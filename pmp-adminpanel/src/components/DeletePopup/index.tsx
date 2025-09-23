import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[600px] !bg-transparent [&>button]:hidden">
        <DialogHeader className="p-0 w-full rounded-t-3xl">
          {/* stretch across padding: -mx-6, -mt-6 matches DialogContent p-6 */}
          <div className="h-16 rounded-t-3xl relative flex items-center justify-center">
            <DialogTitle className="text-primary-bg mt-2 text-4xl font-extrabold tracking-wide">
              Delete {title}
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
          <div>
            <p className="text-sm text-primary-bg font-medium">
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
              className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
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
