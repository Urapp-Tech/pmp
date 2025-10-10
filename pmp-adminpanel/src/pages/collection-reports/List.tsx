import { Button } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';

import service from '@/services/adminapp/collection-reports';
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
import { ArrowUpDown, Loader2, Paperclip } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
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
import { DropdownMenuCheckboxItem, Label } from '@radix-ui/react-dropdown-menu';
import AgreementDocsCell from './AgreementDocsCell';
import { ASSET_BASE_URL } from '@/utils/constants';

type Attachment = {
  url: string;
  mime?: string | null;
  name?: string | null;
  size?: number | null;
};

type CollectionRow = {
  invoice_id: string;
  invoice_no?: string | null;
  property_name?: string | null;
  unit_no?: string | null;
  tenant_name?: string | null;
  payment_date?: string | null; // ISO string (nullable)
  rent: number; // total_amount
  status: 'Pending' | 'Received';
  attachments: Attachment[];
};

type Totals = {
  total_collection: number;
  received_amount: number;
  pending_amount: number;
};

const fmtKwd = (n: number | null | undefined) =>
  typeof n === 'number' ? `${n.toLocaleString()} KWD` : '—';

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  try {
    // Let browser format; you can swap to date-fns if you prefer
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  } catch {
    return '—';
  }
};

