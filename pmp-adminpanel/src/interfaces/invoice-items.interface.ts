export interface InvoiceItemFields {
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  description: string;
  status: string;
  file: string;
  currency: string;
}
