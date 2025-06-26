import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';

import usersService from '@/services/adminapp/users';
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
import contreactService from '@/services/adminapp/contracts';
import { getItem } from '@/utils/storage';
import { DropdownMenuCheckboxItem } from '@radix-ui/react-dropdown-menu';
import CreateContractDialog from './CreateContractDialog';
import OfficeUserUpdateDialog from './UpdateDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, handleErrorMessage } from '@/utils/helper';
import { usePermission } from '@/utils/hasPermission';
import { ASSET_BASE_URL, PERMISSIONS } from '@/utils/constants';
import OfficeUserCreateDialog from './CreateDialog';

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
};

const TenantUsers = () => {
  const userDetails: any = getItem('USER');
  const { toast } = useToast();
  const { can } = usePermission();

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
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);

  const ToastHandler = (text: string) => {
    return toast({
      description: text,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: '#FF5733',
        color: 'white',
        zIndex: 9999,
      },
    });
  };

  const columns: ColumnDef<Users>[] = [
    {
      accessorKey: 'fname',
      header: 'Name',
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`${ASSET_BASE_URL}${row.original.profilePic}` || ''}
                alt={row.getValue('fname') || '@fallback'}
              />
              <AvatarFallback>
                {getInitials(row.getValue('fname'))}
              </AvatarFallback>
            </Avatar>
            <div className="capitalize font-semibold">
              {row.getValue('fname')} {row.original?.lname}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('phone')}</div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <div className="capitalize bg-neptune-bg/30 text-center w-[50px] h-[22px] rounded-[30px] text-[10px] leading-normal font-semibold text-saturn-bg py-[1px] border-neptune-bg border-2">
          {row.getValue('isActive') ? 'Active' : 'In-Active'}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        // const payment = row.original;
        const { id } = row.original;
        return (
          <div className="flex justify-center items-center">
            {can(PERMISSIONS.USER.UPDATE) && (
              <div>
                <MapPinHouse
                  className="text-lunar-bg cursor-pointer"
                  onClick={() => handleActionMenu('contract', id)}
                  size={20}
                />
              </div>
            )}
            {can(PERMISSIONS.USER.UPDATE) && (
              <div className="pl-3">
                <Pencil
                  className="text-lunar-bg cursor-pointer"
                  onClick={() => handleActionMenu('edit', id)}
                  size={20}
                />
              </div>
            )}
            {can(PERMISSIONS.USER.DELETE) && (
              <div className="pl-3">
                <Trash2
                  className="text-lunar-bg cursor-pointer"
                  size={20}
                  onClick={() => handleActionMenu('delete', id)}
                />
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const handleActionMenu = (type: string, actionId: string) => {
    if (type === 'contract') {
      const editData = list.find((item: any) => item.id === actionId);
      setEditFormData(editData);
      setContractOpen(true);
    }
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

  const fetchUsers = async () => {
    try {
      const users = await usersService.userslist(
        userDetails?.landlordId,
        search,
        page,
        pageSize
      );
      if (users.data.success) {
        setMainIsLoader(false);
        setList(users.data.items);
        setTotal(users.data.total);
      } else {
        setMainIsLoader(false);
        console.log('error: ', users.data.message);
      }
    } catch (error: Error | unknown) {
      setMainIsLoader(false);
      console.log('error: ', error);
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
  }, []);

  const deleteUserHandler = (data: any) => {
    const userId = data.id;
    setIsLoader(true);
    userService
      .deleteUser(userId)
      .then((updateItem) => {
        if (updateItem.data.success) {
          setDeleteOpen(false);
          setIsLoader(false);
          setList((newArr: any) => {
            return newArr.filter((item: any) => item.id !== userId);
          });
          let newtotal = total;
          setTotal((newtotal -= 1));
          toast({
            description: updateItem.data.message,
            className: cn(
              'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
            ),
            style: {
              backgroundColor: '#FF5733',
              color: 'white',
            },
          });
        } else {
          setIsLoader(false);
        }
      })
      .catch((err: Error) => {
        console.log('error: ', err);
        setIsLoader(false);
      });
  };

  const handlePageChange = async (newPage: any) => {
    table.setPageIndex(newPage);
    try {
      const users = await userService.userslist(
        userDetails?.landlordId,
        search,
        newPage,
        pageSize
      );
      if (users.data.success) {
        setPage(newPage);
        setList(users.data.items);
        setTotal(users.data.total);
      } else {
        ToastHandler(users.data.message);
        console.log('error: ', users.data.message);
      }
    } catch (error: Error | unknown) {
      console.log('error: ', error);
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

  const createEmployeeHandler = (data: any) => {
    console.log('dadad', data);

    setIsLoader(true);
    const formData = new FormData();
    formData.append('fname', data.fname);
    formData.append('lname', data.lname);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('gender', data.gender);
    formData.append('password', data.password);
    formData.append('roleType', 'User');
    formData.append('landlordId', userDetails?.landlordId);
    if (data.profilePic) formData.append('profilePic', data.profilePic);
    userService
      .create(formData)
      .then((item) => {
        if (item.data.success) {
          setIsOpen(false);
          setIsLoader(false);
          setList([item.data.items, ...list]);
          let newtotal = total;
          setTotal((newtotal += 1));
        } else {
          setIsLoader(false);
          ToastHandler(item.data.message);
        }
      })
      .catch((err: Error | any) => {
        console.log('error: ', err);
        ToastHandler(err?.response?.data?.detail[0]?.msg);
        setIsLoader(false);
      });
  };

  const updateEmployeeHandler = (data: any) => {
    const formData = new FormData();
    formData.append('fname', data.fname);
    formData.append('lname', data.lname);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('gender', data.gender);
    formData.append('password', data.password);
    formData.append('roleType', data.roleType);
    formData.append('landlordId', userDetails?.landlordId);
    if (data.profilePic) formData.append('profilePic', data.profilePic);
    setIsLoader(true);
    userService
      .update(data.id, formData)
      .then((updateItem) => {
        if (updateItem.data.success) {
          setEditOpen(false);
          setIsLoader(false);
          setList((newArr: any) => {
            return newArr.map((item: any) => {
              if (item.id === updateItem.data.items.id) {
                item.fname = updateItem.data.items.fname;
                item.lname = updateItem.data.items.lname;
                item.email = updateItem.data.items.email;
                item.phone = updateItem.data.items.phone;
                item.gender = updateItem.data.items.gender;
                item.profilePic = updateItem.data.items.profilePic;
              }
              return { ...item };
            });
          });
          ToastHandler(updateItem.data.message);
        } else {
          setIsLoader(false);
          ToastHandler(updateItem.data.message);
        }
      })
      .catch((err: Error | any) => {
        const error = handleErrorMessage(err);
        ToastHandler(error);
        setIsLoader(false);
      });
  };

  const createContractHandler = (data: any) => {
    console.log('dadad', data);

    setIsLoader(true);
    const formData = new FormData();
    formData.append('userId', editFormData?.id);
    formData.append('propertyUnitId', data.propertyUnitId);
    formData.append('civilId', data.civilId || '');
    formData.append('nationality', data.nationality || '');
    formData.append('rentPrice', String(data.rentPrice));
    formData.append('rentPayDay', String(data.rentPayDay));
    formData.append('tenantType', data.tenantType || '');
    formData.append('legalCase', String(data.legalCase)); // boolean to string
    formData.append('contractStart', data.contractStart);
    formData.append('contractEnd', data.contractEnd);
    formData.append('leavingDate', data.leavingDate || '');
    formData.append('paymentCycle', data.paymentCycle || '');
    formData.append('language', data.language || '');
    if (data.agreementDoc) formData.append('agreementDoc', data.agreementDoc);
    contreactService
      .create(formData)
      .then((item) => {
        if (item.data.success) {
          setContractOpen(false);
          setIsLoader(false);
          ToastHandler(item.data.message);
          // setList([item.data.items, ...list]);
          // let newtotal = total;
          // setTotal((newtotal += 1));
        }
      })
      .catch((err: Error | any) => {
        const error = handleErrorMessage(err);
        ToastHandler(error);
        setIsLoader(false);
      });
  };

  return (
    <div className=" bg-white p-2 rounded-[20px] shadow-2xl mt-5">
      <TopBar title="Tenant Users" />
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* admin content page height */}
        <div className="w-full">
          <div className="flex items-center py-4 justify-between">
            <h2 className="text-tertiary-bg font-semibold text-[20px] leading-normal capitalize">
              Tenant Users
            </h2>
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-[461px] h-[35px] rounded-[23px] bg-mars-bg/50"
              />
              <DropdownMenu>
                {can(PERMISSIONS.USER.CREATE) && (
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="ml-auto w-[148px] h-[35px] bg-venus-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-quinary-bg"
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
                <TableBody className="bg-earth-bg">
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
                  currentPage={page}
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
          callback={createEmployeeHandler}
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
      {deleteOpen && (
        <DeleteDialog
          isLoader={isLoader}
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title={'User'}
          formData={editFormData}
          callback={deleteUserHandler}
        />
      )}
      {contractOpen && (
        <CreateContractDialog
          isLoader={isLoader}
          isOpen={contractOpen}
          setIsOpen={setContractOpen}
          callback={createContractHandler}
          formData={editFormData}
        />
      )}
    </div>
  );
};

export default TenantUsers;
