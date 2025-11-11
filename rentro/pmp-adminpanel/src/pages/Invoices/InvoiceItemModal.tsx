import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Download, CheckCircle, XCircle, Pencil } from 'lucide-react';
import invoiceService from '@/services/adminapp/invoice';
import { PERMISSIONS } from '@/utils/constants';
import { usePermission } from '@/utils/hasPermission';

const ITEMS_PER_PAGE = 5;
const ASSETS_BASE_URL = import.meta.env.VITE_ASSETS_BASE_URL || '';
const InvoiceItemModal = ({
  isOpen,
  setIsOpen,
  invoiceId,
  setShowCreateItemModal,
  setSelectedInvoiceItemId,
  // onAction,
  setActionType,
  setSelectedItem,
  setActionDialogOpen,
}: any) => {
  const { can } = usePermission();
  const [currentPage, setCurrentPage] = useState(1);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (invoiceId && isOpen) {
      fetchInvoiceItems(invoiceId, currentPage);
    }
  }, [invoiceId, currentPage, isOpen]);

  const fetchInvoiceItems = async (id: string, page: number) => {
    setIsLoading(true);
    try {
      const res = await invoiceService.getInvoiceItems(
        id,
        page,
        ITEMS_PER_PAGE
      );
      if (res?.data?.success) {
        setInvoiceItems(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load invoice items', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl cs-dialog-box">
        <DialogHeader>
          <DialogTitle>Invoice Payment Items</DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-x-auto h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="text-center">Action/Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : invoiceItems.length > 0 ? (
                invoiceItems.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.amount || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold
      ${
        item.status === 'approved'
          ? 'bg-green-200 text-green-700'
          : item.status === 'rejected'
            ? 'bg-red-200 text-red-700'
            : 'bg-gray-200 text-gray-700'
      }
    `}
                      >
                        {item.status || '-'}
                      </span>
                    </TableCell>

                    <TableCell>{item.payment_method || '-'}</TableCell>
                    <TableCell>{item.payment_date || '-'}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>
                      {item.file ? (
                        <a
                          href={`${ASSETS_BASE_URL}${item.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                        >
                          <Download className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.status === 'pending' ? (
                        <div className="flex gap-2 justify-center">
                          {can(PERMISSIONS.TENANT_RENTAL.UPDATE) && (
                            <Pencil
                              className="cursor-pointer text-blue-500"
                              onClick={() => {
                                setSelectedInvoiceItemId(item.id);
                                setShowCreateItemModal(true);
                              }}
                            />
                          )}

                          {can(PERMISSIONS.INVOICE.UPDATE) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => {
                                  setActionType('approved');
                                  setSelectedItem(item);
                                  setActionDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setActionType('rejected');
                                  setSelectedItem(item);
                                  setActionDialogOpen(true);
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-700 italic max-w-[200px] mx-auto">
                          {item.remarks || 'No remarks'}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceItemModal;
