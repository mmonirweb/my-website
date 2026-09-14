'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useInventoryMutations } from '../hooks/useInventory';
import { Warehouse, WarehousePayload } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  warehouse?: Warehouse | null;
}

export const WarehouseModal: React.FC<Props> = ({ isOpen, onClose, warehouse }) => {
  const { createWarehouseMutation, updateWarehouseMutation } = useInventoryMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WarehousePayload>({
    defaultValues: {
      name: '',
      code: '',
      type: 'central',
      manager_name: '',
      phone: '',
      email: '',
      emergency_phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      latitude: null,
      longitude: null,
      total_capacity_sqft: null,
      max_weight_capacity_tons: null,
      operating_hours: '08:00 AM - 06:00 PM',
      is_active: true,
      is_default: false,
      allow_negative_inventory: false,
    },
  });

  useEffect(() => {
    if (warehouse) {
      reset(warehouse);
    } else {
      reset({
        name: '',
        code: '',
        type: 'central',
        manager_name: '',
        phone: '',
        email: '',
        emergency_phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        latitude: null,
        longitude: null,
        total_capacity_sqft: null,
        max_weight_capacity_tons: null,
        operating_hours: '08:00 AM - 06:00 PM',
        is_active: true,
        is_default: false,
        allow_negative_inventory: false,
      });
    }
  }, [warehouse, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: WarehousePayload) => {
    try {
      if (warehouse?.id) {
        await updateWarehouseMutation.mutateAsync({ id: warehouse.id, payload: data });
      } else {
        await createWarehouseMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Failed to commit enterprise warehouse record', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        
        {/* Fixed Header Section */}
        <div className="flex items-center justify-between border-b p-6 dark:border-gray-800 shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
              {warehouse ? 'Edit Enterprise Warehouse Facility' : 'Provision New Warehouse Facility'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure operational boundaries, logistics specifications, and capacity constraints.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Form Container with Independent Scrollbar */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Section 1: Core Identifiers */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                1. Facility Identification & Type
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Facility Name *</label>
                  <input
                    {...register('name', { required: 'Facility name is required' })}
                    placeholder="e.g. Central Logistics Hub Alpha"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Warehouse Code *</label>
                  <input
                    {...register('code', { required: 'Code is required' })}
                    placeholder="e.g. WH-DAC-001"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  {errors.code && <span className="text-xs text-red-500">{errors.code.message}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Warehouse Type *</label>
                  <select
                    {...register('type')}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="central">Central Distribution Center</option>
                    <option value="fulfillment">Fulfillment Hub</option>
                    <option value="cold_storage">Cold Storage Unit</option>
                    <option value="transit_hub">Cross-Dock / Transit Hub</option>
                    <option value="retail_backroom">Retail Backroom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Responsible Officers */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                2. Personnel & Contact Matrix
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Facility Manager</label>
                  <input
                    {...register('manager_name')}
                    placeholder="Manager Full Name"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Official Phone</label>
                  <input
                    {...register('phone')}
                    placeholder="+880 1700-000000"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Emergency Phone</label>
                  <input
                    {...register('emergency_phone')}
                    placeholder="24/7 Hotline"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Official Email</label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="wh-admin@company.com"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Physical Location & GPS Coordinates */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                3. GIS Location & Address
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Street Address</label>
                  <input
                    {...register('address')}
                    placeholder="Plot No, Road Name, Industrial Zone Area"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">City / District</label>
                  <input
                    {...register('city')}
                    placeholder="e.g. Gazipur"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">State / Division</label>
                  <input
                    {...register('state')}
                    placeholder="e.g. Dhaka"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Postal Code</label>
                  <input
                    {...register('postal_code')}
                    placeholder="e.g. 1700"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    {...register('latitude', { valueAsNumber: true })}
                    placeholder="23.8103"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    {...register('longitude', { valueAsNumber: true })}
                    placeholder="90.4125"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Operating Hours</label>
                  <input
                    {...register('operating_hours')}
                    placeholder="e.g. 06:00 AM - 10:00 PM"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Physical Capacity & Constraints */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                4. Industrial Capacity & Logistics Parameters
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Floor Capacity (Sq. Ft.)</label>
                  <input
                    type="number"
                    {...register('total_capacity_sqft', { valueAsNumber: true })}
                    placeholder="e.g. 45000"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Max Load Capacity (Metric Tons)</label>
                  <input
                    type="number"
                    {...register('max_weight_capacity_tons', { valueAsNumber: true })}
                    placeholder="e.g. 1200"
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: System Operational Flags */}
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Operational Controls & System Policies
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="flex items-center gap-3 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Active Status
                </label>

                <label className="flex items-center gap-3 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_default')}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  System Default Warehouse
                </label>

                <label className="flex items-center gap-3 text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allow_negative_inventory')}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Allow Negative Stock Balance
                </label>
              </div>
            </div>
          </div>

          {/* Fixed Action Controls */}
          <div className="flex items-center justify-end gap-3 border-t p-6 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : warehouse ? 'Update Facility Record' : 'Save & Provision Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};