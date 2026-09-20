export interface StoreSettings {
  // General Settings
  site_name: string;
  site_url: string;
  default_language: string;
  timezone: string;
  enable_maintenance_mode: boolean;
  allow_guest_checkout: boolean;
  enable_wishlist: boolean;

  // Store Information
  store_name: string;
  store_email: string;
  phone_number: string;
  address: string;
  logo?: string;
  favicon?: string;

  // Currency & Localization
  currency: string;
  currency_symbol_position: 'left' | 'right';
  date_format: string;
  time_format: string;
  decimal_separator: string;
  thousand_separator: string;

  // Payment Gateways
  stripe_enabled: boolean;
  paypal_enabled: boolean;
  sslcommerz_enabled: boolean;
  cod_enabled: boolean;
  bank_transfer_enabled: boolean;

  // Shipping
  shipping_flat_rate_enabled: boolean;
  shipping_free_shipping_enabled: boolean;
  shipping_local_pickup_enabled: boolean;

  // Tax Settings
  enable_tax_calculation: boolean;
  tax_type: 'inclusive' | 'exclusive';
  default_tax_rate: number;

  // Notifications
  order_confirmation_email: boolean;
  shipping_update_email: boolean;
  password_reset_email: boolean;
  promotional_email: boolean;
  sms_order_alerts: boolean;
  sms_delivery_alerts: boolean;

  // SEO
  meta_title: string;
  meta_description: string;
  google_analytics_id: string;

  // Appearance
  theme: 'modern' | 'dark' | 'light';
  primary_color: string;
  hero_banner_title?: string;
  hero_banner_subtitle?: string;
  hero_banner_image?: string;
}