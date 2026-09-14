import React from 'react';
import QueryProvider from '@/providers/QueryProvider';
import './globals.css';

export const metadata = {
  title: 'NRG Solar HR',
  description: 'Enterprise HR Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}