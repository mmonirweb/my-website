'use client';

import { useState, useEffect, useRef } from 'react';
import { productService } from '@/domains/catalog/services/productService';
import { Product, ProductFormData } from '@/domains/catalog/types/product';
import ProductModal from '@/domains/catalog/components/ProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State and Ref for Action Dropdown Menu
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => setActiveMenuId(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  const toggleMenu = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 140, // width offset for dropdown
      });
      setActiveMenuId(id);
    }
  };

  // Safe & Dynamic Image Path Resolution (Supports both Local & Live Environments)
  const getImageUrl = (product: any): string | null => {
    if (!product) return null;
    const path = product.main_image || product.image || product.image_url || product.image_path || product.photo || product.thumbnail;
    if (!path || typeof path !== 'string') return null;
    
    // Direct Full URL or Base64 Image
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    
    let baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
    
    // Fallback: If ENV variable is not configured, resolve host dynamically from browser window
    if (!baseUrl && typeof window !== 'undefined') {
      baseUrl = window.location.origin;
    }

    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return baseUrl ? `${baseUrl}${cleanPath}` : cleanPath;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getProducts({ search });
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleCreateOrUpdate = async (data: ProductFormData | any) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data);
      } else {
        await productService.createProduct(data);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Operation failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setActiveMenuId(null);
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your enterprise inventory, pricing, and variants</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <span className="text-base">+</span> Add New Product
        </button>
      </div>

      {/* Filter / Search - FIXED SVG PATH */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
        <svg className="w-5 h-5 text-slate-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by product name, SKU or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 pl-6 text-center w-16">Image</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4 text-right">Cost Price</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></span>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-12 text-slate-400">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 pl-6">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mx-auto">
                        {getImageUrl(product) ? (
                          <img
                            src={getImageUrl(product)!}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{product.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">{product.sku}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{product.category?.name || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{product.brand?.name || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-right whitespace-nowrap">৳{Number(product.cost_price).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono text-right whitespace-nowrap">৳{Number(product.selling_price).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        product.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 pr-6 text-right whitespace-nowrap">
                      {/* 3-Dot Action Menu Button */}
                      <button
                        onClick={(e) => toggleMenu(product.id, e)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Dropdown Menu */}
      {activeMenuId !== null && (
        <div
          ref={menuRef}
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          className="fixed z-40 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-xs font-semibold text-slate-700 animate-in fade-in zoom-in-95 duration-100"
        >
          {(() => {
            const product = products.find((p) => p.id === activeMenuId);
            if (!product) return null;
            return (
              <>
                <button
                  onClick={() => {
                    setViewingProduct(product);
                    setActiveMenuId(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </button>
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setIsModalOpen(true);
                    setActiveMenuId(null);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-indigo-600 transition"
                >
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 transition"
                >
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Edit/Create Form Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdate}
        product={editingProduct}
        isSubmitting={isSubmitting}
      />

      {/* Industrial View Details Modal - FIXED IMAGE RENDERING */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl text-slate-800 shadow-2xl my-8 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Product Specification Master</h3>
                <p className="text-xs text-slate-500">ID: #{viewingProduct.id} • {viewingProduct.sku}</p>
              </div>
              <button
                onClick={() => setViewingProduct(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
              <div className="flex flex-col md:flex-row gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 items-center md:items-start">
                <div className="w-28 h-28 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                  {getImageUrl(viewingProduct) ? (
                    <img
                      src={getImageUrl(viewingProduct)!}
                      alt={viewingProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <svg className="w-8 h-8 mx-auto mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px] font-medium block">No Image</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-1">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Product Name</span>
                    <span className="text-base font-bold text-slate-900">{viewingProduct.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold block">Category & Brand</span>
                    <span className="font-semibold text-slate-700">
                      {viewingProduct.category?.name || 'N/A'} • {viewingProduct.brand?.name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Pricing Structure</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-slate-200 p-3.5 rounded-xl bg-white">
                    <p className="text-xs text-slate-500">Cost Price</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">৳{Number(viewingProduct.cost_price).toFixed(2)}</p>
                  </div>
                  <div className="border border-slate-200 p-3.5 rounded-xl bg-white">
                    <p className="text-xs text-slate-500">MRP</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">৳{Number(viewingProduct.mrp_price || 0).toFixed(2)}</p>
                  </div>
                  <div className="border border-emerald-200 bg-emerald-50/50 p-3.5 rounded-xl">
                    <p className="text-xs text-emerald-600 font-medium">Selling Price</p>
                    <p className="text-base font-bold text-emerald-700 mt-0.5">৳{Number(viewingProduct.selling_price).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <span className="text-xs text-slate-400 block">Unit Type</span>
                  <span className="font-semibold text-slate-800">{viewingProduct.unit || 'Pcs'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Barcode</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{viewingProduct.barcode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Low Stock Limit</span>
                  <span className="font-semibold text-slate-800">{viewingProduct.alert_quantity ?? 5}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Status</span>
                  <span className="font-semibold uppercase text-xs text-indigo-600">{viewingProduct.status}</span>
                </div>
              </div>

              {viewingProduct.description && (
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {viewingProduct.description}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setViewingProduct(null)}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}