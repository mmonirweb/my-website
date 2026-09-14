'use client';

import { useState, useEffect, useRef, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Product, ProductFormData, Category, Brand, TaxRate } from '../types/product';
import { Unit } from '../types/catalog';
import { apiClient } from '@/lib/axios';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  product?: Product | null;
  isSubmitting: boolean;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isSubmitting,
}: ProductModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'inventory' | 'media' | 'seo'>('general');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    category_id: '',
    brand_id: '',
    tax_rate_id: '',
    name: '',
    slug: '',
    sku: '',
    barcode: '',
    barcode_symbology: 'CODE128',
    unit: 'Pcs',
    weight: 0,
    length: '',
    width: '',
    height: '',
    alert_quantity: 5,
    track_inventory: true,
    is_variant: false,
    cost_price: 0,
    avg_cost_price: 0,
    mrp_price: 0,
    selling_price: 0,
    special_price: '',
    special_price_start: '',
    special_price_end: '',
    short_description: '',
    description: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_featured: false,
    is_digital: false,
    status: 'active',
  });

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      if (product) {
        setFormData({
          category_id: product.category_id || product.category?.id || '',
          brand_id: product.brand_id || product.brand?.id || '',
          tax_rate_id: product.tax_rate_id || '',
          name: product.name || '',
          slug: product.slug || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          barcode_symbology: product.barcode_symbology || 'CODE128',
          unit: product.unit || 'Pcs',
          weight: product.weight || 0,
          length: product.length || '',
          width: product.width || '',
          height: product.height || '',
          alert_quantity: product.alert_quantity ?? 5,
          track_inventory: product.track_inventory ?? true,
          is_variant: product.is_variant ?? false,
          cost_price: product.cost_price || 0,
          avg_cost_price: product.avg_cost_price || 0,
          mrp_price: product.mrp_price || 0,
          selling_price: product.selling_price || 0,
          special_price: product.special_price || '',
          special_price_start: product.special_price_start || '',
          special_price_end: product.special_price_end || '',
          short_description: product.short_description || '',
          description: product.description || '',
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
          meta_keywords: Array.isArray(product.meta_keywords) ? product.meta_keywords.join(', ') : (product.meta_keywords || ''),
          is_featured: product.is_featured ?? false,
          is_digital: product.is_digital ?? false,
          status: product.status || 'active',
        });
        if (product.main_image) setMainImagePreview(product.main_image);
        if (product.gallery_images) setGalleryPreviews(product.gallery_images);
      } else {
        resetForm();
      }
    }
  }, [isOpen, product]);

  const resetForm = () => {
    setFormData({
      category_id: '',
      brand_id: '',
      tax_rate_id: '',
      name: '',
      slug: '',
      sku: '',
      barcode: '',
      barcode_symbology: 'CODE128',
      unit: 'Pcs',
      weight: 0,
      length: '',
      width: '',
      height: '',
      alert_quantity: 5,
      track_inventory: true,
      is_variant: false,
      cost_price: 0,
      avg_cost_price: 0,
      mrp_price: 0,
      selling_price: 0,
      special_price: '',
      special_price_start: '',
      special_price_end: '',
      short_description: '',
      description: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      is_featured: false,
      is_digital: false,
      status: 'active',
    });
    setMainImageFile(null);
    setMainImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setActiveTab('general');
  };

  const fetchDependencies = async () => {
    try {
      const [catRes, brandRes, taxRes, unitRes] = await Promise.all([
        apiClient.get('/catalog/categories'),
        apiClient.get('/catalog/brands'),
        apiClient.get('/catalog/tax-rates').catch(() => ({ data: [] })),
        apiClient.get('/catalog/units').catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data?.data?.data || catRes.data?.data || catRes.data || []);
      setBrands(brandRes.data?.data?.data || brandRes.data?.data || brandRes.data || []);
      setTaxRates(taxRes.data?.data || taxRes.data || []);
      setUnits(unitRes.data?.data || unitRes.data || []);
    } catch (error) {
      console.error('Failed to load form dependencies:', error);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const generateBarcode = () => {
    const randomBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setFormData((prev) => ({ ...prev, barcode: randomBarcode }));
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    const sku = formData.sku || (name ? name.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000) : '');
    setFormData((prev) => ({ ...prev, name, slug, sku }));
  };

  const handleBarcodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleMainImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGalleryFiles((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const costPrice = Number(formData.cost_price) || 0;
  const sellingPrice = Number(formData.selling_price) || 0;
  const mrpPrice = Number(formData.mrp_price) || 0;
  
  const profit = sellingPrice - costPrice;
  const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : '0';
  const discountPercent = mrpPrice > sellingPrice ? (((mrpPrice - sellingPrice) / mrpPrice) * 100).toFixed(0) : '0';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          submissionData.append(key, value ? '1' : '0');
        } else {
          submissionData.append(key, String(value));
        }
      }
    });

    if (mainImageFile) {
      submissionData.append('main_image', mainImageFile);
    }

    galleryFiles.forEach((file) => {
      submissionData.append('gallery_images[]', file);
    });

    onSubmit(submissionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl text-slate-800 shadow-2xl my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {product ? 'Edit Product Master' : 'Create New Enterprise Product Master'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Comprehensive ERP inventory, barcode, multi-pricing, and e-commerce configurations.</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-8 gap-8 text-sm font-semibold bg-slate-50/80 overflow-x-auto">
          {[
            { id: 'general', label: '1. General Info' },
            { id: 'pricing', label: '2. Pricing & Tax' },
            { id: 'inventory', label: '3. Inventory & Specs' },
            { id: 'media', label: '4. Media & Gallery' },
            { id: 'seo', label: '5. SEO Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ergonomic Office Chair"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    URL Slug (Auto Generated)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-indigo-600 outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition text-slate-900"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Brand
                  </label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition text-slate-900"
                  >
                    <option value="">-- Select Brand --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Short Description (Summary)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short bullet summary for instant view or app cards..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Full Detailed Specification & Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Enter full specification, features, warranty info..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition text-slate-900"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 accent-indigo-600"
                  />
                  Featured Product (Show on homepage)
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_digital}
                    onChange={(e) => setFormData({ ...formData, is_digital: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 accent-indigo-600"
                  />
                  Digital / Downloadable Item
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Pricing & Tax */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Cost Price / Base Purchase ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    MRP / Strikethrough Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mrp_price}
                    onChange={(e) => setFormData({ ...formData, mrp_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Selling / Retail Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Profit & Discount Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Estimated Gross Profit:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">${profit.toFixed(2)}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                      {margin}% Margin
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Display Discount:</span>
                  <span className="text-xs px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold">
                    {discountPercent}% OFF
                  </span>
                </div>
              </div>

              {/* Offer / Special Pricing */}
              <div className="border-t border-slate-200 pt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Offer / Special Deal Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Offer Price"
                    value={formData.special_price}
                    onChange={(e) => setFormData({ ...formData, special_price: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Offer Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.special_price_start}
                    onChange={(e) => setFormData({ ...formData, special_price_start: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Offer End Date
                  </label>
                  <input
                    type="date"
                    value={formData.special_price_end}
                    onChange={(e) => setFormData({ ...formData, special_price_end: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Tax Settings */}
              <div className="border-t border-slate-200 pt-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Tax Rate Class
                </label>
                <select
                  value={formData.tax_rate_id}
                  onChange={(e) => setFormData({ ...formData, tax_rate_id: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                >
                  <option value="">No Tax / Exempted (0%)</option>
                  {taxRates.map((tax) => (
                    <option key={tax.id} value={tax.id}>
                      {tax.name} ({tax.rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 3: Inventory & Specs */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Barcode / EAN / UPC (Hardware Scanner Enabled)
                    </label>
                    <button
                      type="button"
                      onClick={generateBarcode}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Generate Barcode
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      placeholder="Scan with barcode reader or typing..."
                      value={formData.barcode}
                      onKeyDown={handleBarcodeKeyDown}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none font-mono text-slate-900"
                    />
                    <select
                      value={formData.barcode_symbology}
                      onChange={(e) => setFormData({ ...formData, barcode_symbology: e.target.value as any })}
                      className="bg-white border border-slate-300 rounded-xl px-3 text-xs outline-none text-slate-900"
                    >
                      <option value="CODE128">CODE128</option>
                      <option value="CODE39">CODE39</option>
                      <option value="EAN13">EAN13</option>
                      <option value="UPCA">UPCA</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Unit Type *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition text-slate-900"
                  >
                    <option value="">-- Select Unit --</option>
                    {units.length > 0 ? (
                      units.map((u) => (
                        <option key={u.id} value={u.name || u.short_name || String(u.id)}>
                          {u.name} {u.short_name ? `(${u.short_name})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Pcs">Pcs</option>
                        <option value="Box">Box</option>
                        <option value="Kg">Kg</option>
                        <option value="Meter">Meter</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    value={formData.alert_quantity}
                    onChange={(e) => setFormData({ ...formData, alert_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Visibility Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Physical Shipping Dimensions */}
              <div className="border-t border-slate-200 pt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">Shipping & Weight Dimensions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Length (cm)</label>
                    <input
                      type="number"
                      value={formData.length}
                      onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Width (cm)</label>
                    <input
                      type="number"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Media & Gallery */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Primary Thumbnail / Main Cover
                </label>
                <div className="flex items-center gap-4">
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-600 rounded-2xl p-6 text-center bg-slate-50 transition relative flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <p className="text-sm text-slate-700 font-medium">Click or Drag main product image</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP up to 10MB (Auto Converted to WebP)</p>
                  </div>
                  {mainImagePreview && (
                    <div className="w-24 h-24 rounded-2xl border border-slate-200 bg-white overflow-hidden relative">
                      <img src={mainImagePreview} alt="Main Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Product Gallery Images
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-600 rounded-2xl p-6 text-center bg-slate-50 transition relative cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-sm text-slate-700 font-medium">Click or Drag multiple gallery images</p>
                  <p className="text-xs text-slate-500 mt-1">Upload multiple angles of the product</p>
                </div>

                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-4">
                    {galleryPreviews.map((src, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white h-20">
                        <img src={src} alt="Gallery item" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: SEO Settings */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  placeholder="Meta Title for Google Search"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meta Keywords (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="chair, ergonomic chair, office furniture"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary that appears in search results..."
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none text-slate-900"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <span className="text-xs text-slate-500">* Required fields must be filled.</span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Product...' : 'Save Product Master'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}