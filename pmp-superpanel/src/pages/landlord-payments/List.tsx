import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';

import service from '@/services/adminapp/manual-payment';
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
import {
  ArrowUpDown,
  Loader2,
  // ChevronDown,
  MapPinHouse,
  Pencil,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
// import { Checkbox } from '@/components/ui/checkbox';
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
import userService from '@/services/adminapp/users';
import LandlordService from '@/services/adminapp/landlords';
import SuperUserService from '@/services/adminapp/superadmin';
// import contreactService from '@/services/adminapp/contracts';
import { getItem } from '@/utils/storage';
import { DropdownMenuCheckboxItem } from '@radix-ui/react-dropdown-menu';
// import CreateContractDialog from './CreateContractDialog';
// import OfficeUserUpdateDialog from './UpdateDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, handleErrorMessage } from '@/utils/helper';
// import { usePermission } from '@/utils/hasPermission';
import { ASSET_BASE_URL, PERMISSIONS } from '@/utils/constants';
import OfficeUserUpdateDialog from './UpdateDialog';
import OfficeUserCreateDialog from './CreateDialog';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import { useForm } from 'react-hook-form';
import assets from '@/assets/images';
import { usePermission } from '@/utils/hasPermission';
import dayjs from 'dayjs';
import AgreementDocsCell from './AgreementDocsCell';
// import OfficeUserCreateDialog from './CreateDialog';

export type Users = {
  id: string; // UUID
  tenant: string; // UUID representing the tenant ID
  fname: string;
  lname: string;
  username: string; // Email is being used as a username
  email: string; // Email address of the user
  password: string; // Encrypted password (bcrypt hash)
  phone: string; // Phone number of the user
  country: string | null; // Country information, nullable
  state: string | null; // State information, nullable
  city: string | null; // City information, nullable
  zipCode: string | null; // Zip code, nullable
  role: string | null; // User role, nullable
  profilePic: string | null; // Avatar URL or path, nullable
  address: string; // Address of the user
  userType: 'USER' | 'ADMIN'; // Enum type to restrict values
  isActive: boolean; // Active status of the user
  isDeleted: boolean; // Soft delete status
  createdAt: string; // ISO date string for creation timestamp
  updatedAt: string; // ISO date string for update timestamp
  status: 'Active' | 'InActive';
  docs?: any;
};

const LandlordPayments = () => {
  const userDetails: any = getItem('USER');
  const { toast } = useToast();
  const { can } = usePermission();
  // const { can } = usePermission();

  const form = useForm<any>({ defaultValues: { userfilter: 'All' } });
  const { control, watch } = form;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = React.useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<any>([]);
  const [editFormData, setEditFormData] = useState<any>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [isLoader, setIsLoader] = useState(false);
  const [mainIsLoader, setMainIsLoader] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [fromDate, setFromDate] = useState(
    dayjs().subtract(6, 'month').format('YYYY-MM-DD')
  );
  const [toDate, setToDate] = useState(
    dayjs().add(6, 'month').format('YYYY-MM-DD')
  );

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: '#5CB85C',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  const columns: ColumnDef<Users>[] = [
    {
      accessorKey: 'invoice_no',
      header: 'INVOICE NO.',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="capitalize">{row.getValue('invoice_no')}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'landlord_name',
      header: 'LANDLORD NAME',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('landlord_name')}</div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'AMOUNT',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('amount')}</div>
      ),
    },
    {
      accessorKey: 'method',
      header: 'METHOD',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('method')}</div>
      ),
    },
    {
      accessorKey: 'docs',
      header: 'AGREEMENT DOCS',
      cell: ({ row }) => {
        const { docs } = row.original;
        return (
          <AgreementDocsCell
            value={docs?.attachments || []}
            assetBaseUrl={ASSET_BASE_URL}
            maxInline={3} // tweak if you want 2 or 4
          />
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'DATE',
      cell: ({ row }) => (
        <div className="capitalize">
          {dayjs(row.getValue('created_at')).format('DD-MM-YYYY')}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'ACTIONS',
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <div className="flex justify-start items-center">
            {can(PERMISSIONS.LANDLORD_PAYMENT.UPDATE) && (
              <div className="pl-4">
                <img
                  onClick={() => handleActionMenu('edit', id)}
                  src={assets.images.editPencil}
                  className="text-primary-bg cursor-pointer h-8 w-8"
                />
              </div>
            )}
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
      const users = await service.list({
        q: search,
        constantPage,
        pageSize,
        dateFrom: fromDate,
        dateTo: toDate,
        role: 'superadmin',
        actor_id: userDetails?.id,
      });
      if (users.data.success) {
        setMainIsLoader(false);
        setList(users.data.items);
        setTotal(users.data.total);
      } else {
        setMainIsLoader(false);
        // console.log('error: ', users.data.message);
      }
    } catch (error: Error | unknown) {
      setMainIsLoader(false);
      // console.log('error: ', error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [watch('userfilter')]);

  const handlePageChange = async (newPage: any) => {
    setMainIsLoader(true);
    const nextPage = newPage + 1;
    table.setPageIndex(nextPage);
    try {
      const users = await userService.tenantUserList(
        search,
        nextPage,
        pageSize,
        watch('userfilter')
      );
      if (users.data.success) {
        setPage(nextPage);
        setList(users.data.items);
        setTotal(users.data.total);
        setMainIsLoader(false);
      } else {
        setMainIsLoader(false);
        ToastHandler(users.data.message);
        // console.log('error: ', users.data.message);
      }
    } catch (error: Error | unknown) {
      setMainIsLoader(false);
      // console.log('error: ', error);
    }
  };

  const handleActionMenu = (type: string, actionId: string) => {
    if (type === 'edit') {
      const editData = list.find((item: any) => item.id === actionId);
      setEditFormData(editData);
      setEditOpen(true);
    }
    if (type === 'delete') {
      const editData = list.find((item: any) => item.id === actionId);
      setEditFormData(editData);
      setDeleteOpen(true);
    }
  };

  const createHandler = (data: any) => {
    setIsLoader(true);
    const actors = {
      id: userDetails?.id,
      role: 'superadmin',
    };
    service
      .create(actors, data)
      .then((item: any) => {
        if (item.data.success) {
          setIsOpen(false);
          setIsLoader(false);
          setList([item.data.items, ...list]);
          let newtotal = total;
          setTotal((newtotal += 1));
          ToastHandler(item.data.msg);
        } else {
          setIsLoader(false);
          ToastHandler(item.data.msg);
        }
      })
      .catch((err: Error | any) => {
        const error = handleErrorMessage(err);
        ToastHandler(error);
        setIsLoader(false);
      });
  };

  const updateEmployeeHandler = (id: any, data: any) => {
    console.log('id', id, data);
    setIsLoader(true);
    service
      .update(id, data)
      .then((updateItem: any) => {
        if (updateItem.data.success) {
          setEditOpen(false);
          setIsLoader(false);
          setList((newArr: any) => {
            return newArr.map((item: any) => {
              if (item.id === updateItem.data.items.id) {
                item.invoice_no = updateItem.data.items.invoice_no;
                item.amount = updateItem.data.items.amount;
                item.deposit_date = updateItem.data.items.deposit_date;
                item.deposit_reference =
                  updateItem.data.items.deposit_reference;
                item.landlord_name = updateItem.data.items.landlord_name;
                item.method = updateItem.data.items.method;
                item.notes = updateItem.data.items.notes;
                item.docs = updateItem.data.items.docs;
              }
              return { ...item };
            });
          });
          ToastHandler(updateItem.data.msg);
        }
      })
      .catch((err: Error | any) => {
        const error = handleErrorMessage(err);
        ToastHandler(error);
        setIsLoader(false);
      });
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

  return (
    <div className="p-2 mt-5">
      {/* <TopBar title="Tenant Users" /> */}
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0 m-5">
        {/* admin content page height */}
        <div className="w-full">
          <div className="flex items-center py-4 justify-between">
            <h2 className="text-primary-bg font-semibold text-3xl leading-normal capitalize">
              LANDLORD PAYMENTS
            </h2>
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-[200px]">
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="
      w-full border-primary-bg pr-10
      appearance-none
      focus-visible:ring-0
      [&::-webkit-calendar-picker-indicator]:opacity-0
      [&::-webkit-clear-button]:hidden
      [&::-ms-reveal]:hidden
      [&::-ms-clear]:hidden
    "
                    placeholder="From date"
                  />
                  <button
                    type="button"
                    aria-label="Open date picker"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                    onClick={() => {
                      const el = document.getElementById(
                        'fromDate'
                      ) as HTMLInputElement | null;
                      // @ts-ignore - not in all TS libs
                      if (el && typeof el.showPicker === 'function')
                        el.showPicker();
                      else el?.focus();
                    }}
                  >
                    <img
                      src={assets.images.calender}
                      alt="Calendar"
                      className="h-4 w-4 pointer-events-none"
                    />
                  </button>
                </div>

                {/* To date */}
                <div className="relative w-[200px]">
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="
      w-full border-primary-bg pr-10
      appearance-none
      focus-visible:ring-0
      [&::-webkit-calendar-picker-indicator]:opacity-0
      [&::-webkit-clear-button]:hidden
      [&::-ms-reveal]:hidden
      [&::-ms-clear]:hidden
    "
                    placeholder="To date"
                  />
                  <button
                    type="button"
                    aria-label="Open date picker"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                    onClick={() => {
                      const el = document.getElementById(
                        'toDate'
                      ) as HTMLInputElement | null;
                      // @ts-ignore
                      if (el && typeof el.showPicker === 'function')
                        el.showPicker();
                      else el?.focus();
                    }}
                  >
                    <img
                      src={assets.images.calender}
                      alt="Calendar"
                      className="h-4 w-4 pointer-events-none"
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center w-[261px]">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-[461px] h-[38px] rounded bg-mars-bg/50"
                />
              </div>
              <DropdownMenu>
                {can(PERMISSIONS.LANDLORD_PAYMENT.CREATE) && (
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded text-[12px] leading-[16px] font-semibold text-quinary-bg"
                    variant={'outline'}
                  >
                    + Add New
                  </Button>
                )}
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
              <div className="flex-1 text-sm text-muted-foreground">
                {/* {total} total - Page {page + 1} of {Math.ceil(total / pageSize)} */}
              </div>
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
      {isOpen && (
        <OfficeUserCreateDialog
          isLoader={isLoader}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          callback={createHandler}
        />
      )}
      {editOpen && (
        <OfficeUserUpdateDialog
          isLoader={isLoader}
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          formData={editFormData}
          callback={updateEmployeeHandler}
        />
      )}
    </div>
  );
};

export default LandlordPayments;
