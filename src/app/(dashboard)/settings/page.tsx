'use client';

import React, { useState, useEffect } from 'react';
import { useSettings } from '@/domains/settings/hooks/useSettings';
import { StoreSettings } from '@/domains/settings/types';
import { 
  Save, RotateCcw, Upload, Settings as SettingsIcon, Store, CreditCard, 
  Truck, Percent, Mail, MessageSquare, Search, Palette, RefreshCw, Globe
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useSettings();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: keyof StoreSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key: string, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        data.append(key, typeof val === 'boolean' ? (val ? '1' : '0') : String(val));
      } else {
        data.append(key, '');
      }
    });

    Object.entries(files).forEach(([key, file]) => {
      data.append(key, file);
    });

    try {
      await updateSettings(data);
      alert('Settings updated successfully!');
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 p-6 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-emerald-600 p-3 text-white shadow-md">
            <SettingsIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Global Settings</h1>
            <p className="text-sm text-slate-600">Configure enterprise store settings, gateways, localization, and policies.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { id: 'general', label: 'General Settings', icon: SettingsIcon },
          { id: 'store', label: 'Store Info', icon: Store },
          { id: 'localization', label: 'Localization', icon: Globe },
          { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
          { id: 'shipping', label: 'Shipping Methods', icon: Truck },
          { id: 'tax', label: 'Tax Settings', icon: Percent },
          { id: 'notifications', label: 'Notifications', icon: Mail },
          { id: 'seo', label: 'SEO Settings', icon: Search },
          { id: 'appearance', label: 'Appearance', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* General Settings */}
          {(activeTab === 'general' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-emerald-600" /> General Settings
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Site Name *</label>
                <input
                  type="text"
                  value={formData.site_name || ''}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Site URL *</label>
                <input
                  type="text"
                  value={formData.site_url || ''}
                  onChange={(e) => handleChange('site_url', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Default Language</label>
                  <select
                    value={formData.default_language || 'English'}
                    onChange={(e) => handleChange('default_language', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Bangla">Bangla</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Timezone</label>
                  <select
                    value={formData.timezone || '(GMT+6:00) Dhaka'}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="(GMT+6:00) Dhaka">(GMT+6:00) Dhaka</option>
                    <option value="(GMT+0:00) UTC">(GMT+0:00) UTC</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable Maintenance Mode</span>
                  <input
                    type="checkbox"
                    checked={!!formData.enable_maintenance_mode}
                    onChange={(e) => handleChange('enable_maintenance_mode', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Allow Guest Checkout</span>
                  <input
                    type="checkbox"
                    checked={!!formData.allow_guest_checkout}
                    onChange={(e) => handleChange('allow_guest_checkout', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable Wishlist</span>
                  <input
                    type="checkbox"
                    checked={!!formData.enable_wishlist}
                    onChange={(e) => handleChange('enable_wishlist', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Store Info & Assets */}
          {(activeTab === 'store' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Store className="h-5 w-5 text-emerald-600" /> Store Information & Assets
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2 border-b border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Store Logo</label>
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="h-16 w-full rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-white">
                      {previews.logo || formData.logo ? (
                        <img src={previews.logo || formData.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400">No Logo</span>
                      )}
                    </div>
                    <label className="w-full cursor-pointer rounded-lg bg-slate-200 hover:bg-slate-300 px-3 py-1.5 text-center text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition">
                      <Upload className="h-3.5 w-3.5" /> Change Logo
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Website Favicon</label>
                  <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="h-16 w-full rounded-lg border border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-white">
                      {previews.favicon || formData.favicon ? (
                        <img src={previews.favicon || formData.favicon} alt="Favicon" className="h-8 w-8 object-contain" />
                      ) : (
                        <Globe className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <label className="w-full cursor-pointer rounded-lg bg-slate-200 hover:bg-slate-300 px-3 py-1.5 text-center text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition">
                      <Upload className="h-3.5 w-3.5" /> Change Favicon
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange('favicon', e.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Store Name *</label>
                <input
                  type="text"
                  value={formData.store_name || ''}
                  onChange={(e) => handleChange('store_name', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Store Email *</label>
                <input
                  type="email"
                  value={formData.store_email || ''}
                  onChange={(e) => handleChange('store_email', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Phone Number *</label>
                <input
                  type="text"
                  value={formData.phone_number || ''}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Address *</label>
                <textarea
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Localization & Currency */}
          {(activeTab === 'localization' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-600" /> Currency & Localization
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Currency Code</label>
                  <input
                    type="text"
                    value={formData.currency || 'BDT'}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Symbol Position</label>
                  <select
                    value={formData.currency_symbol_position || 'left'}
                    onChange={(e) => handleChange('currency_symbol_position', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="left">Left (e.g. $100)</option>
                    <option value="right">Right (e.g. 100৳)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Date Format</label>
                  <input
                    type="text"
                    value={formData.date_format || 'Y-m-d'}
                    onChange={(e) => handleChange('date_format', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Time Format</label>
                  <input
                    type="text"
                    value={formData.time_format || 'H:i'}
                    onChange={(e) => handleChange('time_format', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Decimal Separator</label>
                  <input
                    type="text"
                    value={formData.decimal_separator || '.'}
                    onChange={(e) => handleChange('decimal_separator', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase">Thousand Separator</label>
                  <input
                    type="text"
                    value={formData.thousand_separator || ','}
                    onChange={(e) => handleChange('thousand_separator', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Gateways */}
          {(activeTab === 'payment' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" /> Payment Gateways Configuration
              </h2>
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable Stripe Payment</span>
                  <input
                    type="checkbox"
                    checked={!!formData.stripe_enabled}
                    onChange={(e) => handleChange('stripe_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable PayPal Payment</span>
                  <input
                    type="checkbox"
                    checked={!!formData.paypal_enabled}
                    onChange={(e) => handleChange('paypal_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable SSLCommerz Gateway</span>
                  <input
                    type="checkbox"
                    checked={!!formData.sslcommerz_enabled}
                    onChange={(e) => handleChange('sslcommerz_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable Cash on Delivery (COD)</span>
                  <input
                    type="checkbox"
                    checked={!!formData.cod_enabled}
                    onChange={(e) => handleChange('cod_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable Bank Transfer</span>
                  <input
                    type="checkbox"
                    checked={!!formData.bank_transfer_enabled}
                    onChange={(e) => handleChange('bank_transfer_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Shipping Methods */}
          {(activeTab === 'shipping' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Truck className="h-5 w-5 text-emerald-600" /> Shipping Methods
              </h2>
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Flat Rate Shipping</span>
                  <input
                    type="checkbox"
                    checked={!!formData.shipping_flat_rate_enabled}
                    onChange={(e) => handleChange('shipping_flat_rate_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Free Shipping Option</span>
                  <input
                    type="checkbox"
                    checked={!!formData.shipping_free_shipping_enabled}
                    onChange={(e) => handleChange('shipping_free_shipping_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Local Store Pickup</span>
                  <input
                    type="checkbox"
                    checked={!!formData.shipping_local_pickup_enabled}
                    onChange={(e) => handleChange('shipping_local_pickup_enabled', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Tax Settings */}
          {(activeTab === 'tax' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Percent className="h-5 w-5 text-emerald-600" /> Tax Settings
              </h2>
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Enable Tax Calculation</span>
                  <input
                    type="checkbox"
                    checked={!!formData.enable_tax_calculation}
                    onChange={(e) => handleChange('enable_tax_calculation', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Tax Type</label>
                <select
                  value={formData.tax_type || 'exclusive'}
                  onChange={(e) => handleChange('tax_type', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="inclusive">Inclusive (Included in product price)</option>
                  <option value="exclusive">Exclusive (Added at checkout)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Default Tax Rate (%)</label>
                <input
                  type="number"
                  value={formData.default_tax_rate || 0}
                  onChange={(e) => handleChange('default_tax_rate', Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {(activeTab === 'notifications' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-600" /> Notification Preferences
              </h2>
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Order Confirmation Email</span>
                  <input
                    type="checkbox"
                    checked={!!formData.order_confirmation_email}
                    onChange={(e) => handleChange('order_confirmation_email', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Shipping Update Email</span>
                  <input
                    type="checkbox"
                    checked={!!formData.shipping_update_email}
                    onChange={(e) => handleChange('shipping_update_email', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Password Reset Email</span>
                  <input
                    type="checkbox"
                    checked={!!formData.password_reset_email}
                    onChange={(e) => handleChange('password_reset_email', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>Promotional Email Alerts</span>
                  <input
                    type="checkbox"
                    checked={!!formData.promotional_email}
                    onChange={(e) => handleChange('promotional_email', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 cursor-pointer">
                  <span>SMS Order Alerts</span>
                  <input
                    type="checkbox"
                    checked={!!formData.sms_order_alerts}
                    onChange={(e) => handleChange('sms_order_alerts', e.target.checked)}
                    className="h-5 w-5 accent-emerald-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* SEO Settings */}
          {(activeTab === 'seo' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Search className="h-5 w-5 text-emerald-600" /> Search Engine Optimization (SEO)
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Meta Title</label>
                <input
                  type="text"
                  value={formData.meta_title || ''}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Meta Description</label>
                <textarea
                  rows={2}
                  value={formData.meta_description || ''}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Google Analytics ID</label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={formData.google_analytics_id || ''}
                  onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Appearance */}
          {(activeTab === 'appearance' || activeTab === 'all') && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Palette className="h-5 w-5 text-emerald-600" /> Appearance & Theme Settings
              </h2>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Storefront Theme</label>
                <select
                  value={formData.theme || 'modern'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="modern">Modern Theme</option>
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase">Primary Brand Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={formData.primary_color || '#10b981'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="h-10 w-16 rounded border border-slate-300 p-1 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color || '#10b981'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-emerald-500 focus:outline-none uppercase"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={() => setFormData(settings || {})}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset to Default
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {isUpdating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}