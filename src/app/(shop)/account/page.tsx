'use client';

import React from 'react';
import Link from 'next/link';
import { User, Package, MapPin, Heart, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';

export default function CustomerAccountDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 text-emerald-950">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-3xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center text-2xl font-black shadow-md">
              <User className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-emerald-950">মোঃ রাহমাতুল্লাহ</h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">ভেরিফাইড</span>
              </div>
              <p className="text-xs text-emerald-600 mt-0.5">rahmatullah@gmail.com | 01700000000</p>
            </div>
          </div>
          <Link
            href="/account/login"
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs font-bold transition border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" /> লগ আউট
          </Link>
        </div>

        {/* Navigation / Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/account/orders"
            className="bg-white/80 hover:bg-white backdrop-blur-xl border border-emerald-200 p-5 rounded-2xl transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-amber-950 transition">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-emerald-950">আমার অর্ডারসমূহ</h2>
                <p className="text-[11px] text-emerald-600 mt-0.5">অর্ডারের বর্তমান অবস্থা ও হিস্ট্রি দেখুন</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/wishlist"
            className="bg-white/80 hover:bg-white backdrop-blur-xl border border-emerald-200 p-5 rounded-2xl transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-amber-950 transition">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-emerald-950">পছন্দের তালিকা (Wishlist)</h2>
                <p className="text-[11px] text-emerald-600 mt-0.5">আপনার সেভ করা প্রোডাক্টগুলো দেখুন</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/account/addresses"
            className="bg-white/80 hover:bg-white backdrop-blur-xl border border-emerald-200 p-5 rounded-2xl transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-amber-950 transition">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-emerald-950">শিপিং এড্রেস</h2>
                <p className="text-[11px] text-emerald-600 mt-0.5">ডেলিভারি ঠিকানা যুক্ত ও আপডেট করুন</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/account/settings"
            className="bg-white/80 hover:bg-white backdrop-blur-xl border border-emerald-200 p-5 rounded-2xl transition shadow-xs flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-amber-400 group-hover:text-amber-950 transition">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-emerald-950">একাউন্ট সেটিংস</h2>
                <p className="text-[11px] text-emerald-600 mt-0.5">পাসওয়ার্ড ও ব্যক্তিগত তথ্য পরিবর্তন</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
}