const CollectionReports: React.FC = () => {
  const userDetails: any = getItem('USER');
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0); // total records
  const [totalPages, setTotalPages] = useState(0); // total pages
  const [list, setList] = useState<CollectionRow[]>([]);
  const [totals, setTotals] = useState<Totals>({
    total_collection: 0,
    received_amount: 0,
    pending_amount: 0,
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [mainIsLoader, setMainIsLoader] = useState(true);

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: '#5CB85C',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  const columns = useMemo<ColumnDef<CollectionRow>[]>(
    () => [
      {
        accessorKey: 'invoice_no',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            INVOICE #
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue('invoice_no') || '—'}</div>,
      },
      {
        accessorKey: 'property_name',
        header: 'PROPERTY',
        cell: ({ row }) => <div>{row.getValue('property_name') || '—'}</div>,
      },
      {
        accessorKey: 'unit_no',
        header: 'UNIT',
        cell: ({ row }) => <div>{row.getValue('unit_no') || '—'}</div>,
      },
      {
        accessorKey: 'tenant_name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            TENANT
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue('tenant_name') || '—'}</div>
        ),
      },
      {
        accessorKey: 'payment_date',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            PAYMENT DATE
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => <div>{fmtDate(row.original.payment_date)}</div>,
        sortingFn: (a, b, id) => {
          const av = a.original.payment_date
            ? new Date(a.original.payment_date).getTime()
            : 0;
          const bv = b.original.payment_date
            ? new Date(b.original.payment_date).getTime()
            : 0;
          return av === bv ? 0 : av < bv ? -1 : 1;
        },
      },
      {
        accessorKey: 'rent',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            RENT
            <ArrowUpDown />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{fmtKwd(row.original.rent)}</div>
        ),
        sortingFn: (a, b) => (a.original.rent ?? 0) - (b.original.rent ?? 0),
      },
      {
        accessorKey: 'status',
        header: 'STATUS',
        cell: ({ row }) => {
          const status = row.getValue<string>('status');
          const isReceived = status === 'Received';
          return (
            <div
              className={cn(
                'px-2 py-1 rounded text-center w-[90px] text-xs font-semibold',
                isReceived
                  ? 'bg-scrollbar text-primary-bg'
                  : 'bg-primary-bg text-white'
              )}
            >
              {status}
            </div>
          );
        },
      },
      {
        accessorKey: 'docs',
        header: 'AGREEMENT DOCS',
        cell: ({ row }) => {
          const { attachments } = row.original;
          return (
            <AgreementDocsCell
              value={attachments || []}
              assetBaseUrl={ASSET_BASE_URL}
              maxInline={3}
            />
          );
        },
      },
    ],
    []
  );

  const fetchCollections = async (opts?: { pageOverride?: number }) => {
    const landlord_id = userDetails?.landlordId;
    if (!landlord_id) {
      setMainIsLoader(false);
      ToastHandler('Missing landlord_id');
      return;
    }
    try {
      setMainIsLoader(true);
      const res = await service.list({
        landlord_id,
        q: search || undefined,
        page: opts?.pageOverride ?? page,
        pageSize,
      });
      const data = res?.data;
      if (data?.success) {
        setList(data.items || []);
        setTotal(data.total ?? 0); // total count
        setTotalPages(data.totalPages ?? 0); // total pages
        setTotals(
          data.totals || {
            total_collection: 0,
            received_amount: 0,
            pending_amount: 0,
          }
        );
      } else {
        ToastHandler(data?.message || 'Failed to load collections');
      }
    } catch (err) {
      console.error('collections error:', err);
      ToastHandler('Something went wrong');
    } finally {
      setMainIsLoader(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchCollections({ pageOverride: 1 });
    }
  };

  useEffect(() => {
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = async (newPageIndexZeroBased: number) => {
    const newPage = newPageIndexZeroBased + 1;
    setPage(newPage);
    await fetchCollections({ pageOverride: newPage });
  };

  const table = useReactTable({
    data: list || [],
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

  const cardBase =
    'rounded-2xl shadow-sm ring-1 ring-black/5 px-4 sm:px-5 h-46 sm:h-50';
  const cardLight = 'bg-secondary-bg';
  const cardDark = 'bg-secondary-bg';
  const labelCls =
    'text-base text-primary-bg flex pb-6 items-center font-semibold';

  return (
    <div className="p-2 mt-5">
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="w-full">
          {/* KPI Cards */}
          <div className="grid gap-10 2xl::grid-cols-4 sm:grid-cols-3 2xl:mt-[3%]">
            <div className={`${cardBase} ${cardLight}`}>
              <span className="!text-[32px] leading-none mt-[5%] 2xl:mt-[4%] block font-semibold text-primary-bg">
                {totals.total_collection ?? 0}
              </span>
              <Label className={labelCls}>TOTAL COLLECTIONS</Label>
            </div>

            <div className={`${cardBase} ${cardDark}`}>
              <div className="flex items-end justify-start">
                <span className="text-[32px] leading-none mt-[5%] 2xl:mt-[4%] block font-semibold text-primary-bg">
                  {fmtKwd(totals.received_amount)}
                </span>
              </div>
              <Label className={labelCls}>RECEIVED AMOUNT</Label>
            </div>

            <div className={`${cardBase} ${cardLight}`}>
              <div className="flex items-end justify-start">
                <span className="text-[32px] leading-none mt-[5%] 2xl:mt-[4%] block font-semibold text-primary-bg">
                  {fmtKwd(totals.pending_amount)}
                </span>
              </div>
              <Label className={labelCls}>PENDING AMOUNT</Label>
            </div>
          </div>

          {/* Header + search */}
          <div className="flex items-center py-4 justify-between">
            <h2 className="text-primary-bg font-semibold text-3xl leading-normal capitalize">
              COLLECTION REPORTS
            </h2>
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Search tenant..."
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKey}
                className="w-[461px] h-[35px] rounded-[23px] bg-mars-bg/50"
              />
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

          {/* Table */}
          <div className="rounded-md border">
            {mainIsLoader ? (
              <div className="flex justify-center items-center h-[60px]">
                <Loader2 className="animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
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

          {/* Pagination */}
          {list?.length ? (
            <div className="flex items-center justify-center space-x-2 pt-4">
              <div className="my-5 flex justify-center w-full">
                <Paginator
                  pageSize={pageSize}
                  currentPage={page - 1}
                  totalPages={totalPages} // <-- use backend totalPages
                  onPageChange={(pageNumber) => handlePageChange(pageNumber)}
                  showPreviousNext
                />
              </div>
            </div>
          ) : null}
        </div>
      </SidebarInset>
    </div>
  );
};

export default CollectionReports;
