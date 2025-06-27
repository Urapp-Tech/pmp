import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

const InvoiceItemActionDialog = ({
  isOpen,
  setIsOpen,
  actionType, // 'approved' or 'rejected'
  onAction,
  item,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  actionType: 'approved' | 'rejected';
  onAction: (id: string, remarks: string, action: 'approved' | 'rejected') => void;
  item: any;
}) => {
  const [remarks, setRemarks] = useState('');
useEffect(() => {
  if (isOpen) {
    setRemarks('');
  }
}, [isOpen]);
  const handleConfirm = () => {
    onAction(item.id, remarks, actionType);
    setIsOpen(false);
    setRemarks('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {actionType === 'approved' ? 'Approved' : 'Rejected'} Payment Item
          </DialogTitle>
        </DialogHeader>

        <div>
          <label className="block mb-1 text-sm font-medium">Remarks</label>
          <Textarea
            placeholder="Enter your remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full"
          />
          
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            className={
              actionType === 'approved' ? 'bg-green-600' : 'bg-red-600'
            }
            onClick={handleConfirm}
          >
            {actionType === 'approved' ? 'Approved' : 'Rejected'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceItemActionDialog;
