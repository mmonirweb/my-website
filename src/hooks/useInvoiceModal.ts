import { useState } from 'react';

export function useInvoiceModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  const openInvoice = (data: any) => {
    setInvoiceData(data);
    setIsOpen(true);
  };

  const closeInvoice = () => {
    setIsOpen(false);
    setInvoiceData(null);
  };

  return { isOpen, invoiceData, openInvoice, closeInvoice };
}