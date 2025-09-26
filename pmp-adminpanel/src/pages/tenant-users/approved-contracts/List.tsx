import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
import { SidebarInset } from '@/components/ui/sidebar';

import usersService from '@/services/adminapp/users';
import service from '@/services/adminapp/contracts';
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
  CircleCheck,
  CircleX,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
// import { Checkbox } from '@/components/ui/checkbox';
import DeleteDialog from '@/components/DeletePopup';
import { Paginator } from '@/components/Paginator';
import contractService from '@/services/adminapp/contracts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  //   DropdownMenuLabel,
  //   DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { getItem } from '@/utils/storage';
import { DropdownMenuCheckboxItem } from '@radix-ui/react-dropdown-menu';
// import OfficeUsersCreationDialog from './CreateDialog';
import OfficeUserUpdateDialog from './UpdateDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, handleErrorMessage } from '@/utils/helper';
import { usePermission } from '@/utils/hasPermission';
import { ASSET_BASE_URL, PERMISSIONS } from '@/utils/constants';
import dayjs from 'dayjs';
import UpdateContractDialog from './UpdateDialog';
import assets from '@/assets/images';

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
  userDetail: any;
  unitDetail: any;
  propertyUnitId?: any;
  userId?: any;
};

const ApprovedContracts = () => {
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
      accessorKey: 'userDetail.fname',
      header: 'NAME',
      cell: ({ row }: any) => {
        const user = row.original.userDetail;
        const tenantType = row.original?.tenantType || '';
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`${ASSET_BASE_URL}${user?.profile_pic}` || ''}
                alt={getInitials(user?.fname || '@fallback')}
              />
              <AvatarFallback>{getInitials(user?.fname || '')}</AvatarFallback>
            </Avatar>
            <div className="">
              <div className="capitalize">
                {user?.fname} {user?.lname}
              </div>
              <span className="text-gray-700 text-xs">({tenantType})</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'property',
      header: 'PROPERTY NAME',
      cell: ({ row }) => {
        const unit = row.original.unitDetail;
        return <div className="capitalize">{unit?.property?.name}</div>;
      },
    },
    {
      accessorKey: 'unit_no',
      header: 'UNIT NO.',
      cell: ({ row }) => {
        const unit = row.original.unitDetail;

        return (
          <div className="capitalize">
            {unit?.name}
            <span className="text-gray-500 text-xs"> ({unit?.unitNo})</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'contractNumber',
      header: 'CONTRACT NUMBER',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('contractNumber')}</div>
      ),
    },
    {
      accessorKey: 'contractStart',
      header: 'CONTRACT START',
      cell: ({ row }) => (
        <div className="capitalize">
          {dayjs(row.getValue('contractStart')).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      accessorKey: 'contractEnd',
      header: 'CONTRACT END',
      cell: ({ row }) => (
        <div className="capitalize">
          {dayjs(row.getValue('contractEnd')).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      accessorKey: 'leavingDate',
      header: 'LEAVING DATE',
      cell: ({ row }) => (
        <div className="capitalize">
          {dayjs(row.getValue('leavingDate')).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      accessorKey: 'agreement_doc',
      header: 'AGREEMENT DOCS',
      cell: ({ row }) => {
        const [showTooltip, setShowTooltip] = useState(false);

        const docs: any = row.getValue('agreement_doc');

        if (!docs || docs?.length === 0) return <span>No file</span>;

        // Ensure it's always an array
        const fileList = Array.isArray(docs) ? docs : [docs];

        const getFileType = (fileName: any) => {
          const ext = fileName.split('.').pop().toLowerCase();
          if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext))
            return 'document';
          if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext))
            return 'image';
          return 'other';
        };

        return (
          <div className="flex items-center gap-2">
            {fileList.slice(0, 2).map((file, idx) => {
              const type = getFileType(file);
              return (
                <a
                  key={idx}
                  href={ASSET_BASE_URL + file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  {type === 'document' ? (
                    <img
                      src={assets.images.tenantAssign}
                      alt="doc"
                      className="w-8 h-8 object-contain text rounded border"
                    />
                  ) : // <FileText className="text-primary-bg" size={20} />
                  type === 'image' ? (
                    <img
                      src={ASSET_BASE_URL + file}
                      alt="doc"
                      className="w-8 h-8 object-cover rounded border"
                    />
                  ) : (
                    <img
                      src={assets.images.tenantAssign}
                      alt="docs"
                      className="w-8 h-8 object-cover text rounded border"
                    />
                  )}
                </a>
              );
            })}
            {fileList.length > 2 && (
              <div className="relative">
                <span
                  className="bg-primary-bg text-white text-xs px-2 py-1 rounded-full cursor-pointer"
                  onClick={() => setShowTooltip(!showTooltip)}
                >
                  +{fileList.length - 2}
                </span>

                {showTooltip && (
                  <div className="absolute bottom-[-15px] mb-2 left-[50px] -translate-x-1/2 bg-white border shadow-lg p-2 rounded z-500 overflow-y-auto">
                    <div className="flex gap-2 flex-wrap max-w-[600px] max-h-[100px] overflow-y-auto">
                      {fileList.slice(2).map((file, idx) => {
                        const type = getFileType(file);
                        return (
                          <a
                            key={idx}
                            href={ASSET_BASE_URL + file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            {type === 'document' ? (
                              <FileText className="text-primary-bg" size={20} />
                            ) : // <img
                            //   src={assets.images.tenantAssign}
                            //   alt="docs"
                            //   className="w-20 h-20 object-contain text rounded border"
                            // />
                            // <FileText className="text-primary-bg" size={20} />
                            type === 'image' ? (
                              <img
                                src={ASSET_BASE_URL + file}
                                alt="doc"
                                className="w-8 h-8 object-cover rounded border"
                              />
                            ) : (
                              <FileText className="text-primary-bg text-lg" />
                            )}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'ACTIONS',
      enableHiding: false,
      cell: ({ row }) => {
        // const payment = row.original;
        const { id } = row.original;
        return (
          <div className="flex justify-center items-center">
            {can(PERMISSIONS.USER_CONTRACT.UPDATE) && (
              <div>
                <img
                  onClick={() => handleActionMenu('edit', id)}
                  src={assets.images.editPencil}
                  className="text-primary-bg cursor-pointer h-8 w-8"
                />
              </div>
            )}
            {/* 
            {can(PERMISSIONS.USER_CONTRACT.DELETE) && (
              <div className="pl-3">
                <Trash2
                  className="text-lunar-bg cursor-pointer"
                  size={20}
                  onClick={() => handleActionMenu('delete', id)}
                />
              </div>
            )} */}
          </div>
        );
      },
    },
  ];

  const handleActionMenu = async (type: string, actionId: string) => {
    if (type === 'edit') {
      const editData = list.find((item: any) => item.id === actionId);
      setEditFormData(editData);
      setEditOpen(true);
    }
    if (type === 'delete') {
      const editData = list.find((item: any) => item.id === actionId);
      setEditFormData(editData);
      setEditOpen(true);
    }
  };

  const fetchList = async () => {
    try {
      const users = await service.approvedList(
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
      fetchList();
    }
  };

  useEffect(() => {
    fetchList();
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
      const users = await service.approvedList(
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

  // const createEmployeeHandler = (data: any) => {
  //   console.log('dadad', data);

  //   setIsLoader(true);
  //   const formData = new FormData();
  //   formData.append('fname', data.fname);
  //   formData.append('lname', data.lname);
  //   formData.append('email', data.email);
  //   formData.append('phone', data.phone);
  //   formData.append('gender', data.gender);
  //   formData.append('password', data.password);
  //   formData.append('roleType', 'User');
  //   formData.append('landlordId', userDetails?.landlordId);
  //   if (data.profilePic) formData.append('profilePic', data.profilePic);
  //   userService
  //     .create(formData)
  //     .then((item) => {
  //       if (item.data.success) {
  //         setIsOpen(false);
  //         setIsLoader(false);
  //         setList([item.data.items, ...list]);
  //         let newtotal = total;
  //         setTotal((newtotal += 1));
  //       } else {
  //         setIsLoader(false);
  //         ToastHandler(item.data.message);
  //       }
  //     })
  //     .catch((err: Error | any) => {
  //       console.log('error: ', err);
  //       ToastHandler(err?.response?.data?.detail[0]?.msg);
  //       setIsLoader(false);
  //     });
  // };

  const updateContractHandler = (data: any) => {
    setIsLoader(true);
    const formData = new FormData();
    // console.log('data: ', data);

    // Append all fields
    formData.append('contractId', editFormData?.id);
    formData.append('propertyUnitId', data.propertyUnitId);
    formData.append('civilId', data.civilId || '');
    formData.append('nationality', data.nationality || '');
    formData.append('rentPrice', String(data.rentPrice));
    formData.append('rentPayDay', String(data.rentPayDay));
    formData.append('tenantType', data.tenantType || '');
    formData.append('legalCase', String(data.legalCase) || 'false');
    formData.append('contractStart', data.contractStart);
    formData.append('contractEnd', data.contractEnd);
    formData.append('leavingDate', data.leavingDate || '');
    formData.append('paymentCycle', data.paymentCycle || '');
    formData.append('language', data.language || '');

    if (data.agreementDoc) {
      // formData.append('agreementDoc', data.agreementDoc);
      data.agreementDoc.forEach((f: any) => formData.append('agreementDoc', f));
    }

    contractService
      .update(editFormData?.id, formData)
      .then((item: any) => {
        if (item.data.success) {
          console.log('item: ', item.data.data);

          const updatedItem = {
            ...item.data.data,
            propertyUnitId: item.data.data.propertyUnitId,
            agreement_doc: Array.isArray(item.data.data.agreementDoc)
              ? item.data.data.agreementDoc
              : (item.data.data.agreementDoc || '').split(','),
          };

          setList((prev: any) =>
            prev.map((contract: any) =>
              contract.id === editFormData?.id
                ? { ...contract, ...updatedItem }
                : contract
            )
          );

          setEditOpen(false);
          setEditFormData(undefined);
          setIsLoader(false);
          ToastHandler('Contract Successfully Updated');
        }
      })
      .catch((err: Error | any) => {
        const error = handleErrorMessage(err);
        console.log('error: ', error);

        ToastHandler(error);
        setIsLoader(false);
      });
  };

  return (
    <div className=" p-2 mt-5">
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* admin content page height */}
        <div className="w-full">
          <div className="flex items-center py-4 justify-between">
            <h2 className="text-primary-bg font-semibold text-3xl leading-normal capitalize">
              APPROVED CONTRACTS
            </h2>
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Search contracts..."
                value={search}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-[461px] h-[35px] rounded-[23px] bg-mars-bg/50"
              />
              <DropdownMenu>
                {/* {can(PERMISSIONS.USER.CREATE) && (
                  <Button
                    onClick={() => setIsOpen(true)}
                    className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                    variant={'outline'}
                  >
                    + Add New
                  </Button>
                )} */}
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
      {/* {isOpen && (
        <OfficeUsersCreationDialog
          isLoader={isLoader}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          callback={createEmployeeHandler}
        />
      )} */}
      {editOpen && (
        <UpdateContractDialog
          isLoader={isLoader}
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          formData={editFormData}
          callback={updateContractHandler}
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
    </div>
  );
};

export default ApprovedContracts;
