'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // এখানে আপনার ইকমার্স কাস্টমার লগইন API কল করুন
    setTimeout(() => {
      setLoading(false);
      alert('লগইন সফল হয়েছে!');
    }, 1500);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-3xl shadow-xl p-8 text-emerald-950">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> সুরক্ষিত কাস্টমার পোর্টাল
          </span>
          <h1 className="text-2xl font-black text-emerald-950">আপনার একাউন্টে লগইন করুন</h1>
          <p className="text-xs text-emerald-600 mt-1">ইকমার্স শপে স্বাগতম, আপনার অর্ডার ট্র্যাক করুন।</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1.5">ইমেইল এড্রেস</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition"
              />
              <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1.5">পাসওয়ার্ড</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl py-3 pl-10 pr-4 text-xs font-medium text-emerald-950 placeholder-emerald-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 transition"
              />
              <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-emerald-800">
              <input type="checkbox" className="rounded border-emerald-300 text-emerald-600 focus:ring-amber-400" />
              <span>মনে রাখুন</span>
            </label>
            <Link href="/account/forgot-password" className="text-amber-700 hover:underline font-semibold">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-amber-950 py-3 rounded-xl font-bold text-xs transition shadow-md shadow-amber-300/30 flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>লগইন করুন <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-emerald-700">
          একাউন্ট নেই?{' '}
          <Link href="/account/register" className="text-amber-700 font-bold hover:underline">
            রেজিস্ট্রেশন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}