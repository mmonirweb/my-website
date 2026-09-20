'use client';

import Link from 'next/link';
import { ShoppingBag, Heart, User, Search, Menu } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface NavbarProps {
  categories?: Category[];
}

export default function Navbar({ categories = [] }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 flex justify-between items-center">
        <span>⚡ Free Delivery on orders over $500! Limited time offer.</span>
        <div className="flex items-center gap-4">
          <a href="tel:+8801700000000" className="hover:underline">+880 1700-000000</a>
          <Link href="/login" className="hover:underline font-medium">Admin Login</Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-black tracking-tight text-blue-600">
          NRG <span className="text-slate-800">SOLAR</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <input
            type="text"
            placeholder="Search solar panels, inverters, batteries..."
            className="w-full bg-slate-50 border border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-2.5" />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button type="button" className="p-2 hover:bg-slate-50 rounded-full">
            <User className="w-5 h-5 text-gray-700" />
          </button>
          <button type="button" className="p-2 hover:bg-slate-50 rounded-full relative">
            <Heart className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
          </button>
          <button type="button" className="p-2 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1.5 px-3">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-bold">3</span>
          </button>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <nav className="bg-slate-50 border-t border-gray-100 overflow-x-auto scrollbar-none">
        <div className="container mx-auto px-4 flex items-center gap-6 text-sm font-semibold whitespace-nowrap py-2.5">
          <div className="flex items-center gap-2 text-blue-600 cursor-pointer pr-4 border-r border-gray-200">
            <Menu className="w-4 h-4" />
            <span>All Categories</span>
          </div>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug || cat.id}`}
              className="text-slate-600 hover:text-blue-600 transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}