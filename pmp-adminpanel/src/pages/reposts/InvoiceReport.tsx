import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TopBar } from '@/components/TopBar';
import { SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import invoiceService from '@/services/adminapp/invoice';

const InvoiceReport = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
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
      from_date: fromDate,
      to_date: toDate,
      status: statusFilter, // optional
    };

    const res = await invoiceService.getReport(payload);
    if (res?.data?.success) {
      const data = res.data.items;
      setReportList(data);
      const total = data.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
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
    const doc = new jsPDF();
    doc.text('Invoice Report', 14, 16);
    doc.autoTable({
      startY: 20,
      head: [['Invoice No', 'Date', 'Paid Amount']],
      body: reportList.map((inv) => [
        inv.invoice_no,
        inv.payment_date || inv.invoice_date,
        `₹ ${inv.paid_amount}`,
      ]),
    });
    doc.text(`Total Collection: ₹ ${totalPaid}`, 14, doc.lastAutoTable.finalY + 10);
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
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
          </select>
          <Button onClick={fetchReport}>Generate</Button>
          {reportList.length > 0 && (
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
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportList.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.invoice_no}</TableCell>
                      <TableCell>{inv.payment_date || inv.invoice_date}</TableCell>
                      <TableCell>₹ {inv.paid_amount}</TableCell>
                      <TableCell>{inv.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="text-right mt-4 font-semibold text-lg">
                Total Collection: ₹ {totalPaid}
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </div>
  );
};

export default InvoiceReport;
