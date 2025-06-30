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
  FileText,
  Loader2,
  // ChevronDown,
  MoreHorizontal,
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
import service from '@/services/adminapp/support-maintenance';
import { getItem } from '@/utils/storage';
import { DropdownMenuCheckboxItem } from '@radix-ui/react-dropdown-menu';
import OfficeUsersCreationDialog from './CreateDialog';
import OfficeUserUpdateDialog from './UpdateDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, handleErrorMessage } from '@/utils/helper';
import { usePermission } from '@/utils/hasPermission';
import { ASSET_BASE_URL, PERMISSIONS } from '@/utils/constants';
import SupportTicketUpdateDialog from './UpdateDialog';

export type Users = {
  id: string; // UUID
  tenant: string; // UUID representing the tenant ID
  firstName: string;
  lastName: string;
  username: string; // Email is being used as a username
  email: string; // Email address of the user
  password: string; // Encrypted password (bcrypt hash)
  phone: string; // Phone number of the user
  country: string | null; // Country information, nullable
  state: string | null; // State information, nullable
  city: string | null; // City information, nullable
  zipCode: string | null; // Zip code, nullable
  role: string | null; // User role, nullable
  avatar: string | null; // Avatar URL or path, nullable
  address: string; // Address of the user
  userType: 'USER' | 'ADMIN'; // Enum type to restrict values
  isActive: boolean; // Active status of the user
  isDeleted: boolean; // Soft delete status
  createdAt: string; // ISO date string for creation timestamp
  updatedAt: string; // ISO date string for update timestamp
  status: 'open' | 'in_progress' | 'rsolved' | 'closed';
};

