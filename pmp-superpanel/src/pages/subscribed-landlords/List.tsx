import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';

import subService from '@/services/adminapp/subs-landlords';
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
import { CircleCheck, CircleX, Loader2, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import DeleteDialog from '@/components/DeletePopup';
import { Paginator } from '@/components/Paginator';
import {
  DropdownMenu,
  DropdownMenuContent,
} from '@/components/ui/dropdown-menu';
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
import { getItem } from '@/utils/storage';
import { DropdownMenuCheckboxItem } from '@radix-ui/react-dropdown-menu';
import dayjs from 'dayjs';
import assets from '@/assets/images';

// Dialog imports
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export type Users = {
  id: string;
  plan_name: any;
  holding_properties: any;
  status: any;
  created_at: string;
  expiration_date: string;
  landlord_name?: string;
  total_amount?: string; // "40.000"
  discounted_amount?: string; // "0.000"
  due_amount?: string; // "40.000"
};

const SubLandlords = () => {
  const userDetails: any = getItem('USER');
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = React.useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<any>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [mainIsLoader, setMainIsLoader] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Approve → Discount dialog state
  const [discountOpen, setDiscountOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Users | null>(null);
  const [discount, setDiscount] = useState<string>('0');

  const ToastHandler = (text: string, success = true) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: success ? '#5CB85C' : '#DC3545',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  const columns: ColumnDef<Users>[] = [
    {
      accessorKey: 'landlord_name',
      header: 'LANDLORD NAME',
      cell: ({ row }) => (
        <div className={`capitalize`}>{row.getValue('landlord_name')}</div>
      ),
    },
    {
      accessorKey: 'plan_name',
      header: 'SUBSCRIBED PLAN',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="capitalize">{row.getValue('plan_name')}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'holding_properties',
      header: 'HOLDING PROPERTIES',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="capitalize">
              {row.getValue('holding_properties')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'TOTAL AMOUNT',
      cell: ({ row }) => {
        // values often come as strings like "40.000" — normalize to numbers
        const toNum = (v: any) => {
          if (v === null || v === undefined) return 0;
          const n = Number(String(v).replace(/,/g, ''));
          return Number.isFinite(n) ? n : 0;
        };

        const total = toNum(row.original.total_amount);
        const discount = Math.max(0, toNum(row.original.discounted_amount));
        const dueAmount = toNum(row.original.due_amount);

        // prefer due_amount if present, else compute (total - discount)
        const finalAmount =
          dueAmount > 0 ? dueAmount : Math.max(0, total - discount);

        if (discount > 0) {
          return (
            <div className="flex flex-col leading-tight">
              <span className="line-through text-muted-foreground">
                {total.toFixed(3)}
              </span>
              <span className="text-primary-bg font-semibold">
                {finalAmount.toFixed(3)}
              </span>
              <span className="text-xs text-foreground/60">
                Disc {discount.toFixed(3)}
              </span>
            </div>
          );
        }

        return <div className="font-medium">{total.toFixed(3)}</div>;
      },
    },
    {
      accessorKey: 'due_amount',
      header: 'DUE AMOUNT',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="capitalize">{row.getValue('due_amount')}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue('status')}</div>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'SUBSCRIPTION DATE',
      cell: ({ row }) => (
        <div className="capitalize">
          {dayjs(row.getValue('created_at')).format('DD-MM-YYYY')}
        </div>
      ),
    },
    {
      accessorKey: 'expiration_date',
      header: 'EXPERIRED DATE',
      cell: ({ row }) => {
        return (
          <div className="capitalize">
            {dayjs(row.getValue('expiration_date')).format('DD-MM-YYYY')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      cell: ({ row }) => {
        const { id, status } = row.original;

        return (
          <div className="flex justify-start items-center">
            <div className="flex gap-4">
              {status === 'pending' ? (
                <>
                  <CircleCheck
                    className="text-primary-bg cursor-pointer"
                    size={25}
                    onClick={() => handleActionMenu('accept', id)}
                  />
                  <CircleX
                    className="text-primary-bg cursor-pointer"
                    size={25}
                    onClick={() => handleActionMenu('reject', id)}
                  />
                </>
              ) : (
                <img
                  onClick={() => handleActionMenu('edit', id)}
                  src={assets.images.editPencil}
                  className="text-primary-bg cursor-pointer h-8 w-8"
                />
              )}
            </div>
          </div>
        );
      },
    },
  ];

  const fetchUsers = async () => {
    setMainIsLoader(true);
    const constantPage = 1;
    setPage(constantPage);
    try {
      const res = await subService.list({
        search,
        page: constantPage,
        pageSize,
      });

      if (res.data.success) {
        setList(res.data.items);
        setTotal(res.data.total);
      } else {
        ToastHandler(res.data.message, false);
      }
    } catch (error: any) {
      ToastHandler(error?.message || 'Failed to load records', false);
    } finally {
      setMainIsLoader(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchUsers();
    }
  };

  const handlePageChange = async (newPage: any) => {
    setMainIsLoader(true);
    const nextPage = newPage + 1;
    try {
      const res = await subService.list({
        search,
        page: nextPage,
        pageSize,
      });
      if (res.data.success) {
        setPage(nextPage);
        setList(res.data.items);
        setTotal(res.data.total);
      } else {
        ToastHandler(res.data.message, false);
      }
    } catch (error: any) {
      ToastHandler(error?.message || 'Failed to load page', false);
    } finally {
      setMainIsLoader(false);
    }
  };

  // ---------- Approve -> then show Discount Dialog ----------
  const onApproveSubmit = async (data: any) => {
    if (!data?.id) return;
    setMainIsLoader(true);
    try {
      const res = await subService.approve(data.id, userDetails?.id);
      const updated = res?.data;

      if (updated?.id) {
        // Merge row in table (preserve landlord_name)
        setList((prev: any[]) =>
          prev.map((it) =>
            it.id === updated.id
              ? {
                  ...it,
                  ...updated,
                  landlord_name: it.landlord_name,
                }
              : it
          )
        );

        // After approve → open discount dialog (pre-fill amounts)
        const merged = {
          ...list.find((i: any) => i.id === data.id),
          ...updated,
        } as Users;

        setSelectedRow(merged);
        // prefill discount with existing discounted_amount or '0'
        setDiscount(
          (merged?.discounted_amount && `${merged.discounted_amount}`) || '0'
        );
        setDiscountOpen(true);

        ToastHandler('Subscription approved successfully');
      } else {
        ToastHandler('Approve succeeded but response was unexpected', false);
      }
    } catch (e: any) {
      ToastHandler(
        e?.response?.data?.detail || 'Failed to approve subscription',
        false
      );
    } finally {
      setMainIsLoader(false);
    }
  };

  // ---------- Reject ----------
  const onRejectSubmit = async (data?: any) => {
    if (!data?.id) return;
    setMainIsLoader(true);
    try {
      const res = await subService.reject(
        data.id,
        { reason: data.reason ?? null },
        userDetails?.id
      );

      const updated = res?.data;
      if (updated?.id) {
        setList((prev: any[]) =>
          prev.map((it) =>
            it.id === updated.id
              ? {
                  ...it,
                  ...updated,
                  landlord_name: it.landlord_name,
                }
              : it
          )
        );
        ToastHandler('Subscription rejected');
      } else {
        ToastHandler('Reject succeeded but response was unexpected', false);
      }
    } catch (e: any) {
      ToastHandler(
        e?.response?.data?.detail || 'Failed to reject subscription',
        false
      );
    } finally {
      setMainIsLoader(false);
    }
  };

  // ---------- Discount dialog: Update discounted_amount only ----------
  const onUpdateSubmit = async () => {
    if (!selectedRow?.id) {
      setDiscountOpen(false);
      return;
    }

    const total = parseFloat(String(selectedRow.total_amount || '0')) || 0;
    let disc = parseFloat(String(discount || '0'));
    if (isNaN(disc) || disc < 0) disc = 0;
    if (disc > total) disc = total; // clamp

    setMainIsLoader(true);
    try {
      const res = await subService.update(selectedRow.id, userDetails?.id, {
        discounted_amount: disc,
      });

      const updated = res?.data;
      if (updated?.id) {
        setList((prev: any[]) =>
          prev.map((it) =>
            it.id === updated.id
              ? {
                  ...it,
                  ...updated,
                  landlord_name: it.landlord_name || it.landlord_name,
                }
              : it
          )
        );
        ToastHandler('Discount updated');
        setDiscountOpen(false);
        setSelectedRow(null);
      } else {
        ToastHandler('Update succeeded but response was unexpected', false);
      }
    } catch (e: any) {
      ToastHandler(
        e?.response?.data?.detail || 'Failed to update discount',
        false
      );
    } finally {
      setMainIsLoader(false);
    }
  };

  const handleActionMenu = (type: string, actionId: string) => {
    if (type === 'accept') {
      onApproveSubmit({ id: actionId });
    }
    if (type === 'reject') {
      onRejectSubmit({ id: actionId, reason: 'rejected' });
    }
    if (type === 'edit') {
      // Optional: open the discount dialog for edits on already-approved rows
      const row = list.find((i: any) => i.id === actionId);
      if (row) {
        setSelectedRow(row);
        setDiscount(
          (row.discounted_amount && `${row.discounted_amount}`) || '0'
        );
        setDiscountOpen(true);
      }
    }
  };

  const table = useReactTable({
    data: list ? list : [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Live computed totals for dialog
  const dialogTotals = useMemo(() => {
    const total = parseFloat(String(selectedRow?.total_amount || '0')) || 0;
    let disc = parseFloat(String(discount || '0'));
    if (isNaN(disc) || disc < 0) disc = 0;
    if (disc > total) disc = total;
    const grand = total - disc;
    return {
      total,
      discount: disc,
      grand,
    };
  }, [discount, selectedRow?.total_amount]);

  return (
    <div className="p-2 mt-5">
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0 m-5">
        <div className="w-full">
          <div className="flex items-center py-4 justify-between">
            <h2 className="text-primary-bg font-semibold text-3xl leading-normal capitalize">
              SUBSCRIBED LANDLORDS
            </h2>
            <div className="flex gap-3 items-center">
              <div className="flex items-center w-[461px]">
                <Input
                  placeholder="Search landlords..."
                  value={search}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-[461px] h-[35px] rounded bg-mars-bg/50"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="rounded-md border">
            {mainIsLoader ? (
              <div className="flex justify-center items-center h-[50px]">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
          {list?.length ? (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <div className="my-5 flex justify-center w-full">
                <Paginator
                  pageSize={pageSize}
                  currentPage={page - 1}
                  totalPages={total}
                  onPageChange={(pageNumber) => handlePageChange(pageNumber)}
                  showPreviousNext
                />
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </SidebarInset>

      {/* -------- Discount Dialog (open right after approve) -------- */}
      <Dialog open={discountOpen} onOpenChange={setDiscountOpen}>
        <DialogContent
          className="sm:max-w-[600px] !bg-transparent [&>button]:hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-0 w-full rounded-t-3xl">
            <div className="h-16 rounded-t-3xl relative flex items-center justify-center">
              <DialogTitle className="text-primary-bg mt-2 text-4xl font-extrabold tracking-wide">
                Apply Discount
              </DialogTitle>

              {/* custom close */}
              <button
                type="button"
                onClick={() => setDiscountOpen(false)}
                className="absolute right-2 top-6 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-primary-bg text-white shadow-md hover:opacity-90"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="bg-white rounded-b-3xl px-6 pb-6 pt-5">
            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Landlord</Label>
                <div className="mt-1 text-[14px]">
                  {selectedRow?.landlord_name || '—'}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <div className="mt-1 text-[14px] capitalize">
                    {selectedRow?.plan_name || '—'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <div className="mt-1 text-[14px]">
                    {dialogTotals.total.toFixed(3)} KWD
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Discount</Label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="mt-2 text-[13px]"
                    placeholder="0.000"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Grand Total</Label>
                  <div className="mt-1 text-[16px] font-semibold text-primary-bg">
                    {dialogTotals.grand.toFixed(3)} KWD
                  </div>
                </div>
                <div />
                <div className="flex items-end justify-end">
                  <Button className="bg-primary-bg" onClick={onUpdateSubmit}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubLandlords;
