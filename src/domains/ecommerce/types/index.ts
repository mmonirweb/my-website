export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  cta_text: string;
  cta_link: string;
  position?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  is_active?: boolean;
  products_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  logo_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number | null;
  featured_image?: string;
  image?: string;
  main_image?: string;
  category?: Category | null;
  brand?: Brand | null;
  stock_quantity?: number;
  stock?: number;
  rating?: number;
}

export interface HomePageData {
  hero_banners: Banner[];
  categories: Category[];
  featured_categories?: Category[];
  flash_sale?: {
    ends_at: string;
    products: Product[];
  };
  featured_products: Product[];
  new_arrivals: Product[];
  top_brands: Brand[];
}