'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShieldCheck, Truck, RefreshCw, Minus, Plus, Loader2, Heart } from 'lucide-react';
import { apiClient } from '@/lib/axios';
import { useLanguage } from '@/context/LanguageContext';
import ProductActionButtons from '@/components/ecommerce/ProductActionButtons';

interface Product {
  id: number;
  category_id?: number;
  brand_id?: number;
  name: string;
  slug: string;
  sku: string;
  barcode?: string;
  weight?: number;
  mrp_price?: number;
  selling_price?: number;
  special_price?: number;
  short_description?: string;
  description?: string;
  main_image?: string;
  featured_image?: string;
  gallery_images?: string[];
  status?: string;
  stock_quantity?: number;
  stock?: number | string;
  inventories?: Array<{ quantity: number }>;
  total_stock?: number;
  brand?: { id: number; name: string; slug?: string };
  [key: string]: any;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const slug = params?.slug;

  const { t } = useLanguage();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'description' | 'spec'>('description');
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [bgPosition, setBgPosition] = useState<string>('0% 0%');
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/ecommerce/products/${slug}`);
        const data = res.data?.data || res.data;
        setProduct(data);
        
        const mainImg = data?.main_image || data?.featured_image;
        setSelectedImage(mainImg || 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image');
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetails();
  }, [slug]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBgPosition(`${x}% ${y}%`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">{t('loadingDetails') || 'Loading...'}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t('productNotFound') || 'Product Not Found'}</h2>
        <p className="text-sm text-slate-500 mb-4">{t('productNotFoundDesc') || 'The product you are looking for does not exist.'}</p>
        <a href="/shop" className="inline-block bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-700 transition">
          {t('backToShop') || 'Back to Shop'}
        </a>
      </div>
    );
  }

  const regularPrice = Number(product.mrp_price || product.selling_price || 0);
  const baseSellingPrice = Number(product.selling_price || 0);
  const hasSpecialPrice = Boolean(product.special_price && product.special_price > 0);
  const sellingPrice = hasSpecialPrice ? Number(product.special_price) : baseSellingPrice;
  
  const hasDiscount = Boolean(regularPrice > 0 && sellingPrice < regularPrice);
  const discountPercentage = hasDiscount 
    ? Math.round(((regularPrice - sellingPrice) / regularPrice) * 100) 
    : 0;

  const rawGallery = Array.isArray(product.gallery_images) ? product.gallery_images : [];
  const mainImgPath = product.main_image || product.featured_image;
  
  const imagesList = [
    mainImgPath,
    ...rawGallery
  ].filter(Boolean) as string[];

  const totalStock = Number(
    product?.total_stock ?? 
    (Array.isArray(product?.inventories) && product.inventories.length > 0
      ? product.inventories.reduce((acc, inv) => acc + Number(inv.quantity || 0), 0) 
      : (product?.stock_quantity ?? product?.stock ?? 0))
  );

  const isStockAvailable = totalStock > 0;

  return (
    <div className="bg-slate-50 min-h-screen pt-0 pb-8">
      <div className="container mx-auto px-4 max-w-7xl pt-0">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 mb-8">
          
          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
            {imagesList.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[380px] pb-2 sm:pb-0 scrollbar-thin shrink-0 order-2 sm:order-1">
                {imagesList.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition bg-slate-50 ${selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-slate-200 opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div 
              ref={imageContainerRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative w-full max-w-[280px] lg:max-w-[320px] aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shadow-inner cursor-crosshair select-none order-1 sm:order-2"
            >
              <img 
                src={selectedImage || 'https://placehold.co/600x600/e2e8f0/64748b?text=No+Image'} 
                alt={product.name} 
                className={`w-full h-full object-contain transition-opacity duration-200 ${isZoomed ? 'opacity-0' : 'opacity-100'}`}
              />

              {isZoomed && (
                <div 
                  className="absolute inset-0 bg-no-repeat pointer-events-none bg-contain bg-center"
                  style={{
                    backgroundImage: `url(${selectedImage})`,
                    backgroundPosition: bgPosition,
                    backgroundSize: '220%',
                  }}
                />
              )}

              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md uppercase tracking-wider z-10">
                  {discountPercentage}% OFF
                </span>
              )}
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition shadow-md z-10 ${isWishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white/80 text-slate-600 hover:bg-white'}`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug pb-1 pt-2">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                {product.sku && <span>SKU: <strong className="text-slate-700">{product.sku}</strong></span>}
                {product.brand?.name && <span>Brand: <strong className="text-slate-700">{product.brand.name}</strong></span>}
                
                <div>
                  {isStockAvailable ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ● Stock Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      ● Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-4 py-3 border-y border-slate-100">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                  ৳{sellingPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-base sm:text-lg text-slate-400 line-through font-bold">
                    ৳{regularPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {product.short_description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.short_description}
                </p>
              )}

              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quantity</label>
                <div className="flex items-center">
                  <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1.5 shadow-xs">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-2.5 rounded-xl bg-white text-slate-600 hover:bg-slate-100 transition shadow-xs cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-slate-800">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="p-2.5 rounded-xl bg-white text-slate-600 hover:bg-slate-100 transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 max-w-xl">
              <ProductActionButtons 
                product={product as any} 
                quantity={quantity} 
                layout="horizontal" 
                showBuyNow={true} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10">
            <div className="flex items-center gap-6 border-b border-slate-100 pb-4 mb-6">
              <button 
                onClick={() => setActiveTab('description')}
                className={`text-sm font-bold pb-3 border-b-2 transition cursor-pointer ${activeTab === 'description' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('spec')}
                className={`text-sm font-bold pb-3 border-b-2 transition cursor-pointer ${activeTab === 'spec' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
              >
                Specifications
              </button>
            </div>

            {activeTab === 'description' ? (
              <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed space-y-4">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className="text-slate-400">No detailed description provided for this product.</p>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-600 space-y-3">
                <div className="flex justify-between py-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-700">Brand</span>
                  <span className="text-slate-900 font-medium">{product.brand?.name || 'Generic'}</span>
                </div>
                {product.weight !== undefined && product.weight > 0 && (
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Weight</span>
                    <span className="text-slate-900 font-medium">{product.weight} kg</span>
                  </div>
                )}
                {product.barcode && (
                  <div className="flex justify-between py-3 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Barcode</span>
                    <span className="text-slate-900 font-medium">{product.barcode}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Fast Delivery</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Reliable shipping across the country.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">100% Original</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Guaranteed authentic quality products.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Easy Returns</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Hassle-free return policy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}