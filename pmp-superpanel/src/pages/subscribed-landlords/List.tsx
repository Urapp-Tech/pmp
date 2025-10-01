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
import {
  ArrowUpDown,
  CircleCheck,
  CircleX,
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
// import userService from '@/services/adminapp/users';
import LandlordService from '@/services/adminapp/landlords';
// import contreactService from '@/services/adminapp/contracts';
import { getItem } from '@/utils/storage';
import { DropdownMenuCheckboxItem } from '@radix-ui/react-dropdown-menu';
// import CreateContractDialog from './CreateContractDialog';
// import OfficeUserUpdateDialog from './UpdateDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, handleErrorMessage } from '@/utils/helper';
// import { usePermission } from '@/utils/hasPermission';
import { ASSET_BASE_URL } from '@/utils/constants';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import { useForm } from 'react-hook-form';
import assets from '@/assets/images';
import dayjs from 'dayjs';
// import OfficeUserCreateDialog from './CreateDialog';

export type Users = {
  id: string; // UUID
  tenant: string; // UUID representing the tenant ID
  plan_name: any;
  holding_properties: any;
  currency: any;
  amount: number;
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
  status: any;
};

const SubLandlords = () => {
  const userDetails: any = getItem('USER');
  const { toast } = useToast();
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

  const onApproveSubmit = async (data: any) => {
    if (!data?.id) return;
    setMainIsLoader(true);
    try {
      const res = await subService.approve(data.id, userDetails?.id);

      // API returns the updated SubscribedLandlord record (no landlord_name), so preserve landlord_name
      const updated = res?.data;
      if (updated?.id) {
        setList((prev: any[]) =>
          prev.map((it) =>
            it.id === updated.id
              ? {
                  ...it,
                  ...updated,
                  landlord_name: it.landlord_name, // keep existing name for the row
                }
              : it
          )
        );
        setMainIsLoader(false);
        ToastHandler('Subscription approved successfully');
      } else {
        setMainIsLoader(false);
        ToastHandler('Approve succeeded but response was unexpected');
      }
      setEditOpen(false);
    } catch (e: any) {
      ToastHandler(
        e?.response?.data?.detail || 'Failed to approve subscription'
      );
    } finally {
      setMainIsLoader(false);
    }
  };

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
        setMainIsLoader(false);
        ToastHandler('Subscription rejected');
      } else {
        setMainIsLoader(false);
        ToastHandler('Reject succeeded but response was unexpected');
      }
      setDeleteOpen(false);
    } catch (e: any) {
      ToastHandler(
        e?.response?.data?.detail || 'Failed to reject subscription'
      );
    } finally {
      setMainIsLoader(false);
    }
  };

  const fetchUsers = async () => {
    setMainIsLoader(true);
    const constantPage = 1;
    setPage(constantPage);
    try {
      const deposits = await subService.list({
        search,
        page: constantPage,
        pageSize,
      });
      console.log('deposits: ', deposits);

      if (deposits.data.success) {
        setMainIsLoader(false);
        setList(deposits.data.items);
        setTotal(deposits.data.total);
      } else {
        setMainIsLoader(false);
        // console.log('error: ', deposits.data.message);
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
      const users = await subService.list({
        search,
        page: nextPage,
        pageSize,
      });
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
    if (type === 'accept') {
      onApproveSubmit({ id: actionId });
    }
    if (type === 'reject') {
      onRejectSubmit({ id: actionId, reason: 'rejected' });
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

  return (
    <div className="p-2 mt-5">
      {/* <TopBar title="Tenant Users" /> */}
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0 m-5">
        {/* admin content page height */}
        <div className="w-full">
          <div className="flex items-center py-4 justify-between">
            <h2 className="text-primary-bg font-semibold text-3xl leading-normal capitalize">
              SUBSCRIBED LANDLORDS
            </h2>
            <div className="flex gap-3 items-center">
              {/* <div className="w-[150px]">
                <SingleSelectDropDown
                  control={control}
                  name="userfilter"
                  label=""
                  items={[
                    { id: 'All', name: 'All' },
                    { id: 'User', name: 'User' },
                    { id: 'Manager', name: 'Manager' },
                    { id: 'Landlord', name: 'Landlord' },
                  ]}
                  placeholder="Choose an option"
                  mainClassName="custom-filter-select-field"
                />
              </div> */}
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
                {/* <Button
                  onClick={() => setIsOpen(true)}
                  className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded text-[12px] leading-[16px] font-semibold text-quinary-bg"
                  variant={'outline'}
                >
                  + Add New
                </Button> */}
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
    </div>
  );
};

export default SubLandlords;
