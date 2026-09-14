'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCustomers } from '@/domains/customer/hooks/useCustomers';
import { CreateCustomerModal } from '@/domains/customer/components/CreateCustomerModal';
import { Customer } from '@/domains/customer/types';
import {
  Users,
  Search,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Building,
  CreditCard,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Download,
} from 'lucide-react';

function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const { customersQuery, deleteCustomerMutation } = useCustomers({
    search: searchTerm,
  });

  // Handle click outside to close active dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    if (activeMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const rawCustomers = customersQuery.data?.data?.data || customersQuery.data?.data || customersQuery.data || [];
  const customers = Array.isArray(rawCustomers) ? rawCustomers : [];

  // Client-side filtration based on Group & Source dropdowns
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer: any) => {
      const matchesGroup =
        selectedGroup === 'ALL' || customer.customer_group === selectedGroup;
      const matchesSource =
        selectedSource === 'ALL' || customer.source === selectedSource;
      return matchesGroup && matchesSource;
    });
  }, [customers, selectedGroup, selectedSource]);

  // Aggregate Metrics Calculations
  const metrics = useMemo(() => {
    return customers.reduce(
      (acc: any, curr: any) => {
        acc.total += 1;
        const balance = Number(curr.current_balance) || 0;
        const credit = Number(curr.credit_limit) || 0;

        if (balance > 0) acc.totalReceivable += balance;
        if (balance < 0) acc.totalPayable += Math.abs(balance);
        acc.totalCreditLimit += credit;
        if (curr.is_active) acc.active += 1;

        return acc;
      },
      {
        total: 0,
        totalReceivable: 0,
        totalPayable: 0,
        totalCreditLimit: 0,
        active: 0,
      }
    );
  }, [customers]);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      deleteCustomerMutation.mutate(id);
    }
    setActiveMenuId(null);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenCreateModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      alert('No customer data available to export.');
      return;
    }

    const headers = ['Code', 'Name', 'Company', 'Phone', 'Email', 'Group', 'Source', 'Credit Limit', 'Current Balance', 'Status'];
    const rows = filteredCustomers.map((c: any) => [
      `"${c.customer_code || `CUST-${c.id}`}"`,
      `"${c.name || ''}"`,
      `"${c.company?.name || c.company_name || ''}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.customer_group || 'RETAIL'}"`,
      `"${c.source || 'POS'}"`,
      c.credit_limit || 0,
      c.current_balance || 0,
      c.is_active ? 'Active' : 'Inactive',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_list_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Customer Intelligence
                <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Live Sync
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage retail, corporate accounts, credit terms, and ledger history.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => customersQuery.refetch()}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${customersQuery.isFetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Print</span>
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {/* Metric 1: Total Customers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Accounts</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 print:hidden">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white print:text-black">{metrics.total}</span>
            <span className="text-xs text-emerald-400 font-medium">{metrics.active} Active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 print:text-gray-600">
            Registered client base in ERP/POS
          </div>
        </div>

        {/* Metric 2: Total Receivables */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Receivables</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 print:hidden">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-amber-400 print:text-black">
              ৳ {metrics.totalReceivable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 print:text-gray-600">
            Outstanding payment owed by customers
          </div>
        </div>

        {/* Metric 3: Total Payables / Advance */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Advance / Payables</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:hidden">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-400 print:text-black">
              ৳ {metrics.totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 print:text-gray-600">
            Customer advance deposits or credits
          </div>
        </div>

        {/* Metric 4: Total Credit Limits */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exposure Limit</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 print:hidden">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-indigo-400 print:text-black">
              ৳ {metrics.totalCreditLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 print:text-gray-600">
            Approved combined credit allowance
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Dynamic Filters */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by code, name, phone or email..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              <option value="ALL" className="bg-slate-900">All Groups</option>
              <option value="RETAIL" className="bg-slate-900">Retail</option>
              <option value="WHOLESALE" className="bg-slate-900">Wholesale</option>
              <option value="VIP" className="bg-slate-900">VIP</option>
              <option value="DISTRIBUTOR" className="bg-slate-900">Distributor</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <select
              className="bg-transparent text-xs text-slate-300 outline-none cursor-pointer"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="ALL" className="bg-slate-900">All Sources</option>
              <option value="POS" className="bg-slate-900">POS Counter</option>
              <option value="ERP" className="bg-slate-900">ERP Direct</option>
              <option value="ECOMMERCE" className="bg-slate-900">E-Commerce</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Customers Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-2xl print:bg-white print:border-black print:text-black">
        <div className="overflow-x-auto min-h-[320px]">
          <table className="w-full text-left text-xs text-slate-300 print:text-black">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider print:bg-gray-200 print:text-black">
              <tr>
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Segment / Source</th>
                <th className="px-4 py-3.5 text-right">Credit Limit</th>
                <th className="px-4 py-3.5 text-right">Balance (৳)</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
              {customersQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                      <span>Fetching Customer Records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-8 h-8 text-slate-600" />
                      <span>No customer profiles found matching criteria.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer: any) => {
                  const balance = Number(customer.current_balance || customer.due_amount || 0);
                  const isReceivable = balance > 0;
                  const isPayable = balance < 0;

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Code */}
                      <td className="px-4 py-3 font-mono font-bold text-blue-400 print:text-black">
                        {customer.customer_code || `CUST-${customer.id}`}
                      </td>

                      {/* Customer Name */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors print:text-black">
                          {customer.name}
                        </div>
                        {(customer.company?.name || customer.company_name) && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 print:text-gray-600">
                            <Building className="w-3 h-3 print:hidden" />
                            {customer.company?.name || customer.company_name}
                          </div>
                        )}
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3">
                        <div className="text-slate-200 print:text-black">{customer.phone}</div>
                        <div className="text-[10px] text-slate-500 print:text-gray-600">{customer.email || 'N/A'}</div>
                      </td>

                      {/* Group & Source */}
                      <td className="px-4 py-3 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-medium print:bg-transparent print:border-gray-400 print:text-black">
                            {customer.customer_group || 'RETAIL'}
                          </span>
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-medium print:bg-transparent print:border-gray-400 print:text-black">
                            {customer.source || 'POS'}
                          </span>
                        </div>
                      </td>

                      {/* Credit Limit */}
                      <td className="px-4 py-3 text-right font-mono text-slate-300 print:text-black">
                        ৳ {(Number(customer.credit_limit) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Current Balance */}
                      <td className="px-4 py-3 text-right font-mono">
                        <span
                          className={`font-bold ${
                            isReceivable
                              ? 'text-amber-400 print:text-black'
                              : isPayable
                              ? 'text-emerald-400 print:text-black'
                              : 'text-slate-400 print:text-black'
                          }`}
                        >
                          ৳ {Math.abs(balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[9px] font-sans text-slate-500 uppercase print:text-gray-600">
                          {isReceivable ? 'Due' : isPayable ? 'Advance' : 'Clear'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            customer.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 print:border-gray-400 print:text-black'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20 print:border-gray-400 print:text-black'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full print:hidden ${
                              customer.is_active ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {customer.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Action Dropdown/Buttons */}
                      <td className="px-4 py-3 text-center relative print:hidden">
                        <div className="flex items-center justify-center gap-1">
                          {/* Ledger Button */}
                          <Link
                            href={`/customers/${customer.id}/ledger`}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            title="View Financial Ledger"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          </Link>

                          {/* Action Options Menu */}
                          <div className="relative" ref={activeMenuId === customer.id ? menuRef : null}>
                            <button
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === customer.id ? null : customer.id
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === customer.id && (
                              <div className="absolute right-0 bottom-full mb-1 sm:bottom-auto sm:top-8 z-50 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 text-left">
                                <Link
                                  href={`/customers/${customer.id}/ledger`}
                                  onClick={() => setActiveMenuId(null)}
                                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-400" /> View Profile
                                </Link>
                                <button
                                  onClick={() => handleEdit(customer)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit Profile
                                </button>
                                <button
                                  onClick={() => handleDelete(customer.id, customer.name)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete Account
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Integration */}
      <CreateCustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer ?? undefined}
      />
    </div>
  );
}

export default CustomersPage;