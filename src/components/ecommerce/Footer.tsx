import Link from 'next/link';

export default function EcommerceFooter() {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-12 pb-6 border-t">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-4">NRG SOLAR</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Providing premium renewable energy solutions, solar panels, and power inverters for home and industrial use.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
            <li><Link href="/shop" className="hover:text-white">All Products</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Customer Care</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-white">Help & FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-white">Shipping Policy</Link></li>
            <li><Link href="/returns" className="hover:text-white">Returns & Refunds</Link></li>
            <li><Link href="/track" className="hover:text-white">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-3">Subscribe to get special discounts and updates.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Enter your email" className="px-3 py-2 text-sm rounded bg-slate-800 text-white w-full focus:outline-none" />
            <button className="bg-blue-600 px-4 py-2 rounded text-sm text-white font-semibold hover:bg-blue-700">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 container mx-auto px-4 pt-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} NRG Solar ERP & E-commerce System. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <span>Privacy Policy</span>
          <span>Security</span>
        </div>
      </div>
    </footer>
  );
}