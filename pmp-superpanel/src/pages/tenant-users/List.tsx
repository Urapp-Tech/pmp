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
};

const TenantUsers = () => {
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
  const [contractOpen, setContractOpen] = useState(false);

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
      accessorKey: 'fname',
      header: 'NAME',
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
            <div className="capitalize">
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
            EMAIL
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
      header: 'PHONE',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('phone')}</div>
      ),
    },
    {
      accessorKey: 'roleName',
      header: 'ROLE',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('roleName') == 'User'
            ? 'Tenant'
            : row.getValue('roleName')}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'STATUS',
      cell: ({ row }) => (
        <div
          className={`capitalize ${row.getValue('isActive') ? 'bg-scrollbar' : 'bg-primary-bg !text-[#BBF9E4]'} flex items-center justify-center rounded-[3px] text-center w-[75px] h-[30px] text-[12px] leading-normal font-semibold text-primary-bg py-[1px]`}
        >
          {row.getValue('isActive') ? 'Active' : 'inactive'}
        </div>
      ),
    },
    // {
    //   accessorKey: 'assignedProperty',
    //   header: 'Property',
    //   cell: ({ row }) => {
    //     const value = row.getValue('assignedProperty') as string[] | undefined;
    //     return (
    //       <div>
    //         {Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   accessorKey: 'assignedPropertyUnit',
    //   header: 'Assigned Unit',
    //   cell: ({ row }) => {
    //     const value = row.getValue('assignedPropertyUnit') as
    //       | string[]
    //       | undefined;
    //     return (
    //       <div>
    //         {Array.isArray(value) && value.length > 0 ? value.join(', ') : '-'}
    //       </div>
    //     );
    //   },
    // },
    {
      id: 'status',
      header: 'ACTIONS',
      cell: ({ row }) => {
        const { id, isActive } = row.original;

        const handleToggle = () => {
          // You can call your API or state update logic here
          handleStatusToggle(id, !isActive);
        };

        return (
          <div className="flex justify-start items-center">
            {can(PERMISSIONS.USER.UPDATE) && (
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isActive}
                  onChange={handleToggle}
                />
                <div
                  className="
      relative w-16 h-8 rounded-[5px] bg-[#424256]
      transition-colors duration-300
      peer-checked:bg-primary-bg
      after:content-[''] after:absolute after:top-1 after:left-1
      after:h-6 after:w-6 after:bg-white after:rounded-full
      after:transition-transform after:duration-300 after:ease-in-out
      after:shadow-sm
      peer-checked:after:translate-x-8
    "
                />
              </label>
            )}
            {can(PERMISSIONS.USER.UPDATE) && (
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

  const handleStatusToggle = (userId: any, newStatus: any) => {
    setMainIsLoader(true);
    const formData = new FormData();
    formData.append('isActive', newStatus);
    usersService
      .update(userId, formData)
      .then((updateItem) => {
        if (updateItem.data.success) {
          setMainIsLoader(false);
          setList((newArr: any) => {
            return newArr.map((item: any) => {
              if (item.id === updateItem.data.items.id) {
                item.isActive = updateItem.data.items.isActive;
              }
              return { ...item };
            });
          });
          ToastHandler(updateItem.data.message);
        }
      })
      .catch((err: Error | any) => {
        const error = handleErrorMessage(err);
        ToastHandler(error);
        setMainIsLoader(false);
      });
  };

  const fetchUsers = async () => {
    setMainIsLoader(true);
    const constantPage = 1;
    setPage(constantPage);
    try {
      const users = await usersService.tenantUserList(
        search,
        constantPage,
        pageSize,
        watch('userfilter')
      );
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
    // setIsLoader(true);
    const dataObj = { ...data };
    const roleRaw = dataObj.roleName; // e.g. "Manager"
    const role =
      typeof roleRaw === 'string' ? roleRaw.trim().toLowerCase() : '';
    let service: any;
    const formData = new FormData();

    console.log(
      'createHandler:dataObj',
      dataObj,
      'roleRaw=',
      roleRaw,
      'role=',
      role
    );

    if (!role) {
      console.error('roleName is missing');
      return;
    }

    const buildFullName = () =>
      `${dataObj.fname ?? ''} ${dataObj.lname ?? ''}`.trim();

    switch (role) {
      case 'landlord': {
        // JSON body flow for landlord creation
        dataObj.isVerified = true;
        dataObj.name = buildFullName();
        delete dataObj.fname;
        delete dataObj.lname;
        delete dataObj.roleName;
        delete dataObj.landlordId;

        service = LandlordService.createService(dataObj);
        console.log('service: landlord', service, dataObj);
        break;
      }

      case 'manager':
      case 'user': {
        // FormData flow for manager/user
        formData.append('fname', dataObj.fname ?? '');
        formData.append('lname', dataObj.lname ?? '');
        formData.append('email', dataObj.email ?? '');
        formData.append('phone', dataObj.phone ?? '');
        formData.append('gender', dataObj.gender ?? '');
        formData.append('password', dataObj.password ?? '');
        formData.append('roleType', roleRaw); // keep original casing the API expects
        if (dataObj.landlordId != null)
          formData.append('landlordId', String(dataObj.landlordId));
        if (dataObj.profilePic)
          formData.append('profilePic', dataObj.profilePic as Blob);

        service = userService.create(formData);
        console.log('service: manager/user', service);
        break;
      }

      default: {
        // Everything else -> SuperUserService
        dataObj.name = buildFullName();
        delete dataObj.fname;
        delete dataObj.lname;
        delete dataObj.roleName;
        delete dataObj.landlordId;

        service = SuperUserService.create(dataObj);
        console.log('service: superuser (default)', service, dataObj);
      }
    }

    return service
      .then((item: any) => {
        if (item.data.success) {
          setIsOpen(false);
          setIsLoader(false);
          setList([item.data.items, ...list]);
          let newtotal = total;
          setTotal((newtotal += 1));
          ToastHandler(item.data.message);
        } else {
          setIsLoader(false);
          ToastHandler(item.data.message);
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
    let service: any;
    const formData = new FormData();
    if (
      data.roleName !== 'Landlord' ||
      data.roleName !== 'Manager' ||
      data.roleName !== 'User'
    ) {
      const name = data.fname + ' ' + data.lname;
      data.name = name;
      delete data.fname;
      delete data.lname;
      delete data.roleName;
      delete data.landlordId;
      service = SuperUserService.update(id, data);
    } else if (data.roleName === 'Landlord') {
      data.isVerified = true;
      delete data.roleName;
      delete data.landlordId;
      service = LandlordService.updateService(id, data);
    } else {
      // console.log('me formdata ho');
      formData.append('fname', data.fname);
      formData.append('lname', data.lname);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('gender', data.gender);
      formData.append('password', data.password);
      formData.append('roleType', data.roleName);
      formData.append('landlordId', data.landlordId);
      if (data.profilePic) formData.append('profilePic', data.profilePic);
      service = userService.update(id, formData);
    }

    service
      .then((updateItem: any) => {
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
                item.roleId = updateItem.data.items.roleId;
                item.gender = updateItem.data.items.gender;
                item.roleName = updateItem.data.items.roleName;
              }
              return { ...item };
            });
          });
          ToastHandler(updateItem.data.message);
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
              ALL USERS
            </h2>
            <div className="flex gap-3 items-center">
              <div className="w-[150px]">
                <SingleSelectDropDown
                  control={control}
                  name="userfilter"
                  label=""
                  items={[
                    { id: 'All', name: 'All' },
                    { id: 'User', name: 'Tenant' },
                    { id: 'Manager', name: 'Manager' },
                    { id: 'Landlord', name: 'Landlord' },
                    { id: 'superusers', name: 'Super Users' },
                  ]}
                  placeholder="Choose an option"
                  mainClassName="custom-filter-select-field"
                />
              </div>
              <div className="flex items-center w-[461px]">
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-[461px] h-[35px] rounded bg-mars-bg/50"
                />
              </div>
              <DropdownMenu>
                {can(PERMISSIONS.USER.CREATE) && (
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

export default TenantUsers;
