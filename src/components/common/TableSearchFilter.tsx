'use client';

import React from 'react';

interface TableSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
}

export default function TableSearchFilter({
  searchTerm,
  onSearchChange,
  placeholder = 'Search...',
  statusFilter,
  onStatusChange,
}: TableSearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
      <div className="relative w-full sm:w-72">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800 bg-white"
        />
        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
      </div>

      {onStatusChange && (
        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}
    </div>
  );
}