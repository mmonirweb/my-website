'use client';

import { useState } from 'react';
import { useOrganizations } from '@/domains/organization/hooks/useOrganizations';
import CreateCompanyModal from '@/domains/organization/components/CreateCompanyModal';
import TableSearchFilter from '@/components/common/TableSearchFilter';
import { Company } from '@/domains/organization/types';

export default function CompaniesPage() {
  const { companies, isLoadingCompanies, isErrorCompanies, deleteCompany } = useOrganizations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter((company: Company) => {
    const search = searchTerm.toLowerCase();
    return (
      (company.name && company.name.toLowerCase().includes(search)) ||
      (company.code && company.code.toLowerCase().includes(search)) ||
      (company.email && company.email.toLowerCase().includes(search))
    );
  });

  const handleOpenAdd = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(id);
      } catch (err) {
        console.error('Failed to delete company:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Companies</h1>
          <p className="text-sm text-slate-500 mt-1">Manage corporate entities and company profiles</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Company
        </button>
      </div>

      <TableSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by company name, code, or email..."
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingCompanies ? (
            <div className="p-8 text-center text-slate-500">Loading Companies...</div>
          ) : isErrorCompanies ? (
            <div className="p-8 text-center text-red-500">Failed to fetch company data.</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No companies found.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Code</th>
                  <th className="px-6 py-3 font-semibold">Company Name</th>
                  <th className="px-6 py-3 font-semibold">Contact</th>
                  <th className="px-6 py-3 font-semibold">Tax / BIN</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCompanies.map((company: Company, index: number) => (
                  <tr key={company.id ?? index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{company.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div>{company.name}</div>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                          {company.website}
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div>{company.email || '-'}</div>
                      <div className="text-slate-400">{company.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div>TIN: {company.tax_id || '-'}</div>
                      <div className="text-slate-400">BIN: {company.bin_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        company.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(company)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      {company.id !== undefined && (
                        <button
                          onClick={() => handleDelete(company.id!)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedCompany}
      />
    </div>
  );
}