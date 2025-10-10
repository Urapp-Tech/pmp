import React, { useMemo, useState } from 'react';
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
import { SidebarInset } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import reportsService from '@/services/adminapp/reports';
import { getItem } from '@/utils/storage';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import assets from '@/assets/images';

const InvoiceReport = () => {
  const navigate = useNavigate();
  const userDetails: any = getItem('USER');
  const [fromDate, setFromDate] = useState(
    dayjs().subtract(6, 'month').format('YYYY-MM-DD')
  );
  const [toDate, setToDate] = useState(
    dayjs().add(6, 'month').format('YYYY-MM-DD')
  );
  const [statusFilter, setStatusFilter] = useState('paid');
  const [reportList, setReportList] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const COLORS = {
    navy: '#242460',
    mint: '#5EBFA1',
    sheet: '#ffffff',
    page: '#F3F4F6',
    lines: '#242460',
    white: '#ffffff',
  };

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
        user_id: userDetails?.id,
        role_id: userDetails?.role?.name, // "Landlord" | "Manager" | "User"
        from_date: from,
        to_date: to,
        status: statusFilter,
      };

      const res = await reportsService.getReport(payload);
      if (res?.data?.success) {
        const data = res.data.items || [];
        setReportList(data);

        // backend also returns total_paid, but keep local calc consistent with UI
        const total = data.reduce(
          (sum: number, inv: any) =>
            sum + Math.floor(Number(inv.total_amount) || 0),
          0
        );
        setTotalPaid(total);
      } else {
        toast({ description: res?.data?.message || 'Failed to fetch report' });
      }
    } catch {
      toast({ description: 'Something went wrong while fetching report.' });
    } finally {
      setIsLoading(false);
    }
  };

  const currency = useMemo(() => 'KWD', []);
  const fmt = (v?: string | number, cur?: string) => {
    const n = Number(v ?? 0);
    return `${n.toLocaleString()} ${cur ?? ''}`.trim();
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
          'Tenant (Contract)',
          'Property',
          'Unit No',
          'Payment Date',
          'Paid Amount',
        ],
      ],
      body: reportList.map((inv: any) => {
        const pd = inv.property_details || {};
        const pay = inv.payment_details || {};
        const name = pd.assigned_user_name || 'N/A';
        const contract = pd.contract_no || 'N/A';
        return [
          inv.invoice_no || '—',
          `${name}\n(${contract})`,
          pd.property_name || 'N/A',
          pd.unit_no || 'N/A',
          pay.payment_date || inv.invoice_date || 'N/A',
          `${inv.paid_amount ?? inv.total_amount ?? 0}`,
        ];
      }),
      styles: {
        overflow: 'linebreak',
        fontSize: 9,
        cellPadding: 2,
        minCellHeight: 14,
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 45 }, // wider to fit 2 lines
        2: { cellWidth: 'auto' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' },
      },
    });

    // Footer: Total Collection
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total Collection:  ${totalPaid}`,
      14,
      (doc.lastAutoTable?.finalY || 20) + 10
    );

    doc.save('invoice_report.pdf');
  };

  // >>> Drop-in replacement <<<
  const downloadSpecificPDF = async (invoice: any) => {
    if (!invoice) return;

    const doc = new jsPDF('p', 'pt', 'a4'); // 595 x 842
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // ---- palette
    const COLORS = { navy: '#242460', mint: '#5EBFA1', sheet: '#FFFFFF' };

    // ---- page metrics
    const MARGIN_L = 40;
    const MARGIN_R = 40;
    const CONTENT_W = W - MARGIN_L - MARGIN_R;

    // ---- HEADER with banner
    const HEADER_H = 120;
    doc.setFillColor(COLORS.sheet);
    doc.rect(0, 0, W, HEADER_H, 'F');

    const loadImg = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = src as any;
      });

    try {
      const banner = await loadImg(assets.images.bgBanner as any);
      const maxW = W;
      const ratio = banner.height / banner.width;
      const drawW = maxW;
      const drawH = Math.min(HEADER_H, drawW * ratio);
      const yCentered = HEADER_H / 2 - drawH / 2;
      doc.addImage(
        banner,
        'PNG',
        0,
        yCentered,
        drawW,
        drawH,
        undefined,
        'NONE'
      );
    } catch {
      /* no-op */
    }

    // top title baseline
    const TITLE_Y = HEADER_H + 36;

    // ---- TITLES
    doc.setTextColor(COLORS.mint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PROPERTY RENT', MARGIN_L, TITLE_Y);

    doc.setTextColor(COLORS.navy);
    doc.setFontSize(28);
    doc.text('INVOICE', MARGIN_L, TITLE_Y + 26);

    // right aligned invoice amount
    const rightEdge = W - MARGIN_R;
    doc.setTextColor(COLORS.mint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('INVOICE AMOUNT', rightEdge, TITLE_Y, { align: 'right' });

    doc.setTextColor(COLORS.navy);
    doc.setFontSize(14);
    const currency = invoice?.currency || 'KWD';
    const fmt = (v?: string | number, cur?: string) => {
      const n = Number(v ?? 0);
      return `${n.toLocaleString()} ${cur ?? ''}`.trim();
    };
    doc.text(fmt(invoice?.total_amount, currency), rightEdge, TITLE_Y + 22, {
      align: 'right',
    });

    // ---- THREE COLUMNS (with gutter)
    const GUTTER = 26; // <- spacing between columns
    const COL_W = (CONTENT_W - GUTTER * 2) / 3;
    const COL1_X = MARGIN_L;
    const COL2_X = MARGIN_L + COL_W + GUTTER;
    const COL3_X = MARGIN_L + (COL_W + GUTTER) * 2;

    // headings row
    let y = TITLE_Y + 66;

    const heading = (label: string, x: number) => {
      doc.setTextColor(COLORS.navy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(label, x, y);
    };

    heading('INVOICE DETAILS', COL1_X);
    heading('PROPERTY DETAILS', COL2_X);
    heading('TENANT DETAILS', COL3_X);

    // extra gap under each heading for clarity
    y += 26;

    // helpers
    const ROW_H = 16;
    const LBL_W = 96;

    // Column 1: invoice details
    const invDate = invoice?.invoice_date
      ? String(invoice.invoice_date).slice(0, 10)
      : '—';
    const validDate = invoice?.due_date
      ? String(invoice.due_date).slice(0, 10)
      : '—';
    let y1 = y;

    const rowC1 = (label: string, value: string) => {
      doc.setFontSize(10);
      doc.setTextColor(COLORS.navy);
      doc.setFont('helvetica', 'bold');
      doc.text(label, COL1_X, y1);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', COL1_X + LBL_W + 8, y1);
      y1 += ROW_H;
    };

    rowC1('INV#', invoice?.invoice_no ?? '—');
    rowC1('DATE', invDate);
    rowC1('VALID DATE', validDate);
    rowC1('Contract#', invoice?.property_details?.contract_no ?? '—');
    rowC1('AMOUNT', fmt(invoice?.total_amount, currency));

    // Column 2: property details
    let y2 = y;
    const pd = invoice?.property_details || {};

    const rowC2 = (label: string, value: string) => {
      doc.setFontSize(10);
      doc.setTextColor(COLORS.navy);
      doc.setFont('helvetica', 'bold');
      doc.text(label, COL2_X, y2);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', COL2_X + LBL_W + 8, y2);
      y2 += ROW_H;
    };

    rowC2('PROPERTY', pd.property_name ?? '—');
    rowC2('ADDRESS', pd.property_address ?? '—');
    rowC2('UNIT NAME', pd.unit_name ?? '—');
    rowC2('UNIT NO.', pd.unit_no ?? '—');
    rowC2('OWNER', pd.unit_owner ?? '—');
    rowC2('LEASE ID', pd.lease_id ?? '—');
    rowC2('CONTRACT#', pd.contract_no ?? '—');
    rowC2('ASSIGNED USER', pd.assigned_user_name ?? '—');

    // Column 3: tenant details
    let y3 = y;
    const tenantName = pd.assigned_user_name || '—';
    const legalCase = invoice?.tenant?.legal_case === true ? 'YES' : 'NO';

    const rowC3 = (label: string, value: string) => {
      doc.setFontSize(10);
      doc.setTextColor(COLORS.navy);
      doc.setFont('helvetica', 'bold');
      doc.text(label, COL3_X, y3);
      doc.setFont('helvetica', 'normal');
      doc.text(value || '—', COL3_X + LBL_W + 8, y3);
      y3 += ROW_H;
    };

    rowC3('TENANT', tenantName);
    rowC3('LEGAL CASE', legalCase);

    // move baseline past the tallest column
    const sectionBottom = Math.max(y1, y2, y3) + 10;

    // ---- TABLE HEADER (Unit/Rent/Maintenance/Price)
    const tLeft = MARGIN_L;
    const tRight = W - MARGIN_R;
    let ty = sectionBottom + 12;

    doc.setFillColor(COLORS.navy);
    doc.setTextColor('#FFFFFF');
    doc.rect(tLeft, ty, tRight - tLeft, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    const colXs = [tLeft + 14, tLeft + 180, tLeft + 320, tRight - 90];
    ['UNIT', 'RENT', 'MAINTENANCE', 'PRICE'].forEach((h, i) =>
      doc.text(h, colXs[i], ty + 17)
    );

    // single data row
    ty += 26 + 22; // gap under header
    doc.setTextColor(COLORS.navy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const unitNo = pd.unit_no ?? '—';
    const unitRent = invoice?.total_amount ?? 0;
    const maintenance = '—';
    const price = invoice?.total_amount ?? 0;

    doc.text(String(unitNo), colXs[0], ty);
    doc.text(fmt(unitRent, currency), colXs[1], ty);
    doc.text(String(maintenance), colXs[2], ty);
    doc.text(fmt(price, currency), colXs[3], ty);

    // soft underlines
    const lineYs = [ty + 10, ty + 46, ty + 82];
    doc.setDrawColor(COLORS.navy);
    doc.setLineWidth(0.6);
    lineYs.forEach((ly) => doc.line(tLeft, ly, tRight, ly));

    // ---- TOTAL chip
    const totalBoxW = 160;
    const totalBoxH = 30;
    const totalX = tRight - totalBoxW;
    const totalY = lineYs[2] + 20;

    doc.setFillColor(COLORS.navy);
    doc.rect(totalX, totalY, totalBoxW, totalBoxH, 'F');

    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL   ${fmt(price, currency)}`, totalX + 16, totalY + 20);

    // ---- PAYMENT DETAILS
    const pay = invoice?.payment_details || {};
    let py = totalY + totalBoxH + 30; // extra gap above heading

    doc.setTextColor(COLORS.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PAYMENT DETAILS', MARGIN_L, py);

    py += 24; // gap under heading
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const payRows: Array<[string, string]> = [
      [
        'Payment Date',
        pay.payment_date ? String(pay.payment_date).slice(0, 10) : '—',
      ],
      ['Payment Method', pay.payment_method || '—'],
      ['Payment ID', pay.payment_id ? String(pay.payment_id) : '—'],
      ['Reference ID', pay.reference_id || '—'],
      ['Invoiced Amount', fmt(pay.invoiced_amount, currency)],
      ['Total Paid Amount', fmt(pay.total_paid_amount, currency)],
    ];

    payRows.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${k}:`, MARGIN_L, py);
      doc.setFont('helvetica', 'normal');
      doc.text(v, MARGIN_L + 130, py);
      py += 16;
    });

    // ---- Terms
    const termsY = Math.min(H - 90, py + 24);
    doc.setTextColor(COLORS.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Terms & Conditions', MARGIN_L, termsY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      'Payment should be paid within the valid date.',
      MARGIN_L,
      termsY + 18
    );

    // save
    doc.save(`invoice_${invoice.invoice_no || 'detail'}.pdf`);
  };

  return (
    <div className="p-4 mt-5">
      <SidebarInset className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex gap-4 flex-wrap items-center justify-between">
          <h2 className="text-primary-bg font-semibold text-3xl leading-normal capitalize">
            RECEIPTS
          </h2>
          <div className="flex gap-4 flex-wrap items-center">
            {/* From date */}
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
                  </TableRow>
                </TableHeader>
                <TableBody className="!bg-bodyBackground [&_tr]:border-b [&_tr]:border-b-primary-bg [&_tr:last-child]:border-b-0 border-2 border-primary-bg">
                  {reportList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-4 text-primary-bg"
                      >
                        No invoices found for selected filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportList.map((inv: any) => {
                      const pd = inv.property_details || {};
                      const pay = inv.payment_details || {};
                      return (
                        <TableRow key={inv.invoice_id}>
                          <TableCell>
                            <span
                              className="text-scrollbar underline cursor-pointer"
                              onClick={() =>
                                navigate(
                                  `/admin-panel/invoices/detail/${inv.invoice_id}`
                                )
                              }
                            >
                              {inv.invoice_no}
                            </span>
                          </TableCell>

                          <TableCell>
                            {pd.assigned_user_name && (
                              <div className="text-sm font-semibold text-gray-800 leading-tight">
                                {pd.assigned_user_name}
                              </div>
                            )}
                            {pd.contract_no && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                ({pd.contract_no})
                              </div>
                            )}
                          </TableCell>

                          <TableCell>{pd.property_name || 'N/A'}</TableCell>
                          <TableCell>{pd.unit_no || 'N/A'}</TableCell>
                          <TableCell>{inv.invoice_date || '—'}</TableCell>
                          <TableCell>{pay.payment_date || '—'}</TableCell>
                          <TableCell>{pay.payment_method || '—'}</TableCell>
                          <TableCell>{inv.paid_amount ?? 0}</TableCell>

                          <TableCell className="sm:mt-6 2xl:mt-0 mx-3">
                            <img
                              onClick={() => downloadSpecificPDF(inv)}
                              src={assets.images.download}
                              className="text-primary-bg cursor-pointer h-6 w-6"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>

              <div className="text-right text-primary-bg mt-4 font-semibold text-lg">
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
