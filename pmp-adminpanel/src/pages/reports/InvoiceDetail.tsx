import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import reportsService from '@/services/adminapp/reports';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import assets from '@/assets/images';

const COLORS = {
  navy: '#242460',
  mint: '#5EBFA1',
  sheet: '#ffffff',
  page: '#F3F4F6',
  lines: '#242460',
  white: '#ffffff',
};

const fmt = (v?: string | number, currency?: string) => {
  const n = Number(v ?? 0);
  return `${n.toLocaleString()} ${currency ?? ''}`.trim();
};

const rowLine = 'border-b border-[#242460]/35';

const label = 'text-[12px] font-semibold tracking-wide uppercase';
const val = 'text-[12px] font-semibold';

const gapY = 'space-y-1.5';

const InvoiceDetail = () => {
  const { invoiceId } = useParams();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currency = useMemo(() => invoice?.currency || 'KWD', [invoice]);

  const ownerName = useMemo(() => {
    // Owner (landlord) name if available; fallback to property name.
    const ln = invoice?.landlord?.user
      ? `${invoice.landlord.user?.fname ?? ''} ${invoice.landlord.user?.lname ?? ''}`.trim()
      : '';
    return ln || invoice?.tenant?.property_unit?.property?.name || 'N/A';
  }, [invoice]);

  const ownerContact = useMemo(() => {
    const u = invoice?.landlord?.user;
    if (!u) return '—';
    const bits = [u.email, u.phone].filter(Boolean);
    return bits.length ? bits.join('  |  ') : '—';
  }, [invoice]);

  const tenantName = useMemo(() => {
    const u = invoice?.tenant?.user;
    return u ? `${u.fname ?? ''} ${u.lname ?? ''}`.trim() : 'N/A';
  }, [invoice]);

  const tenantContact = useMemo(() => {
    const u = invoice?.tenant?.user;
    if (!u) return '—';
    const bits = [u.email, u.phone].filter(Boolean);
    return bits.length ? bits.join('  |  ') : '—';
  }, [invoice]);

  const unitNo = invoice?.tenant?.property_unit?.unit_no ?? '—';
  const unitRent = invoice?.tenant?.property_unit?.rent ?? '—';
  const maintenance = '—'; // no field in model; adjust if you add one
  const price = invoice?.total_amount ?? '—';

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

  const downloadPDF = async () => {
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

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!invoice) return null;

  return (
    <div className="w-full bg-[#F3F4F6] md:p-8">
      <div className="mx-auto max-w-[820px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold" style={{ color: COLORS.navy }}>
            INVOICE DETAIL
          </h2>
          <Button variant="outline" onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Sheet */}
        <Card className="relative overflow-hidden rounded-[8px] bg-white p-0 shadow">
          {/* Navy header with curved top-right */}
          <div
            className="relative h-[120px] w-full rounded-br-[20rem]"
            style={{ backgroundColor: COLORS.navy }}
          >
            <img
              src={assets.images.coloredCompLogo}
              alt="rento"
              className="absolute left-6 top-[0px] h-[120px] w-auto object-contain"
            />
            {/* quarter circle cut */}
            {/* <div
              className="absolute -right-[60px] -top-[60px] h-[240px] w-[240px] rounded-[999px] bg-white"
              aria-hidden
            /> */}
          </div>

          <div className="px-8 pb-10 pt-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div
                  className="text-[16px] font-semibold"
                  style={{ color: COLORS.mint }}
                >
                  PROPERTY RENT
                </div>
                <div
                  className="text-[34px] font-semibold leading-7"
                  style={{ color: COLORS.navy }}
                >
                  INVOICE
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[16px] font-semibold"
                  style={{ color: COLORS.mint }}
                >
                  INVOICE AMOUNT
                </div>
                <div
                  className="text-[14px] font-semibold"
                  style={{ color: COLORS.navy }}
                >
                  {fmt(invoice.total_amount, currency)}
                </div>
              </div>
            </div>

            {/* Info rows */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className={gapY}>
                <div className={label} style={{ color: COLORS.navy }}>
                  Invoice Details
                </div>
                <div className="grid grid-cols-[90px_1fr] gap-y-2">
                  <div
                    className="font-bold text-[12px]"
                    style={{ color: COLORS.navy }}
                  >
                    INV#
                  </div>
                  <div className={val} style={{ color: COLORS.navy }}>
                    {invoice.invoice_no ?? '—'}
                  </div>

                  <div
                    className="font-bold text-[12px]"
                    style={{ color: COLORS.navy }}
                  >
                    DATE
                  </div>
                  <div className={val} style={{ color: COLORS.navy }}>
                    {invoice.invoice_date ?? '—'}
                  </div>

                  <div
                    className="font-bold text-[12px]"
                    style={{ color: COLORS.navy }}
                  >
                    VALID DATE
                  </div>
                  <div className={val} style={{ color: COLORS.navy }}>
                    {invoice.due_date ?? '—'}
                  </div>

                  <div
                    className="font-bold text-[12px]"
                    style={{ color: COLORS.navy }}
                  >
                    FINAL AMOUNT
                  </div>
                  <div className={val} style={{ color: COLORS.navy }}>
                    {fmt(invoice.total_amount, currency)}
                  </div>
                </div>
              </div>

              <div className={gapY}>
                <div className={label} style={{ color: COLORS.navy }}>
                  Owner Name
                </div>
                <div className={val} style={{ color: COLORS.navy }}>
                  {ownerName}
                </div>
                <div className={val} style={{ color: COLORS.navy }}>
                  {ownerContact}
                </div>
              </div>

              <div className={gapY}>
                <div className={label} style={{ color: COLORS.navy }}>
                  Tenant Name
                </div>
                <div className={val} style={{ color: COLORS.navy }}>
                  {tenantName}
                </div>
                <div className={val} style={{ color: COLORS.navy }}>
                  {tenantContact}
                </div>
              </div>
            </div>

            {/* Table header */}
            <div
              className="mb-3 grid grid-cols-[1fr_1fr_1.2fr_1fr] rounded-sm px-4 py-2 text-white"
              style={{ backgroundColor: COLORS.navy }}
            >
              <div className="text-[12px] font-semibold">UNIT</div>
              <div className="text-[12px] font-semibold">RENT</div>
              <div className="text-[12px] font-semibold">MAINTAINANCE</div>
              <div className="text-[12px] font-semibold text-right">PRICE</div>
            </div>

            {/* lines like the mock */}
            <div className={`px-2 pb-4 ${rowLine}`}>
              <div
                className="grid grid-cols-[1fr_1fr_1.2fr_1fr] px-2 pb-3 text-[12px] font-semibold"
                style={{ color: COLORS.navy }}
              >
                <div>{unitNo}</div>
                <div>{fmt(unitRent, currency)}</div>
                <div>{maintenance}</div>
                <div className="text-right">{fmt(price, currency)}</div>
              </div>
            </div>
            <div className={`px-2 pb-6 ${rowLine}`} />
            <div className={`px-2 pb-6 ${rowLine}`} />

            {/* total chip */}
            <div className="mt-4 flex justify-end">
              <div
                className="rounded-sm px-6 w-[30%] py-2 font-semibold text-white"
                style={{ backgroundColor: COLORS.navy }}
              >
                TOTAL : {fmt(price, currency)}
              </div>
            </div>

            {/* terms */}
            <div className="mt-8">
              <div
                className="text-[12px] font-semibold"
                style={{ color: COLORS.navy }}
              >
                Terms & Conditions
              </div>
              <div className="text-[12px]" style={{ color: COLORS.navy }}>
                Payment should be paid within the valid date.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceDetail;
