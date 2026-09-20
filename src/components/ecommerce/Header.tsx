'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Phone,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Headphones,
  Flame,
  Loader2,
  Camera,
  Image as ImageIcon,
  FolderTree,
  Grid,
} from 'lucide-react';

// Cart Context
import { useCart } from '@/context/CartContext';

// Settings Service
import { settingService } from '@/domains/settings/services/settingService';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

interface HeaderProps {
  categories?: Category[];
  wishlistCount?: number;
  onSearch?: (query: string) => void;
  onImageSearch?: (file: File) => void;
  searchResults?: Product[];
  isSearching?: boolean;
}

export default function Header({
  categories = [],
  wishlistCount = 0,
  onSearch,
  onImageSearch,
  searchResults = [],
  isSearching = false,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { totalItems, subtotal } = useCart();

  useEffect(() => {
    async function fetchHeaderSettings() {
      try {
        const data = await settingService.getPublicSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings in Header:', error);
      }
    }

    fetchHeaderSettings();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsSearchFocused(true);

      if (onImageSearch) {
        onImageSearch(file);
      }
    }
  };

  const clearImageSearch = () => {
    setSelectedImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const phone = settings?.store_info?.phone || settings?.phone || '+880 1700-000000';
  const siteLogo = settings?.logo || settings?.general?.logo;

  return (
    <header className="w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-b border-emerald-200/60 shadow-[0_4px_20px_rgba(16,185,129,0.08)] sticky top-0 z-50 text-emerald-950">
      {/* Top Bar */}
      <div className="bg-emerald-100/70 backdrop-blur-md text-emerald-900 text-xs py-2 px-4 border-b border-emerald-200/50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 font-medium px-3 py-1 rounded-full border border-amber-300/60 text-[11px] tracking-wide shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 animate-pulse" /> Hot Deal Offer
            </span>
            <p className="hidden md:inline-block text-emerald-800 font-normal">
              Free Express Shipping on Orders Over <span className="text-emerald-950 font-semibold">৳500</span>
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden lg:flex items-center gap-3 border-r border-emerald-300 pr-5 text-emerald-800">
              <span className="flex items-center gap-1.5 hover:text-emerald-950 transition cursor-pointer font-normal">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Verified Quality
              </span>
            </div>

            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 hover:text-emerald-950 transition font-medium text-emerald-900"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{phone}</span>
            </a>

            <Link
              href="/login"
              className="hover:text-emerald-950 transition font-medium border-l border-emerald-300 pl-4 hidden sm:inline-block text-emerald-900"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-6">
          
          {/* Left: Mobile Navigation Button & Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 hover:bg-emerald-200/50 rounded-xl text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
              aria-label="Toggle Mobile Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              {siteLogo ? (
                <div className="relative h-14 md:h-16 w-auto min-w-[140px] max-w-[240px] flex items-center">
                  <Image
                    src={siteLogo}
                    alt="Logo"
                    width={220}
                    height={64}
                    unoptimized={true}
                    priority
                    className="object-contain max-h-14 md:max-h-16 w-auto group-hover:scale-105 transition duration-300 filter drop-shadow-sm"
                  />
                </div>
              ) : (
                <div className="h-14 min-w-[140px] flex items-center font-bold text-lg text-emerald-900 tracking-wider">
                  NRGSOLARBD
                </div>
              )}
            </Link>
          </div>

          {/* Center: Live Text & Visual Image Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block relative" ref={searchRef}>
            <div className="relative flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search products or upload image to search..."
                  className="w-full bg-white/80 border border-emerald-300 rounded-full py-3 pl-11 pr-24 text-sm font-normal text-emerald-950 placeholder-emerald-600/60 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition shadow-sm backdrop-blur-md"
                />
                <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />

                {/* Image Upload Input & Trigger */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Search by Image"
                    className="p-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 hover:text-emerald-950 transition flex items-center gap-1 px-2.5 text-xs border border-emerald-300 shadow-sm cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-[11px] font-medium hidden lg:inline">Image</span>
                  </button>

                  {isSearching && (
                    <Loader2 className="w-4 h-4 text-amber-600 animate-spin ml-1" />
                  )}
                </div>
              </div>
            </div>

            {/* Live Search & Visual Search Results Dropdown */}
            {isSearchFocused && (searchQuery.trim().length > 0 || selectedImagePreview) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-emerald-200 rounded-2xl shadow-xl py-3 z-50 max-h-96 overflow-y-auto text-emerald-950">
                
                {selectedImagePreview && (
                  <div className="px-4 pb-3 mb-2 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Image src={selectedImagePreview} alt="Uploaded Search" width={40} height={40} className="object-cover rounded-xl border border-emerald-200" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-950">Visual Search Active</div>
                        <div className="text-[10px] text-emerald-600">Showing matching or related products</div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={clearImageSearch}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 cursor-pointer"
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                <div className="px-3 pb-1 text-[11px] uppercase tracking-wider text-amber-700 font-bold">
                  {searchResults.length > 0 ? 'Matching & Suggested Products' : 'Related Recommendations'}
                </div>

                {searchResults.length > 0 ? (
                  searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 transition text-xs text-emerald-900"
                    >
                      {product.image ? (
                        <Image src={product.image} alt={product.name} width={40} height={40} className="object-cover rounded-xl border border-emerald-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-200">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-emerald-950 hover:text-amber-700 transition">{product.name}</div>
                        <div className="text-[11px] text-amber-700 font-semibold mt-0.5">৳{product.price}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-emerald-700">
                    <p className="font-medium text-emerald-900">Exact product not found!</p>
                    <p className="text-[11px] text-emerald-600 mt-1">Here are some popular related products you might like.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: User, Wishlist, Cart */}
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/account"
              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-emerald-200/50 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-amber-400 group-hover:text-amber-950 flex items-center justify-center text-emerald-800 transition shadow-sm border border-emerald-200">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[9px] text-emerald-600 font-medium uppercase tracking-wider leading-tight">Welcome</span>
                <span className="text-xs font-semibold text-emerald-950 group-hover:text-amber-700 transition">My Account</span>
              </div>
            </Link>

            <Link
              href="/wishlist"
              className="relative p-2 rounded-xl hover:bg-emerald-200/50 transition text-emerald-900 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-rose-50 group-hover:text-rose-500 flex items-center justify-center transition shadow-sm border border-emerald-200">
                <Heart className="w-4 h-4" />
              </div>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="flex items-center gap-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 active:scale-95 text-amber-950 p-2 md:px-4 md:py-2.5 rounded-2xl transition shadow-md shadow-amber-300/30 font-bold group cursor-pointer border border-amber-300"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-amber-950 transition" />
                <span className="absolute -top-2.5 -right-2.5 bg-emerald-950 text-amber-300 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-amber-300 transition shadow-sm">
                  {totalItems}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[8px] text-amber-900 font-extrabold uppercase tracking-wider leading-none">Cart</span>
                <span className="text-xs font-black text-amber-950 mt-0.5">৳{(subtotal || 0).toFixed(2)}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="p-3 bg-emerald-100/80 border-t border-emerald-200/60 md:hidden">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or upload image..."
              className="w-full bg-white border border-emerald-300 rounded-full py-2.5 pl-10 pr-4 text-xs font-normal text-emerald-950 placeholder-emerald-600 focus:outline-none focus:border-amber-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-white rounded-full text-emerald-900 border border-emerald-300 flex items-center justify-center shadow-sm cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-700" />
          </button>
        </div>
      </div>

      {/* Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-60 max-w-[75%] bg-white/90 backdrop-blur-xl text-emerald-950 h-full shadow-2xl flex flex-col justify-between p-4 z-10 overflow-y-auto border-r border-emerald-200/60">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60">
                <span className="text-sm font-bold text-emerald-950">Categories & Menu</span>
                <button 
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-emerald-800 hover:bg-emerald-200/50 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-3">
                <div className="space-y-1">
                  <div className="text-[11px] uppercase font-bold text-amber-800 px-1 tracking-wider flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5" /> Categories
                  </div>
                  <div className="rounded-xl p-1 max-h-60 overflow-y-auto space-y-1">
                    <Link
                      href="/shop"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 transition border border-amber-200/60 mb-1.5"
                    >
                      <span className="flex items-center gap-2">
                        <Grid className="w-3.5 h-3.5 text-amber-700" />
                        সকল প্রোডাক্ট (All Products)
                      </span>
                      <ArrowRight className="w-3 h-3 text-amber-700" />
                    </Link>

                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-900 hover:text-emerald-950 hover:bg-emerald-100/60 transition"
                        >
                          <span>{category.name}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                        </Link>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-center text-[11px] text-emerald-600">
                        No categories found.
                      </div>
                    )}
                  </div>
                </div>

                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-emerald-900 font-medium text-xs hover:bg-emerald-100/50 transition"
                >
                  <span>Portal Login / Register</span>
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200/60 space-y-2">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2.5 p-3 rounded-xl text-emerald-900 font-medium text-xs hover:bg-emerald-100/50 transition"
              >
                <Headphones className="w-4 h-4 text-amber-700" />
                <div>
                  <div className="text-[9px] text-emerald-600 uppercase font-semibold">Support Line</div>
                  <div className="font-bold text-emerald-950 text-xs">{phone}</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}