const SupportMaintenance = () => {
  const userDetails: any = getItem('USER');
  console.log('userDetails', userDetails);

  const { toast } = useToast();
  const { can } = usePermission();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = React.useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<any>([]);
  const [editFormData, setEditFormData] = useState();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [isLoader, setIsLoader] = useState(false);
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

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
      accessorKey: 'subject',
      header: 'Subject',
      cell: ({ row }) => (
        <div className="capitalize font-semibold">
          {row.getValue('subject')}
        </div>
      ),
    },
    {
      accessorKey: 'message',
      header: 'Description',
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('message')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="capitalize bg-neptune-bg/30 text-center w-[80px] h-[22px] rounded-[30px] text-[10px] leading-normal font-semibold text-saturn-bg py-[1px] border-neptune-bg border-2">
          {row.getValue('status')}
        </div>
      ),
    },
    {
      accessorKey: 'images',
      header: 'Attachments',
      cell: ({ row }) => {
        const images = row.getValue('images') as string[] | null;

        if (!images || images.length === 0) {
          return <span className="text-gray-400 text-xs">No files</span>;
        }

        return (
          <div className="flex gap-2 flex-wrap">
            {images.map((url, idx) => {
              const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
              const isPDF = /\.pdf$/i.test(url);
              const isDoc = /\.(docx?|txt)$/i.test(url);

              return (
                <a
                  key={idx}
                  href={ASSET_BASE_URL + url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-12 h-12 border border-gray-200 rounded overflow-hidden items-center justify-center"
                  title={url.split('/').pop()}
                >
                  {isImage ? (
                    <img
                      src={ASSET_BASE_URL + url}
                      alt={`attachment-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  ) : isPDF ? (
                    <FileText
                      className="text-lunar-bg cursor-pointer"
                      size={50}
                    />
                  ) : isDoc ? (
                    <FileText
                      className="text-lunar-bg cursor-pointer"
                      size={20}
                    />
                  ) : (
                    <span className="text-xs text-gray-500">File</span>
                  )}
                </a>
              );
            })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        // const payment = row.original;
        const { id, status } = row.original;
        return status === 'closed' ? null : (
          <div className="flex justify-center items-center">
            {can(PERMISSIONS.MAINTENANCE_REQUEST.UPDATE) && (
              <div>
                <Pencil
                  className="text-lunar-bg cursor-pointer"
                  onClick={() => handleActionMenu('edit', id)}
                  size={20}
                />
              </div>
            )}
            {can(PERMISSIONS.MAINTENANCE_REQUEST.DELETE) && (
              <div className="pl-3">
                <Trash2
                  className="text-lunar-bg cursor-pointer"
                  size={20}
                  onClick={() => handleActionMenu('delete', id)}
                />
              </div>
            )}
          </div>
          // <DropdownMenu>
          //   <DropdownMenuTrigger asChild>
          //     <Button variant="ghost" className="h-8 w-8 p-0">
          //       <span className="sr-only">Open menu</span>
          //       <MoreHorizontal />
          //     </Button>
          //   </DropdownMenuTrigger>
          //   <DropdownMenuContent align="end">
          //     <DropdownMenuItem
          //       className="cursor-pointer"
          //       onClick={() => handleActionMenu('edit', id)}
          //     >
          //       Edit
          //     </DropdownMenuItem>
          //     <DropdownMenuItem
          //       className="cursor-pointer"
          //       onClick={() => handleActionMenu('delete', id)}
          //     >
          //       Delete
          //     </DropdownMenuItem>
          //   </DropdownMenuContent>
          // </DropdownMenu>
        );
      },
    },
  ];

  const handleActionMenu = (type: string, actionId: string) => {
    console.log('actionId', actionId, type);

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

  const fetchTickets = async () => {
    try {
      const resp = await service.list(
        userDetails?.role?.name === 'Landlord'
          ? userDetails?.landlordId
          : userDetails?.id,
        userDetails?.role?.id,
        search,
        status,
        page,
        pageSize
      );
      if (resp.data.success) {
        setMainIsLoader(false);
        setList(resp.data.items);
        setTotal(resp.data.total);
      } else {
        setMainIsLoader(false);
        console.log('error: ', resp.data.message);
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
      fetchTickets();
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // const deleteHandler = (data: any) => {
  //   const userId = data.id;
  //   setIsLoader(true);
  //   service
  //     .deleteBlog(userId)
  //     .then((updateItem) => {
  //       if (updateItem.data.success) {
  //         setDeleteOpen(false);
  //         setIsLoader(false);
  //         setList((newArr: any) => {
  //           return newArr.filter((item: any) => item.id !== userId);
  //         });
  //         let newtotal = total;
  //         setTotal((newtotal -= 1));
  //         toast({
  //           description: updateItem.data.message,
  //           className: cn(
  //             'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
  //           ),
  //           style: {
  //             backgroundColor: '#FF5733',
  //             color: 'white',
  //           },
  //         });
  //       } else {
  //         setIsLoader(false);
  //       }
  //     })
  //     .catch((err: Error) => {
  //       console.log('error: ', err);
  //       setIsLoader(false);
  //     });
  // };

  const handlePageChange = async (newPage: any) => {
    table.setPageIndex(newPage);
    try {
      const users = await service.list(
        userDetails?.id,
        userDetails?.roleId,
        search,
        status,
        newPage,
        pageSize
      );
      if (users.data.success) {
        setPage(newPage);
        setList(users.data.data.list);
        setTotal(users.data.data.total);
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

  const createHandler = (data: any) => {
    setIsLoader(true);
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('senderId', data.senderId);
    formData.append('senderRoleId', data.senderRoleId);
    if (data?.images && data?.images?.length) {
      data.images.forEach((image: any) => {
        formData.append('images', image);
      });
    }
    service
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
        const error = handleErrorMessage(err);
        ToastHandler(error);
        setIsLoader(false);
      });
  };

  const updateHandler = (data: any) => {
    setIsLoader(true);
    const supportId = data.id;
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('message', data.message);
    formData.append('senderId', data.senderId);
    formData.append('senderRoleId', data.senderRoleId);
    if (data?.images && data?.images?.length) {
      data.images.forEach((image: any) => {
        formData.append('new_images', image);
      });
    }
    service
      .update(supportId, formData)
      .then((updateItem) => {
        if (updateItem.data.success) {
          setEditOpen(false);
          setIsLoader(false);
          setList((newArr: any) => {
            return newArr.map((item: any) => {
              if (item.id === updateItem.data.items.id) {
                item.subject = updateItem.data.items.subject;
                item.message = updateItem.data.items.message;
                item.images = updateItem.data.items.images;
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

  return (
    <div className=" bg-white p-2 rounded-[20px] shadow-2xl mt-5">
      <TopBar title="Support Tickets" />
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* admin content page height */}
        <div className="w-full">
          <div className="flex items-center py-4 justify-between">
            <h2 className="text-tertiary-bg font-semibold text-[20px] leading-normal capitalize">
              Support Tickets
            </h2>
            <div className="flex gap-3 items-center">
              <Input
                placeholder="Search Request..."
                value={search}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-[461px] h-[35px] rounded-[23px] bg-mars-bg/50"
              />
              <DropdownMenu>
                {can(PERMISSIONS.MAINTENANCE_REQUEST.CREATE) && (
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
        <OfficeUsersCreationDialog
          isLoader={isLoader}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          callback={createHandler}
        />
      )}
      {editOpen && (
        <SupportTicketUpdateDialog
          isLoader={isLoader}
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          formData={editFormData}
          callback={updateHandler}
        />
      )}
      {statusOpen && (
        <SupportTicketUpdateDialog
          isLoader={isLoader}
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          formData={editFormData}
          callback={updateHandler}
        />
      )}
      {/* 
      {deleteOpen && (
        <DeleteDialog
          isLoader={isLoader}
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title={'Blog'}
          formData={editFormData}
          callback={deleteHandler}
        />
      )} */}
    </div>
  );
};

export default SupportMaintenance;
