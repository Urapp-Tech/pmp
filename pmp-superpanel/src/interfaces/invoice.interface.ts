export interface InvoiceFields {
  tenant: any;
  id: string;
  landlord_id: string;
  tenant_id: string;
  invoice_no?: string;
  total_amount: any;
  paid_amount: string;
  discount_amount: string;
  due_amount: string;
  currency: string;
  status: 'paid' | 'unpaid' | 'partial' | 'overdue' | string;
  payment_date: string;
  invoice_date: string;
  due_date: string;
  description: string;
  payment_method: 'cash' | 'bank' | 'online' | string;
  qty: number;
  invoice_items: any[];
}
