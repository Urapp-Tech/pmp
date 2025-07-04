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
    try {
      const payload = {
        id: userDetails.id,
        role: userDetails.role.name,
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
    } catch (err) {
      toast({ description: 'Something went wrong while fetching report.' });
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="bg-white p-4 rounded shadow mt-5">
      <TopBar title="Invoice Report" />
      <SidebarInset className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex gap-4 flex-wrap items-end">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-[200px]"
            placeholder="From date"
          />
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-[200px]"
            placeholder="To date"
          />
          <Button
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
          <Button onClick={() => fetchReport()}>Generate</Button>
          {reportList?.length > 0 && (
            <Button variant="outline" onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          )}
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Unit No</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                            className="text-blue-600 underline cursor-pointer"
                            onClick={() =>
                              navigate(`/admin-panel/invoices/detail/${inv.id}`)
                            }
                          >
                            {inv.invoice_no}
                          </span>
                        </TableCell>
                        <TableCell>
                          {inv.tenant?.user?.fname &&
                            inv.tenant?.user?.lname && (
                              <div className="text-sm font-semibold text-gray-800 leading-tight">
                                {inv.tenant.user.fname} {inv.tenant.user.lname}
                              </div>
                            )}
                          {inv.tenant?.contract_number && (
                            <div className="text-xs text-gray-500 mt-0.5">
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
                        <TableCell>{inv.total_amount || 0}</TableCell>
                        {/* <TableCell>{inv.status || 'N/A'}</TableCell> */}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div className="text-right mt-4 font-semibold text-lg">
                Total Collection: {totalPaid}
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </div>
  );
};

export default InvoiceReport;
