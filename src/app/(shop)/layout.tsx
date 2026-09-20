import type { Metadata } from 'next';
import EcommerceHeader from '@/components/ecommerce/Header';
import EcommerceFooter from '@/components/ecommerce/Footer';
import { settingService } from '@/domains/settings/services/settingService';
import { ecommerceService } from '@/domains/ecommerce/services/ecommerceService';
import { Category } from '@/domains/ecommerce/types';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext'; // ১. LanguageProvider ইমপোর্ট করা হলো

export async function generateMetadata(): Promise<Metadata> {
  let settingsData: any = null;
  try {
    settingsData = await settingService.getPublicSettings();
  } catch (err) {
    console.error('Failed to load settings metadata:', err);
  }

  const siteName = settingsData?.store_name || settingsData?.general?.store_name || 'Zarah Mart';
  const tagline = settingsData?.tagline || settingsData?.general?.tagline || '';
  
  let faviconUrl = 
    settingsData?.favicon || 
    settingsData?.favicon_url || 
    settingsData?.general?.favicon || 
    settingsData?.general?.favicon_url;

  if (faviconUrl && !faviconUrl.startsWith('http')) {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : 'http://127.0.0.1:8000';
    const cleanPath = faviconUrl.replace(/^\/+/, '').replace(/^storage\/+/, '');
    faviconUrl = `${backendUrl}/storage/${cleanPath}`;
  }

  return {
    title: {
      // এখানে ডিফল্ট টাইটেল হিসেবে সাইটের নাম বা ট্যাগলাইন থাকবে
      default: tagline ? `${siteName} - ${tagline}` : siteName,
      // সাব-পেজ থেকে টাইটেল আসলে তা এখানে `%s` এর জায়গায় বসে যাবে (যেমন: Shop | Zarah Mart)
      template: `%s | ${siteName}`,
    },
    icons: faviconUrl
      ? {
          icon: faviconUrl,
          shortcut: faviconUrl,
          apple: faviconUrl,
        }
      : undefined,
  };
}

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Category[] = [];

  try {
    const homeData = await ecommerceService.getHomePageData();
    categories = homeData?.categories || homeData?.featured_categories || [];
  } catch (error) {
    console.error('Failed to load categories in ShopLayout:', error);
  }

  return (
    <LanguageProvider> {/* ২. LanguageProvider দিয়ে র‍্যাপ করা হলো */}
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-slate-50/50">
          <EcommerceHeader categories={categories} />
          <main className="flex-1">{children}</main>
          <EcommerceFooter />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}