import { SidebarInset } from '@/components/ui/sidebar';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Loader2, Eye, Trash2 } from 'lucide-react';
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
import contactService from '@/services/adminapp/dashboard'; // 👈 new service
import { useNavigate } from 'react-router-dom';
const Contacts = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isLoader, setIsLoader] = useState(false);
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const ToastHandler = (msg: string, type: 'success' | 'error' = 'success') =>
    toast({
      description: msg,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4 z-[9999]'
      ),
      style: {
        backgroundColor: type === 'success' ? '#5CB85C' : '#d9534f',
        color: 'white',
      },
    });

  // 🔃 Fetch list with filters & pagination
  const fetchList = async (keySearch = search, pageNo: number) => {
    setMainIsLoader(true);
    try {
      const resp = await contactService.contacts(keySearch, pageNo, pageSize);

      if (resp.data.success) {
        setList(resp.data.items);
        setTotal(resp.data.total);
      } else ToastHandler(resp.data.message, 'error');
    } catch (err) {
      console.error(err);
      ToastHandler('Failed to fetch contacts', 'error');
    } finally {
      setMainIsLoader(false);
    }
  };

  useEffect(() => {
    fetchList(search, page);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fetchList(search, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
    fetchList(search, newPage + 1);
  };

  const deleteHandler = async () => {
    if (!selectedItem) return;
    setIsLoader(true);
    try {
      const resp = await contactService.deleteContact(selectedItem.id!);
      if (resp.data.success) {
        ToastHandler('Contact deleted successfully');
        setDeleteOpen(false);
        fetchList(search, page);
      } else ToastHandler(resp.data.message, 'error');
    } catch (err) {
      ToastHandler('Delete failed', 'error');
    } finally {
      setIsLoader(false);
    }
  };

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      //   { accessorKey: 'id', header: 'ID', enableHiding: true },
      { accessorKey: 'fname', header: 'First Name' },
      { accessorKey: 'lname', header: 'Last Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'message', header: 'Message' },
      {
        id: 'actions',
        header: 'Actions',
        enableHiding: false,
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div className="flex gap-2 items-center justify-center">
              <Trash2
                className="cursor-pointer text-red-500"
                onClick={() => {
                  setSelectedItem(contact);
                  setDeleteOpen(true);
                }}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: list,
    columns,
    state: {},
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4 mt-5">
      <SidebarInset className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex items-center py-4 justify-between">
          <h2 className="text-primary-bg font-semibold text-[28px] leading-normal capitalize">
            CONTACT SUBMISSIONS
          </h2>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearch}
              className="w-[300px] h-[35px] rounded-[23px] bg-mars-bg/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto border rounded">
          {mainIsLoader ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : (
                          <div className="flex items-center">
                            {flexRender(
                              h.column.columnDef.header,
                              h.getContext()
                            )}
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      className="text-center py-10"
                    >
                      No contacts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        <Paginator
          pageSize={pageSize}
          currentPage={page - 1}
          totalPages={Math.ceil(total / pageSize)}
          onPageChange={(pageNumber) => handlePageChange(pageNumber)}
          showPreviousNext
        />
      </SidebarInset>

      {selectedItem && (
        <DeleteDialog
          isLoader={isLoader}
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title="Contact"
          formData={selectedItem}
          callback={deleteHandler}
        />
      )}
    </div>
  );
};

export default Contacts;
