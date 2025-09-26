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

  const currency = useMemo(() => 'KWD', []);

  const fmt = (v?: string | number, currency?: string) => {
    const n = Number(v ?? 0);
    return `${n.toLocaleString()} ${currency ?? ''}`.trim();
  };

  const downloadSpecificPDF = async (invoice: any) => {
    if (!invoice) return;

    const doc = new jsPDF('p', 'pt', 'a4'); // 595 x 842
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // ---- layout constants
    const MARGIN_L = 40;
    const MARGIN_R = 40;
    const CONTENT_W = W - MARGIN_L - MARGIN_R;

    const HEADER_H = 160; // taller header band
    // const CUT_R = 220; // big rounded-br radius (≈ rounded-br-[20rem])
    const TITLE_Y = HEADER_H + 40;

    // ---------------- Header (navy) with only bottom-right rounded
    doc.setFillColor(COLORS.white);
    doc.rect(0, 0, W, HEADER_H, 'F');

    // 20rem radius in PDF points (1rem≈16px, 1px≈72/96 pt => 0.75pt)
    const PT_PER_PX = 72 / 96;
    const CUT_R = 0; // 20rem → 320px → 240pt

    // Clip to the header band so the cut doesn't spill below it
    doc.saveGraphicsState();
    doc.rect(-1, HEADER_H - 1, W + 2, 2, 'F');
    (doc as any).clip(); // use current path as clip; TS may need cast

    // "Cut" the bottom-right corner with a white quarter circle.
    // Center at (pageRight, headerBottom) so only the bottom-right is rounded.
    doc.setFillColor(COLORS.sheet);
    // doc.circle(W, HEADER_H, CUT_R, 'F');
    doc.circle(W - CUT_R, HEADER_H - CUT_R, CUT_R, 'F');

    doc.restoreGraphicsState();

    // ---------------- High-quality logo (no pixelation)
    // Draw at or below the image’s natural resolution + disable compression.
    const loadImg = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.crossOrigin = 'anonymous';
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = src as any;
      });

    try {
      const logo = await loadImg(assets.images.bgBanner as any);
      const iw = 1500;
      const ih = 400;

      // Never upscale (that causes blur). Cap to a sensible max width for the header.
      const MAX_W = 596; // adjust if you want it larger/smaller
      const drawW = Math.min(MAX_W, iw);
      const drawH = ih * (drawW / iw);

      // Vertically center the logo inside the navy band
      const logoX = 0;
      const logoY = HEADER_H / 2 - drawH / 2;

      // Use 'NONE' compression for best sharpness
      doc.addImage(logo, 'PNG', logoX, logoY, drawW, drawH, undefined, 'NONE');
    } catch {
      // ignore logo errors
    }

    // ---------------- Titles
    doc.setTextColor(COLORS.mint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PROPERTY RENT', MARGIN_L, TITLE_Y);

    doc.setTextColor(COLORS.navy);
    doc.setFontSize(28);
    doc.text('INVOICE', MARGIN_L, TITLE_Y + 25);

    // Right-aligned amount block
    const rightEdge = W - MARGIN_R;
    doc.setTextColor(COLORS.mint);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INVOICE AMOUNT', rightEdge, TITLE_Y, { align: 'right' });

    doc.setTextColor(COLORS.navy);
    doc.setFontSize(14);
    doc.text(
      `${fmt(invoice.total_amount, currency)}`,
      rightEdge,
      TITLE_Y + 25,
      { align: 'right' }
    );

    // ---------------- Three-column info blocks
    const COL_W = CONTENT_W / 2;
    const COL1_X = MARGIN_L;
    const COL2_X = MARGIN_L + COL_W;
    const COL3_X = MARGIN_L + COL_W * 1.5;
    const BASE_Y = TITLE_Y + 60;

    doc.setTextColor(COLORS.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('INVOICE DETAILS', COL1_X, BASE_Y);
    doc.text('OWNER NAME', COL2_X, BASE_Y);
    doc.text('TENANT NAME', COL3_X, BASE_Y);

    // Left: labels + values aligned
    const LBL_W = 90;
    let y = BASE_Y + 20;
    const leftRows: Array<[string, string]> = [
      ['INV#', `${invoice.invoice_no ?? '—'}`],
      ['DATE', `${invoice.invoice_date ?? '—'}`],
      ['VALID DATE', `${invoice.due_date ?? '—'}`],
      ['FINAL AMOUNT', `${fmt(invoice.total_amount, currency)}`],
    ];
    doc.setFontSize(10);
    leftRows.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(k, COL1_X, y);
      doc.setFont('helvetica', 'normal');
      doc.text(v, COL1_X + LBL_W + 10, y);
      y += 16;
    });

    // Middle: owner
    const ownerName = (() => {
      const u = invoice?.landlord?.user;
      return u
        ? `${u.fname ?? ''} ${u.lname ?? ''}`.trim()
        : invoice?.tenant?.property_unit?.property?.name || '—';
    })();
    const ownerContact = (() => {
      const u = invoice?.landlord?.user;
      const bits = [u?.email, u?.phone].filter(Boolean) as string[];
      return bits.length ? bits.join(' | ') : '—';
    })();

    doc.setFont('helvetica', 'bold');
    doc.text(ownerName, COL2_X, BASE_Y + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(ownerContact, COL2_X, BASE_Y + 36);

    // Right: tenant (wrap within col width)
    const tenantUser = invoice?.tenant?.user;
    const tenantName = tenantUser
      ? `${tenantUser.fname ?? ''} ${tenantUser.lname ?? ''}`.trim()
      : '—';
    const tenantContactRaw =
      [tenantUser?.email, tenantUser?.phone].filter(Boolean).join(' | ') || '—';
    const tenantWrapped = doc.splitTextToSize(tenantContactRaw, COL_W - 4);

    doc.setFont('helvetica', 'bold');
    doc.text(tenantName, COL3_X, BASE_Y + 20);
    doc.setFont('helvetica', 'normal');
    doc.text(tenantWrapped, COL3_X, BASE_Y + 36);

    // ---------------- Table header
    const tLeft = MARGIN_L;
    const tRight = W - MARGIN_R;
    let ty = BASE_Y + 80;

    doc.setFillColor(COLORS.navy);
    doc.setTextColor('#FFFFFF');
    doc.rect(tLeft, ty, tRight - tLeft, 26, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    const colXs = [tLeft + 14, tLeft + 180, tLeft + 290, tRight - 90];
    ['UNIT', 'RENT', 'MAINTAINANCE', 'PRICE'].forEach((h, i) =>
      doc.text(h, colXs[i], ty + 17)
    );

    // Row + underlines (same as before)
    ty += 26 + 24;
    doc.setTextColor(COLORS.navy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    const unitNo = invoice?.tenant?.property_unit?.unit_no ?? '—';
    const unitRent = invoice?.tenant?.property_unit?.rent ?? '—';
    const maintenance = '—';
    const price = invoice?.total_amount ?? '—';

    doc.text(String(unitNo), colXs[0], ty);
    doc.text(fmt(unitRent, invoice?.currency || 'KWD'), colXs[1], ty);
    doc.text(String(maintenance), colXs[2], ty);
    doc.text(fmt(price, invoice?.currency || 'KWD'), colXs[3], ty);

    const lineYs = [ty + 12, ty + 56, ty + 100];
    doc.setDrawColor(COLORS.navy);
    doc.setLineWidth(0.6);
    lineYs.forEach((ly) => doc.line(tLeft, ly, tRight, ly));

    // TOTAL chip
    const totalBoxW = 150;
    const totalBoxH = 28;
    const totalX = tRight - totalBoxW;
    const totalY = lineYs[2] + 24;
    doc.setFillColor(COLORS.navy);
    doc.rect(totalX, totalY, totalBoxW, totalBoxH, 'F');

    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL ${' '} ${invoice?.total_amount}`, totalX + 18, totalY + 18);

    // Terms
    doc.setTextColor(COLORS.navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Terms & Conditions', MARGIN_L, H - 120);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      'Payment should be paid within the valid date.',
      MARGIN_L,
      H - 100
    );

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
                <TableBody className="!bg-bodyBackground [&_tr]:border-b [&_tr]:border-b-primary-bg [&_tr:last-child]:border-b-0 border-2 border-primary-bg">
                  {reportList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-4 text-primary-bg"
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
                        <TableCell>{inv.payment_date || '—'}</TableCell>
                        <TableCell>{inv.payment_method || '—'}</TableCell>
                        <TableCell>{inv.total_amount || 0}</TableCell>
                        <TableCell className="flex items-center sm:mt-6 2xl:mt-0 justify-start mx-3">
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
