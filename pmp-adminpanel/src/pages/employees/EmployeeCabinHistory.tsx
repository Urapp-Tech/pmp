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
import React, { useCallback, useEffect, useState } from 'react';
// import { Checkbox } from '@/components/ui/checkbox';
import { Paginator } from '@/components/Paginator';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import cabinService from '@/services/adminapp/cabins';
import empService from '@/services/adminapp/employees';
import { getItem } from '@/utils/storage';
// import { Toast } from '@/components/Toast';
import { DatePickerWithRange } from '@/components/DateRange';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { Loader2 } from 'lucide-react';

export type Payment = {
  id: string;
  cabin: string;
  status: boolean;
  datetime: string;
  time: string;
};

const EmployeeCabinHistory = () => {
  const userDetails: any = getItem('USER');
  const { state } = useLocation();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);
  const [time, setTime] = useState<any>();
  const [selectedDates, setSeletedDates] = useState<any>({});
  const [list, setList] = useState<any>([]);
  const [isLoader, setIsLoader] = useState(false);

  const [cabinLov, setCabinLov] = useState([]);
  const [selectedCabin, setSelectedCabin] = useState('');

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const fetchCabinName = (id: any) => {
    // console.log('id======>>', id);
    return cabinLov?.find((cabin: any) => cabin.id === id);
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'cabin',
      header: 'Cabin Number',
      cell: ({ row }) => {
        const cabin: any = fetchCabinName(row.getValue('cabin'));
        // console.log("cabin",cabin);
        return <div className="capitalize">{cabin?.name}</div>;
      },
    },
    {
      accessorKey: 'identifier',
      header: 'Cabin Presence',
      cell: ({ row }) => (
        <div className="capitalize">
          {row.getValue('identifier') ? 'Present' : 'Absent'}
        </div>
      ),
    },
    {
      id: 'created_date',
      accessorKey: 'time',
      header: 'Date',
      cell: ({ row }) => (
        <div className="capitalize">
          {dayjs(row.getValue('created_date')).format('YYYY-MM-DD')}
        </div>
      ),
    },
    {
      id: 'created_time',
      accessorKey: 'time',
      header: 'Time',
      cell: ({ row }) => (
        <div className="capitalize">
          {dayjs(row.getValue('created_time')).format('hh:mm:ss A')}
        </div>
      ),
    },
  ];

  const fetchCabinLov = async () => {
    try {
      const cabins = await cabinService.lov();
      if (cabins.data.success) {
        const additionalField: any = [
          {
            id: 'ALL',
            name: 'All',
          },
        ];
        const lov = cabins.data.data.map((el: any) => {
          return {
            name: el.cabinNumber,
            id: el.id,
          };
        });
        const combined: any = [...additionalField, ...lov];
        setCabinLov(combined);
      } else {
        console.log('error: ', cabins.data.message);
      }
    } catch (error: Error | unknown) {
      console.log('error: ', error);
    }
  };

  const fetchCabinHistory = async (qp: any) => {
    try {
      const cabinHistory = await cabinService.history(qp);
      if (cabinHistory.data.success) {
        setList(
          cabinHistory.data.data.data.details.map((detail: any) => ({
            ...detail,
            // cabin: qp.cabin,
          }))
        );
        setTotal(cabinHistory.data.data.total);
        setTime({
          totalAbsentTime: cabinHistory.data.data.data.totalAbsentTime,
          totalPresentTime: cabinHistory.data.data.data.totalPresentTime,
        });
        setIsLoader(false);
      } else {
        setIsLoader(false);
        console.log('error: ', cabinHistory.data.message);
      }
    } catch (error: Error | unknown) {
      setIsLoader(false);
      console.log('error: ', error);
    }
  };

  useEffect(() => {
    fetchCabinLov();
  }, []);

  const table = useReactTable({
    data: list ?? [],
    columns,
    getRowId: (row) => row.id,
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
      pagination: {
        pageSize: list?.length || 30,
        pageIndex: 0,
      },
    },
  });

  const handleDateRangeChange = useCallback(
    (startDate: string, endDate: string) => {
      const newPage = 0;
      table.setPageIndex(newPage);
      setPage(newPage);
      setSeletedDates({
        startDate,
        endDate,
      });
      const queryParams = {
        tenant: userDetails?.tenant,
        cabin: selectedCabin ? selectedCabin : state?.employeeData?.cabin,
        employee: state?.employeeData?.id,
        startDate,
        endDate,
        page: newPage,
        size: pageSize,
      };
      if (
        (selectedCabin || state?.employeeData?.cabin) &&
        startDate &&
        endDate
      ) {
        setIsLoader(true);
        fetchCabinHistory(queryParams);
      }
    },
    [selectedCabin]
  );

  const handlePageChange = async (newPage: any) => {
    table.setPageIndex(newPage);
    setPage(newPage);
    const queryParams = {
      tenant: userDetails?.tenant,
      cabin: selectedCabin ? selectedCabin : state?.employeeData?.cabin,
      employee: state?.employeeData?.id,
      startDate: selectedDates?.startDate,
      endDate: selectedDates?.endDate,
      page: newPage,
      size: pageSize,
    };
    setIsLoader(true);
    fetchCabinHistory(queryParams);
  };

  return (
    <div className="">
      <TopBar title={`${state?.employeeData?.name} Cabin History`} />
      <SidebarInset className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="w-full">
          <div className="flex items-center py-4 gap-4">
            <DatePickerWithRange onDateRangeChange={handleDateRangeChange} />
            <SingleSelectDropDown
              label="Cabins"
              placeHolder="Select Cabin"
              items={cabinLov ?? []}
              value={
                selectedCabin
                  ? selectedCabin
                  : state?.employeeData?.cabin !== null
                    ? state?.employeeData?.cabin
                    : ''
              }
              onChange={setSelectedCabin}
            />
          </div>
          <div className="rounded-md border">
            {isLoader ? (
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
                  {list?.length ? (
                    table.getRowModel().rows?.map((row) => (
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
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div>
                        Total Presence Time of Selected Dates:{' '}
                        {time?.totalPresentTime}
                      </div>
                      <div>
                        Total Absent Time of Selected Dates:{' '}
                        {time?.totalAbsentTime}{' '}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
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
    </div>
  );
};

export default EmployeeCabinHistory;
