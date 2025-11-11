import React, { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
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
import {
  ArrowUpDown,
  Loader2,
  // ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
import empService from '@/services/adminapp/employees';
import cabinService from '@/services/adminapp/cabins';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getItem } from '@/utils/storage';
import EmployeeCreationDialog from '@/pages/employees/EmployeeCreateDialog';
import { Paginator } from '@/components/Paginator';
import EmployeeUpdateDialog from '@/pages/employees/EmployeeUpdateDialog';
// import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import DeleteDialog from '@/components/DeletePopup';
import EmployeeAssignDialog from '@/pages/employees/EmployeeAssignDialog';
import { useNavigate } from 'react-router';
import { getInitials } from '@/utils/helper';

export type Payment = {
  id: string;
  avatar: string;
  name: string;
  email: string;
  phone: string;
  cabinName: string;
  postalCode: string;
  address: string;
  isActive: boolean;
};

const Employees = () => {
  const userDetails: any = getItem('USER');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [list, setList] = useState<any>([]);
  const [isLoader, setIsLoader] = useState(false);
  const [mainIsLoader, setMainIsLoader] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  // const [historyOpen, setHistoryOpen] = useState(false);
  const [editFormData, setEditFormData] = useState();

  const [cabinLov, setCabinLov] = useState([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

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

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={row.original.avatar || ''}
              alt={row.getValue('name') || '@fallback'}
            />
            <AvatarFallback>{getInitials(row.getValue('name'))}</AvatarFallback>
          </Avatar>
          <div className="capitalize font-semibold">{row.getValue('name')}</div>
        </div>
      ),
    },
    {
      accessorKey: 'cardNumber',
      header: 'Card Number',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('cardNumber') ? row.getValue('cardNumber') : '---'}
        </div>
      ),
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
        <div className="lowercase">
          {row.getValue('email') ? row.getValue('email') : '---'}
        </div>
      ),
    },
    {
      accessorKey: 'cabinName',
      header: 'Assigned Cabin',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('cabinName') ? row.getValue('cabinName') : '---'}
        </div>
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
        <div className="capitalize">
          {row.getValue('isActive') ? 'Active' : 'InActive'}
        </div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('address') ? row.getValue('address') : '---'}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id } = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleActionMenu('assign', id)}
              >
                Assign Cabin
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleActionMenu('history', id)}
              >
                View History
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleActionMenu('edit', id)}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleActionMenu('delete', id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
    if (type === 'assign') {
      const editData = list.find((item: any) => item.id === actionId);
      editData.items = cabinLov;
      console.log('cabinLov', cabinLov, editData);
      setEditFormData(editData);
      setAssignOpen(true);
    }
    if (type === 'history') {
      const editData = list.find((item: any) => item.id === actionId);
      navigate('./history', { state: { employeeData: editData } });
    }
  };

  const fetchCabinLov = async () => {
    try {
      const cabins = await cabinService.lov();
      if (cabins.data.success) {
        const lov = cabins.data.data.map((el: any) => {
          return {
            name: el.cabinNumber,
            id: el.id,
          };
        });
        setCabinLov(lov);
      } else {
        console.log('error: ', cabins.data.message);
      }
    } catch (error: Error | unknown) {
      console.log('error: ', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const users = await empService.list(search, page, pageSize);
      if (users.data.success) {
        setMainIsLoader(false);
        setList(users.data.data.list);
        setTotal(users.data.data.total);
      } else {
        setMainIsLoader(false);
        console.log('error: ', users.data.message);
      }
    } catch (error: Error | unknown) {
      setMainIsLoader(false);
      console.log('error: ', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchUsers();
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCabinLov();
  }, []);

  const createEmployeeHandler = (data: any) => {
    setIsLoader(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('cardNumber', data.cardNumber);
    if (data.avatar) formData.append('avatar', data.avatar);
    empService
      .create(data)
      .then((item) => {
        if (item.data.success) {
          setIsOpen(false);
          setIsLoader(false);
          setList([item.data.data, ...list]);
          let newtotal = total;
          setTotal((newtotal += 1));
        } else {
          setIsLoader(false);
          ToastHandler(item.data.message);
        }
      })
      .catch((err: Error | any) => {
        console.log('error: ', err);
        ToastHandler(err?.response?.data?.message);
        setIsLoader(false);
      });
  };

  const updateEmployeeHandler = (data: any) => {
    const empId = data.id;
    delete data.id;
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('cardNumber', data.cardNumber);
    if (data.avatar) formData.append('avatar', data.avatar);
    setIsLoader(true);
    empService
      .update(empId, data)
      .then((updateItem) => {
        if (updateItem.data.success) {
          setEditOpen(false);
          setIsLoader(false);
          setList((newArr: any) => {
            return newArr.map((item: any) => {
              if (item.id === updateItem.data.data.id) {
                item.name = updateItem.data.data.name;
                item.email = updateItem.data.data.email;
                item.phone = updateItem.data.data.phone;
                item.address = updateItem.data.data.address;
                item.avatar = updateItem.data.data.avatar;
                item.cardNumber = updateItem.data.data.cardNumber;
              }
              return { ...item };
            });
          });
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
          // Toast(updateItem.data.message);
        } else {
          setIsLoader(false);
        }
      })
      .catch((err: Error) => {
        console.log('error: ', err);
        setIsLoader(false);
      });
  };

  const assignEmployeeHandler = (data: any) => {
    data.tenant = userDetails?.tenant;
    setIsLoader(true);
    cabinService
      .assignEmp(data)
      .then((assignedItem) => {
        if (assignedItem.data.success) {
          setAssignOpen(false);
          setIsLoader(false);
          // ToastHandler(assignedItem.data.message);
          setList((prevList: any) => {
            const updatedList = prevList.map((item: any) => {
              if (item.cabin === assignedItem.data.data.cabin) {
                return { ...item, cabinName: null, cabin: null };
              }

              if (item.id === assignedItem.data.data.employee) {
                return {
                  ...item,
                  cabinName: assignedItem.data.data.cabinName,
                  cabin: assignedItem.data.data.cabin,
                };
              }

              return item;
            });

            return updatedList;
          });
        } else {
          // ToastHandler(assignedItem.data.message);
          setIsLoader(false);
        }
      })
      .catch((err: Error | any) => {
        // console.log('error: ', err);
        ToastHandler(err?.response?.data?.message);
        setIsLoader(false);
      });
  };

  const deleteEmployeeHandler = (data: any) => {
    const empId = data.id;
    setIsLoader(true);
    empService
      .deleteEmp(empId)
      .then((updateItem) => {
        if (updateItem.data.success) {
          setDeleteOpen(false);
          setIsLoader(false);
          setList((newArr: any) => {
            return newArr.filter((item: any) => item.id !== empId);
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
    console.log(
      'current page: ',
      table.getState().pagination.pageIndex,
      newPage
    );
    try {
      const users = await empService.list(search, newPage, pageSize);
      if (users.data.success) {
        setPage(newPage);
        setList(users.data.data.list);
        setTotal(users.data.data.total);
      } else {
        console.log('error: ', users.data.message);
      }
    } catch (error: Error | unknown) {
      console.log('error: ', error);
    }
  };

  const table = useReactTable({
    data: list ?? [],
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
    <div className="">
      <TopBar title="Employees" />
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="w-full">
          <div className="flex items-center py-4">
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className="max-w-sm"
            />
            <DropdownMenu>
              {/* <Button
                onClick={() => handleApiService()}
                className="ml-auto"
                variant={'outline'}
              >
                Add
              </Button> */}
              <Button
                onClick={() => setIsOpen(true)}
                className="ml-auto"
                variant={'outline'}
              >
                Add Employee
              </Button>
            </DropdownMenu>
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
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {total} total - Page {page + 1} of {Math.ceil(total / pageSize)}
            </div>
            <div className="flex justify-end">
              <Paginator
                pageSize={pageSize}
                currentPage={page}
                totalPages={total}
                onPageChange={(pageNumber) => handlePageChange(pageNumber)}
                showPreviousNext
              />
            </div>
          </div>
        </div>
      </SidebarInset>
      {isOpen && (
        <EmployeeCreationDialog
          isLoader={isLoader}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          callback={createEmployeeHandler}
        />
      )}
      {editOpen && (
        <EmployeeUpdateDialog
          isLoader={isLoader}
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          formData={editFormData}
          callback={updateEmployeeHandler}
        />
      )}
      {assignOpen && (
        <EmployeeAssignDialog
          isLoader={isLoader}
          isOpen={assignOpen}
          setIsOpen={setAssignOpen}
          formData={editFormData}
          allData={list}
          callback={assignEmployeeHandler}
        />
      )}
      {deleteOpen && (
        <DeleteDialog
          isLoader={isLoader}
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title={'Employee'}
          formData={editFormData}
          callback={deleteEmployeeHandler}
        />
      )}
    </div>
  );
};

export default Employees;
