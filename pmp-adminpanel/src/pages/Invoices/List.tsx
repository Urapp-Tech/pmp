import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Loader2, Pencil, Trash2,Plus,Eye  } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import DeleteDialog from '@/components/DeletePopup';
import { Paginator } from '@/components/Paginator';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import invoiceService from '@/services/adminapp/invoice';
import InvoiceCreateDialog from './CreateDialog';
import InvoiceUpdateDialog from './UpdateDialog';
import InvoiceItemModal from './InvoiceItemModal';
import { InvoiceFields } from '@/interfaces/invoice.interface';
import InvoiceItemActionDialog from './InvoiceItemActionDialog';

import {  usePermission } from '@/utils/hasPermission';
import { PERMISSIONS } from '@/utils/constants';
import InvoiceItemCreateDialog from './InvoiceItemCreateDialog';

const Invoices = () => {
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [list, setList] = useState<InvoiceFields[]>([]);
  const [editFormData, setEditFormData] = useState<InvoiceFields | null>(null);
const [showItemsModal, setShowItemsModal] = useState(false);
const [actionDialogOpen, setActionDialogOpen] = useState(false);
const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
const [selectedItem, setSelectedItem] = useState(null);
const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
const [amount, setAmount] = useState(0);
const [selectedInvoiceItemId, setSelectedInvoiceItemId] = useState(0);
 const [editDialogOpen, setEditDialogOpen] = useState(false);
const { can } = usePermission();
  const [isLoader, setIsLoader] = useState(false);
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
const [invoiceItemTotal, setInvoiceItemTotal] = useState(0);
const [invoiceItemPage, setInvoiceItemPage] = useState(1);
const [invoiceItemSize] = useState(5); // same as ITEMS_PER_PAGE
const [showCreateItemModal, setShowCreateItemModal] = useState(false);
const fetchInvoiceItems = async (invoiceId: string, page = 1) => {
try {
    const res = await invoiceService.getInvoiceItems(invoiceId, page, invoiceItemSize);
    if (res?.data?.success) {
      setInvoiceItems(res.data.items);
      setInvoiceItemTotal(res.data.total);
      setInvoiceItemPage(res.data.page);
    }
  } catch (error) {
    console.error('Failed to fetch invoice items:', error);
  }
};

const refreshData = () => {
  if (selectedInvoiceId) {
    fetchInvoiceItems(selectedInvoiceId, invoiceItemPage); // add current page
  }
};
  const ToastHandler = (msg: string) =>
    toast({ description: msg, className: cn('top-0 right-0 fixed z-[9999]'), style: { backgroundColor: '#FF5733', color: 'white' } });

  // 🔃 Fetch list with filters & pagination
  const fetchList = async (keySearch = search, pageNo = page) => {
    setMainIsLoader(true);
    try {
      const resp = await invoiceService.list(keySearch, pageNo, pageSize);
      if (resp.data.success) {
        setList(resp.data.items);
        setTotal(resp.data.total);
      } else ToastHandler(resp.data.message);
    } catch (err) {
      console.error(err);
      ToastHandler('Failed to fetch invoices');
    } finally {
      setMainIsLoader(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
     fetchList(search, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchList(search, newPage);
  };

  const handleAction = (type: 'edit' | 'delete', inv: InvoiceFields) => {
    setEditFormData(inv);
    type === 'edit' ? setEditOpen(true) : setDeleteOpen(true);
  };

  const createHandler = async (data: InvoiceFields) => {
    // data.landlord_id =  userDetails?.landlordId;
    setIsLoader(true);
    const resp = await invoiceService.create(data);
    setIsLoader(false);
    if (resp.data.success) {
      setCreateOpen(false);
      fetchList();
    } else ToastHandler(resp.data.message);
  };

  const updateHandler = async (data: InvoiceFields) => {
    setIsLoader(true);
    const resp = await invoiceService.update(data.id!, data);
    setIsLoader(false);
    if (resp.data.success) {
      setEditOpen(false);
      fetchList();
    } else ToastHandler(resp.data.message);
  };

  const deleteHandler = async () => {
    if (!editFormData) return;
    setIsLoader(true);
    const resp = await invoiceService.deleteMethod(editFormData.id!);
    setIsLoader(false);
    if (resp.data.success) {
      setDeleteOpen(false);
      fetchList();
    } else ToastHandler(resp.data.message);
  };

const columns = React.useMemo<ColumnDef<InvoiceFields>[]>(() => [
  { accessorKey: 'invoice_no', header: 'Invoice' },
  { accessorKey: 'total_amount', header: 'Total' },
  { accessorKey: 'paid_amount', header: 'Paid' },
  { accessorKey: 'payment_date', header: 'Payment Date' },
  { accessorKey: 'due_date', header: 'Due' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'invoice_date', header: 'Invoice Date' },

  // 🧾 Payment Items Cell
  {
    id: 'Submitted',
    header: 'Payment',
    cell: ({ row }) => {
      const invoiceItems = row.original.invoice_items || [];
      const id = row.original.id;
      const hasPending = invoiceItems.some(item => item.status === 'pending');
      return (
        <div className="flex gap-2 items-center">
          {/* Count Badge */}
          <span className="bg-blue-500 text-center text-white w-[12px] h-[14px] rounded-full text-[8px] leading-normal font-semibold py-[1px]">
            {invoiceItems.length}
          </span>

          {/* View Icon */}
          <Eye
            className="cursor-pointer text-blue-500 w-[20px] h-[20px]"
            onClick={async () => {
              setSelectedInvoiceId(id);
              await fetchInvoiceItems(id);
              setShowItemsModal(true);
            }}
          />

          {/* Add Icon (if permission allowed) */}
          {can(PERMISSIONS.INVOICE.UPDATE) && !hasPending  && (
            <Plus
              className="cursor-pointer text-green-600 w-[20px] h-[20px]"
              onClick={() => {
    setSelectedInvoiceId(id);
    setAmount(row.original.total_amount);
    setSelectedInvoiceItemId(null); // null for new item
    setShowCreateItemModal(true); // ✅ Correct modal trigger
  }}
            />
          )}
        </div>
      );
    },
  },

  // ✏️🗑️ Actions Column (Edit/Delete)
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
].filter(Boolean), []);



  const table = useReactTable({
    data: list,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-5">
      <TopBar title="Invoices" />
      <SidebarInset className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyUp={handleSearch}
              className="w-[300px]"
            />
            {/* <Button onClick={() => fetchList(search,0)}>🔍</Button> */}
          </div>
          <Button onClick={() => setCreateOpen(true)}>+ Add Invoice</Button>
        </div>
        <div className="overflow-x-auto border rounded">
          {mainIsLoader ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(hg => (
                  <TableRow key={hg.id}>
                    {hg.headers.map(h => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : (
                          <div className="flex items-center">
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {h.column.getCanSort() && (
                              <ArrowUpDown className="ml-1 h-4 w-4" />
                            )}
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-10">
                      No invoices found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        <Paginator pageSize={pageSize} currentPage={page} totalPages={Math.ceil(total / pageSize)} onPageChange={handlePageChange} showPreviousNext />
      </SidebarInset>

      {/* Dialogs */}
      <InvoiceCreateDialog
        isLoader={isLoader}
        isOpen={createOpen}
        setIsOpen={setCreateOpen}
        callback={createHandler}
      />
      {editFormData && (
        <InvoiceUpdateDialog
          isLoader={isLoader}
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          formData={editFormData}
          callback={updateHandler}
        />
      )}
      <InvoiceItemCreateDialog
  isOpen={showCreateItemModal}
    setIsOpen={setShowCreateItemModal}
    invoiceId={selectedInvoiceId}
    invoiceItemId={selectedInvoiceItemId ?? undefined}
  amount={amount}
  onComplete={async () => {
    if (selectedInvoiceId) {
      await fetchInvoiceItems(selectedInvoiceId);
    }
  }}
  
/>
<InvoiceItemModal
  invoiceId={selectedInvoiceId}
  setSelectedInvoiceItemId={setSelectedInvoiceItemId}
  setShowCreateItemModal={setShowCreateItemModal}
  setActionType={setActionType}
  setSelectedItem={setSelectedItem}
  setActionDialogOpen={setActionDialogOpen}
  isOpen={showItemsModal}
  setIsOpen={setShowItemsModal}

/>

<InvoiceItemActionDialog
  isOpen={actionDialogOpen}
  setIsOpen={setActionDialogOpen}
  actionType={actionType}
  item={selectedItem}
  onAction={async (id, remarks, action) => {
  try {
    const res = await invoiceService.approveRejectInvoiceItem(id, action, {
      remarks,
    });

    if (res?.data?.success) {
      ToastHandler(`${action.toUpperCase()} successful`);
      refreshData();
      setShowItemsModal(false); // ✅ Close only on success
    } else {
      ToastHandler(res.data.message || 'Failed to update status');
    }
  } catch (err) {
    ToastHandler('Action failed');
  }
}}
/>

      {editFormData && (
        <DeleteDialog
          isLoader={isLoader}
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title="Invoice"
          formData={editFormData}
          callback={deleteHandler}
        />
      )}
    </div>
  );
};

export default Invoices;
