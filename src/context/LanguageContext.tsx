'use client';

import React, { createContext, useContext, useState } from 'react';

type LangType = 'bn' | 'en';

interface LanguageContextType {
  lang: LangType;
  setLang: (lang: LangType) => void;
  t: (key: string) => string;
}

const translations: Record<LangType, Record<string, string>> = {
  bn: {
    cart: 'Cart',
    addToCart: 'Add to Cart',
    quickOrder: 'Quick Order',
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty!',
    subtotal: 'Subtotal',
    checkout: 'Proceed to Checkout',
    quantity: 'Quantity',
    remove: 'Remove',
    continueShopping: 'Continue Shopping',
    loadingDetails: 'Loading product details...',
    productNotFound: 'Product not found!',
    productNotFoundDesc: 'The link is incorrect or the product has been deleted.',
    backToShop: 'Back to Shop',
    description: 'Description',
    specifications: 'Specifications',
    brand: 'Brand',
    weight: 'Weight',
    barcode: 'Barcode',
    fastDelivery: 'Fast Home Delivery',
    fastDeliveryDesc: 'Delivered to your address in the shortest possible time.',
    originalProduct: '100% Original Product',
    originalProductDesc: 'Guaranteed authentic and quality products.',
    easyReturn: 'Easy Return Policy',
    easyReturnDesc: 'Facility to exchange within 7 days if needed.',
    orderSummary: 'Order Summary',
    deliveryCharge: 'Delivery Charge',
    calculatedAtCheckout: 'Calculated at checkout',
    total: 'Total',
  },
  en: {
    cart: 'Cart',
    addToCart: 'Add to Cart',
    quickOrder: 'Quick Order',
    shoppingCart: 'Shopping Cart',
    emptyCart: 'Your cart is empty!',
    subtotal: 'Subtotal',
    checkout: 'Proceed to Checkout',
    quantity: 'Quantity',
    remove: 'Remove',
    continueShopping: 'Continue Shopping',
    loadingDetails: 'Loading product details...',
    productNotFound: 'Product not found!',
    productNotFoundDesc: 'The link is incorrect or the product has been deleted.',
    backToShop: 'Back to Shop',
    description: 'Description',
    specifications: 'Specifications',
    brand: 'Brand',
    weight: 'Weight',
    barcode: 'Barcode',
    fastDelivery: 'Fast Home Delivery',
    fastDeliveryDesc: 'Delivered to your address in the shortest possible time.',
    originalProduct: '100% Original Product',
    originalProductDesc: 'Guaranteed authentic and quality products.',
    easyReturn: 'Easy Return Policy',
    easyReturnDesc: 'Facility to exchange within 7 days if needed.',
    orderSummary: 'Order Summary',
    deliveryCharge: 'Delivery Charge',
    calculatedAtCheckout: 'Calculated at checkout',
    total: 'Total',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // আপনি চাইলে এখানে ডিফল্ট ভাষা 'bn' এর পরিবর্তে সরাসরি 'en' সেট করে দিতে পারেন
  const [lang, setLang] = useState<LangType>('en');

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}