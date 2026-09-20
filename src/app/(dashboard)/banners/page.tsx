'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon, Clock } from 'lucide-react';
import { useBanners } from '@/domains/ecommerce/hooks/useBanners';
import BannerModal from '@/domains/ecommerce/components/BannerModal';
import { Banner } from '@/domains/ecommerce/types/banner';

export default function AdminBannersPage() {
  const { banners, isLoading, createBanner, updateBanner, deleteBanner } = useBanners();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAddModal = () => {
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleSubmitBanner = async (data: Partial<Banner>) => {
    setIsSubmitting(true);
    try {
      if (selectedBanner) {
        await updateBanner({ id: selectedBanner.id, data });
      } else {
        await createBanner(data);
      }
    } catch (error) {
      console.error('Failed to save banner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id);
      } catch (error) {
        console.error('Failed to delete banner:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Banner & Slider Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control unlimited promotional sliders, hero banners, and timings from a single place.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Banner
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Image</th>
                <th className="py-4 px-6">Title & Subtitle</th>
                <th className="py-4 px-6">Position</th>
                <th className="py-4 px-6 text-center">Interval</th>
                <th className="py-4 px-6 text-center">Sort Order</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs font-semibold">Loading banners...</td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs font-semibold">No banners found. Create your first banner!</td>
                </tr>
              ) : (
                banners.map((banner: Banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="w-20 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{banner.title || 'Untitled Banner'}</div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{banner.subtitle || banner.link_url || 'No subtitle'}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 capitalize">
                        {banner.position?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {banner.interval_time}ms
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-600">
                      {banner.sort_order}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${banner.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                        {banner.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(banner)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <BannerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitBanner}
        banner={selectedBanner}
        isLoading={isSubmitting}
      />
    </div>
  );
}