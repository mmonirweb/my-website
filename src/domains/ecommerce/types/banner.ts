export interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  image: string;
  link_url?: string;
  button_text?: string;
  position: string;
  interval_time: number;
  sort_order: number;
  status: boolean;
  created_at?: string;
  updated_at?: string;
}