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

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      toast({ description: 'Please select both From and To dates.' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        id: userDetails.id,
        role: userDetails.role.name,
        from_date: fromDate,
        to_date: toDate,
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
    doc.text('Invoice Report', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Invoice No','Contract no', 'Date', 'Paid Amount']],
      body: reportList?.map((inv: any) => [
        inv.invoice_no,
        inv.tenant.contract_number || 'N/A',
        inv.payment_date || inv.invoice_date,
        ` ${inv.total_amount}`,
      ]),
    });
    doc.text(
      `Total Collection:  ${totalPaid}`,
      14,
      doc.lastAutoTable.finalY + 10
    );
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
          <Button onClick={fetchReport}>Generate</Button>
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
                    <TableHead>Contract No</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
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
    onClick={() =>  navigate(`/admin-panel/invoices/detail/${inv.id}`)}
  >
    {inv.invoice_no}
  </span>
</TableCell>
                        <TableCell>
                          {inv.tenant.contract_number || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {inv.invoice_date || inv.invoice_date}
                        </TableCell>
                        <TableCell> {inv.total_amount || 0}</TableCell>
                        <TableCell>{inv.status}</TableCell>
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
