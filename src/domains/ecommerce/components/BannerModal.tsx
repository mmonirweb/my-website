'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Banner } from '../types/banner';

interface BannerItem {
  id?: number;
  title: string;
  subtitle: string;
  image: string;
  link_url: string;
  button_text: string;
  position: string;
  interval_time: number;
  sort_order: number;
  status: boolean;
  imagePreview?: string;
}

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  banner?: Banner | null;
  isLoading?: boolean;
}

export default function BannerModal({ isOpen, onClose, onSubmit, banner, isLoading }: BannerModalProps) {
  const [banners, setBanners] = useState<BannerItem[]>([
    {
      title: '',
      subtitle: '',
      image: '',
      link_url: '',
      button_text: 'Shop Now',
      position: 'main_slider',
      interval_time: 5000,
      sort_order: 0,
      status: true,
      imagePreview: '',
    }
  ]);

  useEffect(() => {
    if (banner) {
      setBanners([{
        id: banner.id,
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        image: banner.image || '',
        link_url: banner.link_url || '',
        button_text: banner.button_text || 'Shop Now',
        position: banner.position || 'main_slider',
        interval_time: banner.interval_time ?? 5000,
        sort_order: banner.sort_order ?? 0,
        status: banner.status ?? true,
        imagePreview: banner.image || ''
      }]);
    } else {
      setBanners([{
        title: '',
        subtitle: '',
        image: '',
        link_url: '',
        button_text: 'Shop Now',
        position: 'main_slider',
        interval_time: 5000,
        sort_order: 0,
        status: true,
        imagePreview: '',
      }]);
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleAddMore = () => {
    setBanners(prev => [
      ...prev,
      {
        title: '',
        subtitle: '',
        image: '',
        link_url: '',
        button_text: 'Shop Now',
        position: 'main_slider',
        interval_time: 5000,
        sort_order: prev.length,
        status: true,
        imagePreview: '',
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (banners.length === 1) return;
    setBanners(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof BannerItem, value: any) => {
    setBanners(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setBanners(prev => {
          const updated = [...prev];
          updated[index] = { ...updated[index], image: result, imagePreview: result };
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = banner ? banners[0] : { banners };
    await onSubmit(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {banner ? 'Edit Banner / Slider' : 'Add Multiple Banners / Sliders'}
            </h3>
            <p className="text-xs text-slate-500">একসঙ্গে এক বা একাধিক ব্যানার বা স্লাইডার যুক্ত করতে পারেন।</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {banners.map((item, index) => (
            <div key={index} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4 relative">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                  Banner Item #{index + 1}
                </span>
                {!banner && banners.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveRow(index)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Position / Type</label>
                  <select 
                    value={item.position} 
                    onChange={e => handleChange(index, 'position', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                  >
                    <option value="main_slider">Main Slider</option>
                    <option value="hero_banner">Hero Banner</option>
                    <option value="sidebar">Sidebar Banner</option>
                    <option value="promo">Promo Grid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Slide Interval (ms)</label>
                  <input 
                    type="number" 
                    value={item.interval_time} 
                    onChange={e => handleChange(index, 'interval_time', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                    placeholder="5000"
                    step="500"
                    min="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                  <input 
                    type="text" 
                    value={item.title} 
                    onChange={e => handleChange(index, 'title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                    placeholder="e.g. Summer Mega Sale"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtitle</label>
                  <input 
                    type="text" 
                    value={item.subtitle} 
                    onChange={e => handleChange(index, 'subtitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                    placeholder="e.g. Up to 50% discount"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">Banner Image <span className="text-rose-500">*</span></label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {item.imagePreview ? (
                      <img src={item.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex flex-col items-center justify-center px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 cursor-pointer bg-white transition">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Upload className="w-4 h-4 text-emerald-600" />
                        <span>Upload Image File</span>
                      </div>
                      <input type="file" accept="image/*" onChange={e => handleFileChange(index, e)} className="hidden" />
                    </label>
                  </div>
                </div>
                <input 
                  type="text" 
                  value={item.image} 
                  onChange={e => {
                    handleChange(index, 'image', e.target.value);
                    handleChange(index, 'imagePreview', e.target.value);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 bg-white mt-1"
                  placeholder="Or paste direct image URL (https://...)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Link URL</label>
                  <input 
                    type="text" 
                    value={item.link_url} 
                    onChange={e => handleChange(index, 'link_url', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                    placeholder="/shop/category"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Button Text</label>
                  <input 
                    type="text" 
                    value={item.button_text} 
                    onChange={e => handleChange(index, 'button_text', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                    placeholder="Shop Now"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sort Order</label>
                  <input 
                    type="number" 
                    value={item.sort_order} 
                    onChange={e => handleChange(index, 'sort_order', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select 
                    value={item.status ? '1' : '0'} 
                    onChange={e => handleChange(index, 'status', e.target.value === '1')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-emerald-600 bg-white"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {!banner && (
            <button 
              type="button" 
              onClick={handleAddMore}
              className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-2xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Another Banner Row
            </button>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {banner ? 'Update Banner' : 'Save All Banners'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}