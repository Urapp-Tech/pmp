import * as React from 'react';
import { Eye, Plus, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import {  usePermission } from '@/utils/hasPermission';
import { PERMISSIONS } from '@/utils/constants';
import { InvoiceFields } from '@/interfaces/invoice.interface';


export const getInvoiceColumns = ({
  setSelectedInvoiceId,
  fetchInvoiceItems,
  setShowItemsModal,
  setShowCreateItemModal,
  setAmount,
  setSelectedInvoiceItemId,
  handleAction,
}: {
  setSelectedInvoiceId: (id: string) => void;
  fetchInvoiceItems: (id: string) => Promise<void>;
  setShowItemsModal: (val: boolean) => void;
  setShowCreateItemModal: (val: boolean) => void;
  setAmount: (val: number) => void;
  setSelectedInvoiceItemId: (val: string | null) => void;
  handleAction: (action: 'edit' | 'delete', invoice: InvoiceFields) => void;
}): ColumnDef<InvoiceFields>[] => [
  { accessorKey: 'invoice_no', header: 'Invoice' },
  { accessorKey: 'total_amount', header: 'Total' },
  { accessorKey: 'paid_amount', header: 'Paid' },
  { accessorKey: 'payment_date', header: 'Payment Date' },
  { accessorKey: 'due_date', header: 'Due' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'invoice_date', header: 'Invoice Date' },

  {
    id: 'Submitted',
    header: 'Payment',
    cell: ({ row }) => {
      const invoiceItems = row.original.invoice_items || [];
      const id = row.original.id;
      const hasPending = invoiceItems.some(item => item.status === 'pending');

      return (
        <div className="flex gap-2 items-center">
          <span className="bg-blue-500 text-center text-white w-[12px] h-[14px] rounded-full text-[8px] leading-normal font-semibold py-[1px]">
            {invoiceItems.length}
          </span>
          <Eye
            className="cursor-pointer text-blue-500 w-[20px] h-[20px]"
            onClick={async () => {
              setSelectedInvoiceId(id);
              await fetchInvoiceItems(id);
              setShowItemsModal(true);
            }}
          />
          {can(PERMISSIONS.INVOICE.UPDATE) && !hasPending && (
            <Plus
              className="cursor-pointer text-green-600 w-[20px] h-[20px]"
              onClick={() => {
                setSelectedInvoiceId(id);
                setAmount(row.original.total_amount);
                setSelectedInvoiceItemId(null);
                setShowCreateItemModal(true);
              }}
            />
          )}
        </div>
      );
    },
  },

  (can(PERMISSIONS.INVOICE.UPDATE) || can(PERMISSIONS.INVOICE.DELETE)) && {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const inv = row.original;

      return (
        <div className="flex gap-2">
          {can(PERMISSIONS.INVOICE.UPDATE) && (
            <Pencil
              className="cursor-pointer text-blue-500"
              onClick={() => handleAction('edit', inv)}
            />
          )}
          {can(PERMISSIONS.INVOICE.DELETE) && (
            <Trash2
              className="cursor-pointer text-red-500"
              onClick={() => handleAction('delete', inv)}
            />
          )}
        </div>
      );
    },
  },
].filter(Boolean as any); // to satisfy TS because of conditional column
