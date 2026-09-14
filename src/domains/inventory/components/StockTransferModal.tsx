'use client';

import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { StockTransferPayload } from '../types';
import { useInventoryMutations, useWarehouses, useProducts } from '../hooks/useInventory';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const StockTransferModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { transferStockMutation } = useInventoryMutations();
  const { data: warehouseData, isLoading: isLoadingWarehouses } = useWarehouses();
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();

  const warehouses = useMemo(() => warehouseData?.data?.data || [], [warehouseData]);
  const products = useMemo(() => productsData?.data?.data || productsData?.data || [], [productsData]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StockTransferPayload>({
    defaultValues: {
      from_warehouse_id: undefined,
      to_warehouse_id: undefined,
      note: '',
      items: [{ product_id: 0, quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchFromWarehouse = watch('from_warehouse_id');
  const watchToWarehouse = watch('to_warehouse_id');
  const watchItems = watch('items') || [];

  const totalTransferUnits = useMemo(() => {
    return watchItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [watchItems]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: StockTransferPayload) => {
    if (data.from_warehouse_id === data.to_warehouse_id) {
      setError('to_warehouse_id', {
        type: 'manual',
        message: 'Destination warehouse must be different from source',
      });
      return;
    }

    try {
      await transferStockMutation.mutateAsync(data);
      handleClose();
    } catch (err) {
      console.error('Transfer failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>🚚</span> Inter-Warehouse Stock Transfer
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Move inventory stock between operational distribution centers seamlessly.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Warehouse Selection */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* From Warehouse */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                Source Warehouse (From) <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('from_warehouse_id', {
                  valueAsNumber: true,
                  required: 'Source warehouse required',
                })}
                disabled={isLoadingWarehouses}
                className={`w-full rounded-xl border p-2.5 text-xs text-gray-900 dark:text-white dark:bg-gray-950 transition-all ${
                  errors.from_warehouse_id
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                }`}
              >
                <option value="">Select Origin...</option>
                {warehouses.map((wh: any) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </option>
                ))}
              </select>
              {errors.from_warehouse_id && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.from_warehouse_id.message}</p>
              )}
            </div>

            {/* To Warehouse */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                Destination Warehouse (To) <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('to_warehouse_id', {
                  valueAsNumber: true,
                  required: 'Destination warehouse required',
                })}
                disabled={isLoadingWarehouses}
                className={`w-full rounded-xl border p-2.5 text-xs text-gray-900 dark:text-white dark:bg-gray-950 transition-all ${
                  errors.to_warehouse_id
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-gray-200 dark:border-gray-700 focus:border-blue-500'
                }`}
              >
                <option value="">Select Destination...</option>
                {warehouses.map((wh: any) => (
                  <option
                    key={wh.id}
                    value={wh.id}
                    disabled={wh.id === Number(watchFromWarehouse)}
                  >
                    {wh.name} ({wh.code}) {wh.id === Number(watchFromWarehouse) ? '(Source)' : ''}
                  </option>
                ))}
              </select>
              {errors.to_warehouse_id && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{errors.to_warehouse_id.message}</p>
              )}
            </div>
          </div>

          {/* Transfer Note */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
              Transfer Note / Reference
            </label>
            <textarea
              {...register('note')}
              rows={2}
              placeholder="e.g. Replenishing regional hub stock, Order fulfillment balance"
              className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white focus:border-blue-500"
            />
          </div>

          {/* Products Table */}
          <div className="space-y-3 rounded-2xl bg-gray-50/70 p-4 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                Transfer Manifest ({fields.length} Items)
              </label>
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Total Units: <strong className="text-emerald-600 dark:text-emerald-400">{totalTransferUnits}</strong>
              </span>
            </div>

            <div className="space-y-2">
              {fields.map((field, index) => {
                const selectedProductId = watchItems[index]?.product_id;
                const currentProduct = products.find((p: any) => p.id === Number(selectedProductId));
                const availableStock = currentProduct?.stock_quantity ?? currentProduct?.current_stock ?? 'N/A';

                return (
                  <div key={field.id} className="flex flex-col sm:flex-row items-center gap-2 rounded-xl bg-white p-3 shadow-2xs dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                    
                    {/* Product Selection Dropdown */}
                    <div className="w-full sm:w-7/12">
                      <select
                        {...register(`items.${index}.product_id` as const, {
                          valueAsNumber: true,
                          required: true,
                          validate: (val) => val > 0 || 'Select product',
                        })}
                        disabled={isLoadingProducts}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs font-medium text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      >
                        <option value={0}>Choose Product to Transfer...</option>
                        {products.map((prod: any) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} {prod.sku ? `(${prod.sku})` : ''}
                          </option>
                        ))}
                      </select>
                      {currentProduct && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          Available Stock: <strong className="text-emerald-600 dark:text-emerald-400">{availableStock}</strong>
                        </p>
                      )}
                    </div>

                    {/* Quantity Input */}
                    <div className="w-full sm:w-4/12 flex items-center gap-2">
                      <input
                        {...register(`items.${index}.quantity` as const, {
                          valueAsNumber: true,
                          required: true,
                          min: { value: 0.0001, message: 'Min 0.0001' },
                        })}
                        type="number"
                        step="any"
                        placeholder="Transfer Qty"
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                      />
                    </div>

                    {/* Remove Action */}
                    <div className="w-full sm:w-1/12 flex justify-end">
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length === 1}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 disabled:opacity-30 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove Item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => append({ product_id: 0, quantity: 1 })}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400"
            >
              ➕ Add Product to Transfer
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || transferStockMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50"
            >
              {transferStockMutation.isPending && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              Execute Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};