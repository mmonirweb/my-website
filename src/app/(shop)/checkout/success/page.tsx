import Link from 'next/link';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const orderId = Math.floor(100000 + Math.random() * 900000);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50/50">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h1>
          <p className="text-sm text-slate-500">
            ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm space-y-1">
          <span className="text-slate-400 block text-xs uppercase font-bold">Order ID</span>
          <span className="text-lg font-black text-emerald-600">#{orderId}</span>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link 
            href="/shop"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
          <Link 
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}