import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import reportsService from '@/services/adminapp/reports';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoice = async () => {
    if (!invoiceId) {
      toast({ description: 'Invalid invoice ID.' });
      return;
    }
    setIsLoading(true);
    try {
      const res = await reportsService.getInvoiceDetail(invoiceId);
      if (res?.data?.success) {
        setInvoice(res.data.items);
      } else {
        toast({ description: 'Failed to fetch invoice.' });
      }
    } catch {
      toast({ description: 'Something went wrong.' });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
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
      if (invoice.tenant?.property_unit) {
        tenantY += 6;
        doc.text(
          `Property: ${invoice.tenant.property_unit.property?.name || 'N/A'}`,
          leftX,
          tenantY
        );
        tenantY += 6;
        doc.text(
          `Unit No: ${invoice.tenant.property_unit.unit_no || 'N/A'}`,
          leftX,
          tenantY
        );
      }
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

    // Payment Items Table starts below the taller block (invoice or tenant)
    // const tableStartY = Math.max(y, tenantY) + 12;

    // doc.autoTable({
    //   startY: tableStartY,
    //   head: [['Description', 'Payment Date', 'Method', 'Status', 'Amount']],
    //   body: invoice.items?.map((item: any) => [
    //     item.description,
    //     item.payment_date || '—',
    //     item.payment_method,
    //     item.status,
    //     'pending',
    //     item.amount,
    //   ]),
    //   theme: 'grid',
    //   styles: {
    //     fontSize: 10,
    //     cellPadding: 3,
    //     lineColor: [100, 100, 100], // medium dark border
    //     lineWidth: 0.2,
    //   },
    //   headStyles: {
    //     fillColor: [240, 240, 240],
    //     textColor: [0, 0, 0],
    //     lineColor: [100, 100, 100],
    //     lineWidth: 0.2,
    //     fontStyle: 'bold',
    //   },
    //   footStyles: {
    //     fillColor: [230, 230, 230],
    //     textColor: [0, 0, 0],
    //     fontStyle: 'bold',
    //     lineColor: [100, 100, 100],
    //     lineWidth: 0.2,
    //   },
    //   foot: [
    //     [
    //       { content: 'Total:', colSpan: 4, styles: { halign: 'right' } },
    //       {
    //         content: invoice.total_amount.toString(),
    //       },
    //     ],
    //   ],
    //   // columnStyles: {
    //   //   3: { halign: 'right' },
    //   //   2: { halign: 'center' },
    //   //   1: { halign: 'center' },
    //   // },
    // });

    doc.save(`invoice_${invoice.invoice_no}.pdf`);
  };

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Invoice Detail</h2>
        <Button variant="outline" onClick={downloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
      {/* Header Info + Tenant Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        {/* Right: Tenant Info */}
        <div className="space-y-1">
          <h3 className="font-medium">Tenant Details</h3>
          {invoice.tenant?.user ? (
            <div className="space-y-1">
              <div>
                <strong>Name:</strong> {invoice.tenant.user.fname}{' '}
                {invoice.tenant.user.lname}
              </div>
              <div>
                <strong>Email:</strong> {invoice.tenant.user.email}
              </div>
              <div>
                <strong>Phone:</strong> {invoice.tenant.user.phone}
              </div>
              <div>
                <strong>Contract No:</strong>{' '}
                {invoice.tenant.contract_number || 'N/A'}
              </div>
              {invoice.tenant.property_unit && (
                <>
                  <div>
                    <strong>Property:</strong>{' '}
                    {invoice.tenant.property_unit.property?.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Unit No:</strong>{' '}
                    {invoice.tenant.property_unit.unit_no}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div>No tenant info.</div>
          )}
        </div>
        {/* Left: Invoice Info */}
        <div className="space-y-2">
          <div className="">
            <div>
              <strong>Invoice No:</strong> {invoice.invoice_no}
            </div>
            <div>
              <strong>Invoice Date:</strong> {invoice.invoice_date}
            </div>
            <div>
              <strong>Due Date:</strong> {invoice.due_date}
            </div>
            <div>
              <strong>Status:</strong> {invoice.status}
            </div>
            <div>
              <strong>Total Amount:</strong> {invoice.total_amount}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Items Table */}
      {/* <div className="mt-4 border-t pt-4">
        <h3 className="font-medium text-sm mb-2">Payment Items</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Payment Date</th>
              <th className="p-2 border">Payment Method</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: any) => (
              <tr key={item.id}>
                <td className="p-2 border">{item.description}</td>
                <td className="p-2 border">{item.payment_date || '—'}</td>
                <td className="p-2 border capitalize">{item.payment_method}</td>
                <td className="p-2 border capitalize">{item.status}</td>
                <td className="p-2 border ">{item.amount}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="p-2 border font-semibold text-right" colSpan={4}>
                Total
              </td>
              <td className="p-2 border font-semibold">
                {invoice.total_amount}
              </td>
            </tr>
          </tfoot>
        </table>
      </div> */}
    </Card>
  );
};

export default InvoiceDetail;
