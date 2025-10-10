import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';
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
import {
  ArrowUpDown,
  Loader2,
  Pencil,
  CreditCard,
  Trash2,
  Plus,
  Eye,
  Download,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
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
import invoiceService from '@/services/adminapp/invoice';
import InvoiceCreateDialog from './CreateDialog';
import InvoiceUpdateDialog from './UpdateDialog';
import InvoiceItemModal from './InvoiceItemModal';
import { InvoiceFields } from '@/interfaces/invoice.interface';
import InvoiceItemActionDialog from './InvoiceItemActionDialog';
import paymentService from '@/services/adminapp/payments'; // adjust this path
import { hasPermission, usePermission } from '@/utils/hasPermission';
import { PERMISSIONS } from '@/utils/constants';
import InvoiceItemCreateDialog from './InvoiceItemCreateDialog';
import { getItem } from '@/utils/storage';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import assets from '@/assets/images';
import dayjs from 'dayjs';
import { SingleSelectDropDown } from '@/components/DropDown/SingleSelectDropDown';
import { useForm } from 'react-hook-form';

const Invoices = () => {
  const { toast } = useToast();
  const form = useForm<any>({
    defaultValues: { invoicefilter: 'rentalUsers' },
  });
  const { control, watch } = form;

  const userDetails: any = getItem('USER');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const [list, setList] = useState<InvoiceFields[]>([]);
  const [editFormData, setEditFormData] = useState<InvoiceFields | null>(null);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected'>(
    'approved'
  );
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    actions: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [amount, setAmount] = useState(0);
  const [selectedInvoiceItemId, setSelectedInvoiceItemId] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { can } = usePermission();
  const [isLoader, setIsLoader] = useState(false);
  const [mainIsLoader, setMainIsLoader] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([]);
  const [invoiceItemTotal, setInvoiceItemTotal] = useState(0);
  const [invoiceItemPage, setInvoiceItemPage] = useState(1);
  const [invoiceItemSize] = useState(5); // same as ITEMS_PER_PAGE
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);

  const fetchInvoiceItems = async (invoiceId: string, page = 1) => {
    try {
      const res = await invoiceService.getInvoiceItems(
        invoiceId,
        page,
        invoiceItemSize
      );
      if (res?.data?.success) {
        setInvoiceItems(res.data.items);
        setInvoiceItemTotal(res.data.total);
        setInvoiceItemPage(res.data.page);
      }
    } catch (error) {
      console.error('Failed to fetch invoice items:', error);
    }
  };
  const handleCreatePayment = async (row: any) => {
    console.log('row', row);

    try {
      const payload = {
        user_id: row.tenant.user.id,
        invoice_id: row.id,
        property_unit_id: row.tenant.property_unit.id,
        property: row.tenant.property_unit.property.name,
        supplier_code: row.tenant.property_unit.property.supplier_code,
        property_unit: row.tenant.property_unit.unit_no,
        user_name: row.tenant.user.fname + ' ' + row.tenant.user.lname,
        user_email: row.tenant.user.email,
        // user_phone: row.tenant.user.user_phone,
        amount: row.total_amount,
      };

      const res = await paymentService.create(payload); // adjust method
      if (res?.data?.payment_url) {
        window.open(res.data.payment_url, '_blank'); // open in new tab
      } else {
        ToastHandler('Unable to create payment');
      }
    } catch (error) {
      console.error('Payment creation failed', error);
      ToastHandler('Payment creation failed');
    }
  };
  const refreshData = () => {
    if (selectedInvoiceId) {
      fetchInvoiceItems(selectedInvoiceId, invoiceItemPage); // add current page
    }
  };
  const ToastHandler = (msg: string) =>
    toast({
      description: msg,
      className: cn(
        'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
      ),
      style: { backgroundColor: '#FF5733', color: 'white' },
    });

  // 🔃 Fetch list with filters & pagination
  const fetchList = async (keySearch = search, pageNo: number) => {
    setMainIsLoader(true);
    try {
      const resp = await invoiceService.list(
        userDetails?.id,
        'landlord',
        keySearch,
        pageNo,
        pageSize,
        watch('invoicefilter'),
        watch('invoicefilter') !== 'rentalUsers' ? userDetails?.landlordId : ''
      );
      if (resp.data.success) {
        setList(resp.data.items);
        setTotal(resp.data.total);
        // ToastHandler(resp.data.message);
      }
    } catch (err) {
      console.error(err);
      ToastHandler('Failed to fetch invoices');
    } finally {
      setMainIsLoader(false);
    }
  };

  useEffect(() => {
    if (can(PERMISSIONS.INVOICE.UPDATE) || can(PERMISSIONS.INVOICE.DELETE)) {
      setColumnVisibility({ actions: true });
    }
    fetchList(search, page);
  }, [watch('invoicefilter')]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    fetchList(search, 1);
  };

  const handlePageChange = (newPage: number) => {
    table.setPageIndex(newPage + 1);

    setPage(newPage + 1);
    fetchList(search, newPage + 1);
  };

  const COLORS = {
    navy: '#242460',
    mint: '#5EBFA1',
    sheet: '#ffffff',
    page: '#F3F4F6',
    lines: '#242460',
    white: '#ffffff',
  };

  const currency = useMemo(() => 'KWD', []);

  const fmt = (v?: string | number, currency?: string) => {
    const n = Number(v ?? 0);
    return `${n.toLocaleString()} ${currency ?? ''}`.trim();
  };

  const handleAction = async (
    type: 'edit' | 'delete' | 'view' | 'download',
    inv: InvoiceFields | any
  ) => {
    if (type === 'edit') {
      setEditFormData(inv);
      setEditOpen(true);
    } else if (type === 'delete') {
      setDeleteOpen(true);
    } else if (type === 'view') {
      navigate(`/admin-panel/invoices/detail/${inv.id}`);
    }
    if (type === 'download') {
      if (!inv) return;

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
        doc.addImage(
          logo,
          'PNG',
          logoX,
          logoY,
          drawW,
          drawH,
          undefined,
          'NONE'
        );
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
      doc.text(`${fmt(inv.total_amount, currency)}`, rightEdge, TITLE_Y + 25, {
        align: 'right',
      });

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
        ['INV#', `${inv.invoice_no ?? '—'}`],
        ['DATE', `${inv.invoice_date ?? '—'}`],
        ['VALID DATE', `${inv.due_date ?? '—'}`],
        ['Contract#', `${inv?.tenant?.contract_number ?? '—'}`],
        ['AMOUNT', `${fmt(inv.total_amount, currency)}`],
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
        const u = inv?.landlord?.user;
        return u
          ? `${u.fname ?? ''} ${u.lname ?? ''}`.trim()
          : inv?.tenant?.property_unit?.property?.name || '—';
      })();
      const ownerContact = (() => {
        const u = inv?.landlord?.user;
        const bits = [u?.email, u?.phone].filter(Boolean) as string[];
        return bits.length ? bits.join(' | ') : '—';
      })();

      doc.setFont('helvetica', 'bold');
      doc.text(ownerName, COL2_X, BASE_Y + 20);
      doc.setFont('helvetica', 'normal');
      doc.text(ownerContact, COL2_X, BASE_Y + 36);

      // Right: tenant (wrap within col width)
      const tenantUser = inv?.tenant?.user;
      const tenantName = tenantUser
        ? `${tenantUser.fname ?? ''} ${tenantUser.lname ?? ''}`.trim()
        : '—';
      const tenantContactRaw =
        [tenantUser?.email, tenantUser?.phone].filter(Boolean).join(' | ') ||
        '—';
      const tenantWrapped = doc.splitTextToSize(tenantContactRaw, COL_W - 4);

      doc.setFont('helvetica', 'bold');
      doc.text(tenantName, COL3_X, BASE_Y + 20);
      doc.setFont('helvetica', 'normal');
      doc.text(tenantWrapped, COL3_X, BASE_Y + 36);
      const leftRowTanent: Array<[string, string]> = [
        ['LEGAL CASE:', `${inv?.tenant?.legal_case ? 'YES' : 'NO'}`],
      ];
      doc.setFontSize(10);
      leftRowTanent.forEach(([k, v]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(k, COL3_X, BASE_Y + 52);
        doc.setFont('helvetica', 'normal');
        doc.text(v, COL3_X + 80, BASE_Y + 52);
        y += 16;
      });
      // ---------------- Table header
      const tLeft = MARGIN_L;
      const tRight = W - MARGIN_R;
      let ty = BASE_Y + 100;

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

      const unitNo = inv?.tenant?.property_unit?.unit_no ?? '—';
      const unitRent = inv?.tenant?.property_unit?.rent ?? '—';
      const maintenance = '—';
      const price = inv?.total_amount ?? '—';

      doc.text(String(unitNo), colXs[0], ty);
      doc.text(fmt(unitRent, inv?.currency || 'KWD'), colXs[1], ty);
      doc.text(String(maintenance), colXs[2], ty);
      doc.text(fmt(price, inv?.currency || 'KWD'), colXs[3], ty);

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
      doc.text(`TOTAL ${' '} ${inv?.total_amount}`, totalX + 18, totalY + 18);

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

      doc.save(`invoice_${inv.invoice_no || 'detail'}.pdf`);
    }
  };

  const createHandler = async (data: InvoiceFields) => {
    data.landlord_id = userDetails?.landlordId;
    setIsLoader(true);
    const resp = await invoiceService.create(data);
    if (resp.data.success) {
      setList((list: any) => [resp.data.items, ...list]);
      toast({
        description: resp.data.message,
        className: cn(
          'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
        ),
        style: {
          backgroundColor: '#5CB85C',
          color: 'white',
        },
      });
      setIsLoader(false);
      setCreateOpen(false);

      // fetchList();
    } else {
      setIsLoader(false);
      ToastHandler(resp.data.message);
    }
  };

  const updateHandler = async (data: InvoiceFields) => {
    setIsLoader(true);
    const resp = await invoiceService.update(data?.id!, data);
    setIsLoader(false);
    if (resp.data.success) {
      toast({
        description: resp.data.message,
        className: cn(
          'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
        ),
        style: {
          backgroundColor: '#5CB85C',
          color: 'white',
        },
      });
      setEditOpen(false);
      fetchList(search, page);
    } else ToastHandler(resp.data.message);
  };

  const deleteHandler = async () => {
    if (!editFormData) return;
    setIsLoader(true);
    const resp = await invoiceService.deleteMethod(editFormData.id!);
    setIsLoader(false);
    if (resp.data.success) {
      toast({
        description: resp.data.message,
        className: cn(
          'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
        ),
        style: {
          backgroundColor: '#5CB85C',
          color: 'white',
        },
      });
      setDeleteOpen(false);
      fetchList(search, page);
    } else ToastHandler(resp.data.message);
  };

  const columns = React.useMemo<ColumnDef<InvoiceFields>[]>(
    () => [
      {
        accessorKey: 'invoice_no',
        header: 'INVOICE',
        cell: ({ row }) => {
          const invoiceItems = row.original.invoice_items || [];
          const hasPending =
            row.original.status !== 'paid' &&
            (invoiceItems.length === 0 ||
              invoiceItems.every((item) => item.status !== 'pending'));

          return (
            <div className="flex gap-4 w-[115px] items-center justify-center">
              {hasPending ? (
                <>
                  <div className="underline inline-block h-2 w-2 rounded-full bg-scrollbar" />
                  <Link
                    to={`/admin-panel/invoices/detail/${row.original.id}`}
                    className="text-textinv underline "
                  >
                    {row.original.invoice_no}
                  </Link>
                </>
              ) : (
                <>
                  <div className="underline inline-block h-2 w-2 rounded-full bg-offground" />
                  <Link
                    to={`/admin-panel/invoices/detail/${row.original.id}`}
                    className="text-textinv underline "
                  >
                    {row.original.invoice_no}
                  </Link>
                </>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'contract_no',
        header: 'TENANT',
        cell: ({ row }) => {
          const tenant = row.original.tenant;
          const user = tenant?.user;

          return (
            <div className="leading-tight">
              {user?.fname && user?.lname && (
                <div className="text-sm capitalize font-semibold text-primary-bg">
                  {user.fname} {user.lname}
                </div>
              )}
              {tenant?.contract_number && (
                <div className="text-xs text-gray-500 mt-0.5">
                  ({tenant.contract_number})
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'property',
        header: 'PROPERTY',
        cell: ({ row }) =>
          row.original.tenant?.property_unit?.property?.name || '--',
      },
      {
        accessorKey: 'unit_no',
        header: 'UNIT#.',
        cell: ({ row }) => row.original.tenant?.property_unit?.unit_no || '--',
      },
      // { accessorKey: 'invoice_no', header: 'Contract no' },
      { accessorKey: 'total_amount', header: 'TOTAL' },
      // { accessorKey: 'due_date', header: 'DUE' },
      // { accessorKey: 'status', header: 'STATUS' },

      {
        accessorKey: 'due_date',
        header: 'DUE',
        cell: ({ row }) => {
          return (
            <div className="leading-tight">
              <div className="text-sm  capitalize text-primary-bg">
                {dayjs(row.original.due_date).format('YYYY-MM-DD')}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'STATUS',
        cell: ({ row }) => {
          return (
            <div className="leading-tight">
              <div className="text-sm  capitalize text-primary-bg">
                {row.original.status}
              </div>
            </div>
          );
        },
      },
      // {
      //   accessorKey: 'invoice_date',
      //   header: 'Invoice Date',
      //   cell: ({ row }) =>
      //     row.original.invoice_date
      //       ? new Date(row.original.invoice_date).toLocaleDateString()
      //       : '--',
      // },
      {
        id: 'Submitted',
        header: 'PAYMENT',
        cell: ({ row }) => {
          const invoiceItems = row.original.invoice_items || [];
          // const id = row.original.id;
          const hasPending =
            row.original.status !== 'paid' &&
            (invoiceItems.length === 0 ||
              invoiceItems.every((item) => item.status !== 'pending'));

          return (
            <div className="flex gap-2 items-center">
              {/* <span className="bg-blue-500 text-white text-[8px] w-[12px] h-[14px] rounded-full font-semibold flex items-center justify-center">
                {invoiceItems.length}
              </span> */}
              {/* <Eye
                className="cursor-pointer text-blue-500 w-[20px] h-[20px]"
                onClick={async () => {
                  setSelectedInvoiceId(id);
                  await fetchInvoiceItems(id);
                  setShowItemsModal(true);
                }}
              />

              {can(PERMISSIONS.TENANT_RENTAL.CREATE) && hasPending && (
                <Plus
                  className="cursor-pointer text-green-600 w-[20px] h-[20px]"
                  onClick={() => {
                    setSelectedInvoiceId(id);
                    setAmount(row.original.total_amount);
                    setSelectedInvoiceItemId('');
                    setShowCreateItemModal(true);
                  }}
                />
                
              )} */}
              {hasPending &&
              (userDetails?.role?.name === 'Landlord' ||
                userDetails?.role?.name === 'Manager') ? (
                'Payment Pending'
              ) : hasPending ? (
                <Button
                  className="ml-auto w-[100px] hover:bg-scrollbar h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                  variant={'outline'}
                  onClick={() => handleCreatePayment(row.original)}
                >
                  Pay Now
                </Button>
              ) : (
                'Payment Done'
              )}
            </div>
          );
        },
      },
      {
        id: '1actions',
        header: 'ACTIONS',

        enableHiding: false,
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex gap-2 items-center justify-center">
              <img
                onClick={() => handleAction('view', inv)}
                src={assets.images.coloredEye}
                className="text-primary-bg cursor-pointer h-6 w-6"
              />
              {/* <Eye
                className="cursor-pointer text-primary-bg"
                onClick={() => handleAction('view', inv)}
              /> */}
            </div>
          );
        },
      },
      {
        id: '2actions',
        header: 'DOWNLOAD',

        enableHiding: false,
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="flex gap-2 items-center justify-center">
              <img
                onClick={() => handleAction('download', inv)}
                src={assets.images.download}
                className="text-primary-bg cursor-pointer h-6 w-6"
              />
              {/* <Download
                className="cursor-pointer text-primary-bg pr-1"
                onClick={() => handleAction('download', inv)}
              /> */}
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
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-2 mt-5">
      <SidebarInset className="flex flex-col gap-4 p-4 pt-0">
        <div className="flex items-center py-4 justify-between">
          <h2 className="text-primary-bg font-semibold text-[33px] leading-normal capitalize px-1">
            INVOICES
            <div className="flex gap-2">
              <span className="block text-sm text-scrollbar text-center">
                <div className="inline-block h-2 w-2 rounded-full bg-scrollbar mx-1" />
                PAID
              </span>
              <span className="block text-sm text-offground text-center">
                <div className="inline-block h-2 w-2 rounded-full bg-offground mx-1" />
                OVERDUE
              </span>
            </div>
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-[150px]">
              <SingleSelectDropDown
                control={control}
                name="invoicefilter"
                label=""
                items={[
                  { id: 'rentalUsers', name: 'Rental Users' },
                  {
                    id: 'landlordSubscriptions',
                    name: 'Subscriptions',
                  },
                ]}
                placeholder="Choose an option"
                mainClassName="custom-filter-select-field"
              />
            </div>
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearch}
              className="w-[461px] h-[35px] rounded-[23px] bg-mars-bg/50"
            />
            {/* <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyUp={handleSearch}
              className="w-[300px]"
            /> */}
            {can(PERMISSIONS.INVOICE.CREATE) && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="ml-auto w-[148px] h-[35px] bg-primary-bg rounded-[20px] text-[12px] leading-[16px] font-semibold text-white"
                variant={'outline'}
              >
                + Add Invoice
              </Button>
            )}
          </div>
          {/* <Button onClick={() => setCreateOpen(true)}>+ Add Invoice</Button> */}
        </div>
        <div className="overflow-x-auto border rounded">
          {mainIsLoader ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader className="[&_tr]:border-b-2 [&_tr]:border-b-primary-bg">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow
                    className="!border-b-2 !border-b-[#242460]"
                    key={hg.id}
                  >
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
              <TableBody className="!bg-bodyBackground [&_tr]:border-b [&_tr]:border-b-primary-bg [&_tr:last-child]:border-b-0 border-2 border-primary-bg">
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
                      No invoices found.
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
          totalPages={Math.ceil(total)}
          onPageChange={(pageNumber) => handlePageChange(pageNumber)}
          showPreviousNext
        />
      </SidebarInset>

      {/* Dialogs */}
      {createOpen && (
        <InvoiceCreateDialog
          isLoader={isLoader}
          isOpen={createOpen}
          setIsOpen={setCreateOpen}
          callback={createHandler}
        />
      )}
      {editFormData && (
        <InvoiceUpdateDialog
          isLoader={isLoader}
          isOpen={editOpen}
          setIsOpen={setEditOpen}
          formData={editFormData}
          callback={updateHandler}
        />
      )}
      <InvoiceItemCreateDialog
        isOpen={showCreateItemModal}
        setIsOpen={setShowCreateItemModal}
        invoiceId={selectedInvoiceId ?? ''}
        invoiceItemId={selectedInvoiceItemId ?? undefined}
        amount={amount}
        setList={setList}
        onComplete={async () => {
          if (selectedInvoiceId) {
            await fetchInvoiceItems(selectedInvoiceId);
            await fetchList(search, page);
          }
        }}
      />
      <InvoiceItemModal
        invoiceId={selectedInvoiceId}
        setSelectedInvoiceItemId={setSelectedInvoiceItemId}
        setShowCreateItemModal={setShowCreateItemModal}
        setActionType={setActionType}
        setSelectedItem={setSelectedItem}
        setActionDialogOpen={setActionDialogOpen}
        isOpen={showItemsModal}
        setIsOpen={setShowItemsModal}
      />

      <InvoiceItemActionDialog
        isOpen={actionDialogOpen}
        setIsOpen={setActionDialogOpen}
        actionType={actionType}
        item={selectedItem}
        onAction={async (id, remarks, action) => {
          try {
            const res = await invoiceService.approveRejectInvoiceItem(
              id,
              action,
              {
                remarks,
                user_id: userDetails?.id || '',
              }
            );

            if (res?.data?.success) {
              toast({
                description: res.data.message,
                className: cn(
                  'top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4'
                ),
                style: {
                  backgroundColor: '#5CB85C',
                  color: 'white',
                },
              });
              refreshData();
              setShowItemsModal(false); // ✅ Close only on success
              await fetchList(search, page);
            } else {
              ToastHandler(res.data.message || 'Failed to update status');
            }
          } catch (err) {
            ToastHandler('Action failed');
          }
        }}
      />

      {editFormData && (
        <DeleteDialog
          isLoader={isLoader}
          isOpen={deleteOpen}
          setIsOpen={setDeleteOpen}
          title="Invoice"
          formData={editFormData}
          callback={deleteHandler}
        />
      )}
    </div>
  );
};

export default Invoices;
