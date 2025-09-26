import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TopBar } from '@/components/TopBar';
import { SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import reportsService from '@/services/adminapp/reports';
import { getItem } from '@/utils/storage';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import assets from '@/assets/images';

/**
 * InvoiceReport
 *
 * A React component that generates an invoice report based on the date range and
 * status filter selected by the user. The component fetches the report data from
 * the server and displays it in a table. The user can also download the report as
 * a PDF file.
 *
 * @param {object} props Component props
 * @returns {React.ReactElement} The rendered component
 */
const InvoiceReport = () => {
  const navigate = useNavigate();
  const userDetails: any = getItem('USER');
  const [fromDate, setFromDate] = useState(
    dayjs().subtract(6, 'month').format('YYYY-MM-DD')
  );
  const [toDate, setToDate] = useState(
    dayjs().add(6, 'month').format('YYYY-MM-DD')
  );
  const [statusFilter, setStatusFilter] = useState('paid'); // Default to 'paid'
  const [reportList, setReportList] = useState([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchReport = async (customFrom?: string, customTo?: string) => {
    const from = customFrom || fromDate;
    const to = customTo || toDate;

    if (!from || !to) {
      toast({ description: 'Please select both From and To dates.' });
      return;
    }

    setIsLoading(true);
    // try {
    const payload = {
      id: userDetails.id,
      role: 'super admin',
      from_date: from,
      to_date: to,
      status: statusFilter, // optional
    };

    const res = await reportsService.getReport(payload);
    if (res?.data?.success) {
      const data = res.data.items;
      setReportList(data);
      const total = data.reduce(
        (sum: number, inv: any) =>
          sum + Math.floor(Number(inv.total_amount) || 0),
        0
      );
      setTotalPaid(total);
    } else {
      toast({ description: res.data.message || 'Failed to fetch report' });
    }
    // } catch (err) {
    //   toast({ description: 'Something went wrong while fetching report.' });
    // } finally {
    setIsLoading(false);
    // }
  };

  const downloadPDF = () => {
    const doc: any = new jsPDF();

    // Title
    doc.setFontSize(14);
    doc.text('Receipts', 14, 16);

    doc.autoTable({
      startY: 20,
      head: [
        [
          'Invoice No',
          'Tenant',
          'Property',
          'Unit No',
          'Payment Date',
          'Paid Amount',
        ],
      ],

      body: reportList?.map((inv: any) => {
        const fullName =
          `${inv.tenant?.user?.fname || ''} ${inv.tenant?.user?.lname || ''}`.trim();
        const contractNo = inv.tenant?.contract_number || 'N/A';

        return [
          inv.invoice_no,
          { fullName, contractNo }, // 💡 Custom object
          inv.tenant?.property_unit?.property?.name || 'N/A',
          inv.tenant?.property_unit?.unit_no || 'N/A',
          inv.payment_date || inv.invoice_date || 'N/A',
          `${inv.total_amount || '0'}`,
        ];
      }),

      styles: {
        overflow: 'linebreak',
        fontSize: 9,
        cellPadding: 2,
        minCellHeight: 14, // ✅ Ensures enough space for two lines
      },

      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 35 }, // ✅ Widen tenant column to prevent cut
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
      },

      didParseCell(data: any) {
        if (data.section === 'body' && data.column.index === 1) {
          data.row.height = 16; // ✅ Make room for 2-line tenant data
          data.cell.text = ['']; // Hide default text
        }
      },

      didDrawCell(data: any) {
        if (data.section === 'body' && data.column.index === 1) {
          const doc = data.doc;
          const tenant = data.cell.raw || { fullName: '', contractNo: '' };
          const x = data.cell.x + 2;
          const y = data.cell.y + 5;

          // Line 1: Full Name
          doc.setFontSize(9.5);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20);
          doc.text(tenant.fullName, x, y);

          // Line 2: Contract No
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(120);
          doc.text(`(${tenant.contractNo})`, x, y + 5);
        }
      },
    });

    // Footer: Total Collection
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total Collection:  ${totalPaid}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    // Save file
    doc.save('invoice_report.pdf');
  };

  const downloadSpecificPDF = (invoice: any) => {
    const doc: any = new jsPDF();

    doc.setFontSize(16);
    doc.text('Invoice Detail', 14, 16);

    doc.setFontSize(12);
    // Tenant Details - LEFT side
    const leftX = 14;
    let tenantY = 28;
    doc.setFontSize(12);
    doc.text('Tenant Details:', leftX, tenantY);
    tenantY += 7;
    doc.setFontSize(11);
    if (invoice.tenant?.user) {
      doc.text(
        `Name: ${invoice.tenant.user.fname} ${invoice.tenant.user.lname}`,
        leftX,
        tenantY
      );
      tenantY += 6;
      doc.text(`Email: ${invoice.tenant.user.email}`, leftX, tenantY);
      tenantY += 6;
      doc.text(`Phone: ${invoice.tenant.user.phone}`, leftX, tenantY);
      tenantY += 6;
      doc.text(
        `Contract No: ${invoice.tenant.contract_number || 'N/A'}`,
        leftX,
        tenantY
      );
    } else {
      doc.text('No tenant info.', leftX, tenantY);
    }

    // Invoice Info - RIGHT side
    const rightX = 110;
    let y = 20;
    doc.setFontSize(12);
    y += 7;
    doc.setFontSize(11);
    doc.text(`Invoice No: ${invoice.invoice_no}`, rightX, y);
    y += 6;
    doc.text(`Invoice Date: ${invoice.invoice_date}`, rightX, y);
    y += 6;
    doc.text(`Due Date: ${invoice.due_date}`, rightX, y);
    y += 6;
    doc.text(`Status: ${invoice.status}`, rightX, y);
    y += 6;
    doc.text(`Total Amount: ${invoice.total_amount.toString()}`, rightX, y);

    doc.save(`invoice_${invoice.invoice_no}.pdf`);
  };

  return (
    <div className="p-2 mt-5">
      <SidebarInset className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex gap-4 flex-wrap items-center justify-between">
          <h2 className="text-primary-bg font-semibold text-[33px] leading-normal capitalize">
            RECEIPTS
          </h2>
          <div className="flex gap-4 flex-wrap items-center">
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
            {/* <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[200px] border-primary-bg"
              placeholder="From date"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[200px] border-primary-bg"
              placeholder="To date"
            /> */}
            <Button
              className="border-primary-bg"
              variant="outline"
              onClick={() => {
                const start = dayjs().startOf('month').format('YYYY-MM-DD');
                const end = dayjs().endOf('month').format('YYYY-MM-DD');
                setFromDate(start);
                setToDate(end);

                fetchReport(start, end);
              }}
            >
              Current Month
            </Button>
            <Button
              variant="outline"
              className="bg-primary-bg text-white"
              onClick={() => {
                const start = dayjs()
                  .subtract(1, 'month')
                  .startOf('month')
                  .format('YYYY-MM-DD');
                const end = dayjs()
                  .subtract(1, 'month')
                  .endOf('month')
                  .format('YYYY-MM-DD');
                setFromDate(start);
                setToDate(end);
                // setStatusFilter('paid');
                fetchReport(start, end);
              }}
            >
              Previous Month
            </Button>
            <Button
              onClick={() => fetchReport()}
              className="bg-primary-bg text-white"
            >
              Generate
            </Button>
            {reportList?.length > 0 && (
              <Button
                variant="outline"
                className="bg-primary-bg text-white"
                onClick={downloadPDF}
              >
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader className="[&_tr]:border-b-2 [&_tr]:border-b-primary-bg">
                  <TableRow className="!border-b-2 !border-b-[#242460]">
                    <TableHead>RECEIPT NO.</TableHead>
                    <TableHead>TENANT</TableHead>
                    <TableHead>PROPERTY</TableHead>
                    <TableHead>UNIT NO.</TableHead>
                    <TableHead>INVOICE DATE</TableHead>
                    <TableHead>PAYMENT DATE</TableHead>
                    <TableHead>PAYMENT METHOD</TableHead>
                    <TableHead>PAID AMOUNT</TableHead>
                    <TableHead>DOWNLOAD</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody className="!bg-bodyBackground [&_tr]:border-b [&_tr]:border-b-primary-bg [&_tr:last-child]:border-b-0 border-2 border-primary-bg !text-light !text-primary-bg">
                  {reportList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-4 text-gray-500"
                      >
                        No invoices found for selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportList?.map((inv: any) => (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <span
                            className="text-scrollbar underline cursor-pointer"
                            onClick={() =>
                              navigate(`/super-admin/invoices/detail/${inv.id}`)
                            }
                          >
                            {inv.invoice_no}
                          </span>
                        </TableCell>
                        <TableCell>
                          {inv.tenant?.user?.fname &&
                            inv.tenant?.user?.lname && (
                              <div className="text-sm font-semibold text-primary-bg leading-tight">
                                {inv.tenant.user.fname} {inv.tenant.user.lname}
                              </div>
                            )}
                          {inv.tenant?.contract_number && (
                            <div className="text-xs text-primary-bg mt-0.5">
                              ({inv.tenant.contract_number})
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          {inv.tenant?.property_unit?.property?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {inv.tenant?.property_unit?.unit_no || 'N/A'}
                        </TableCell>
                        <TableCell>{inv.invoice_date || '—'}</TableCell>
                        <TableCell>{inv.payment_date || '—'}</TableCell>
                        <TableCell>{inv.payment_method || '—'}</TableCell>
                        <TableCell>{inv.total_amount || 0}</TableCell>
                        <TableCell className="flex items-end mt-6 justify-center">
                          {' '}
                          <img
                            onClick={() => downloadSpecificPDF(inv)}
                            src={assets.images.download}
                            className="text-primary-bg cursor-pointer h-6 w-6"
                          />
                          {/* <Download
                            onClick={() => downloadSpecificPDF(inv)}
                            className="w-6 cursor-pointer h-6 text-center text-primary-bg"
                          /> */}
                        </TableCell>
                        {/* <TableCell>{inv.status || 'N/A'}</TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="text-right text-primary-bg mt-4 font-semibold text-lg">
                Total Collection:{' '}
                <span className="text-primary-bg">{totalPaid}</span>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </div>
  );
};

export default InvoiceReport;
