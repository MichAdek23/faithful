import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Booking {
  id?: string;
  booking_date: string;
  booking_time: string;
  service_type: string;
  service_price: number;
  vehicle_type: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
