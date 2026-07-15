// Auto-generated Supabase database types for RideVault
// Maps all Supabase table columns to TypeScript interfaces

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'user' | 'admin';
          tier: 'default' | 'bronze' | 'silver' | 'gold' | 'elite';
          photo_url: string | null;
          favorites: number[];
          username: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: string | null;
          nationality: string | null;
          address: string | null;
          emergency_contact: string | null;
          emergency_phone: string | null;
          loyalty_points: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: 'user' | 'admin';
          tier?: 'default' | 'bronze' | 'silver' | 'gold' | 'elite';
          photo_url?: string | null;
          favorites?: number[];
          username?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          nationality?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          emergency_phone?: string | null;
          loyalty_points?: number;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      bikes: {
        Row: {
          id: number;
          brand: string;
          model: string;
          engine: string;
          power: string;
          price: number;
          status: string;
          image: string;
          top_speed: string;
          torque: string;
          suspension: string;
          weight: string;
          gallery: string[];
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['bikes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bikes']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          user: string | null;
          bike_id: number;
          bike_name: string | null;
          start_date: string;
          end_date: string;
          status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | string;
          total: number;
          review: string | null;
          review_rating: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          type: 'driver_license' | 'national_id' | 'selfie_id';
          url: string;
          status: 'pending' | 'approved' | 'rejected';
          uploaded_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: 'credit_card' | 'debit_card' | 'ewallet' | 'bank_account';
          label: string;
          masked_number: string;
          expiry: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payment_methods']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payment_methods']['Insert']>;
      };
      notification_preferences: {
        Row: {
          user_id: string;
          booking_updates: boolean;
          promotions: boolean;
          membership_updates: boolean;
          payment_reminders: boolean;
          push_notifications: boolean;
          email_notifications: boolean;
          sms_notifications: boolean;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['notification_preferences']['Row'];
        Update: Partial<Database['public']['Tables']['notification_preferences']['Row']>;
      };
      user_preferences: {
        Row: {
          user_id: string;
          language: 'id' | 'en';
          currency: 'IDR' | 'USD';
          dark_mode: boolean;
          timezone: string;
          units: 'km' | 'miles';
          updated_at: string;
        };
        Insert: Database['public']['Tables']['user_preferences']['Row'];
        Update: Partial<Database['public']['Tables']['user_preferences']['Row']>;
      };
      vouchers: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          discount: string;
          description: string | null;
          expires_at: string;
          used: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vouchers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['vouchers']['Insert']>;
      };
      loyalty_history: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          points: number;
          type: 'earned' | 'redeemed';
          date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loyalty_history']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['loyalty_history']['Insert']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row'];
export type BikeRow = Database['public']['Tables']['bikes']['Row'];
export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type DocumentRow = Database['public']['Tables']['documents']['Row'];
export type PaymentMethodRow = Database['public']['Tables']['payment_methods']['Row'];
export type NotificationPrefsRow = Database['public']['Tables']['notification_preferences']['Row'];
export type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];
export type VoucherRow = Database['public']['Tables']['vouchers']['Row'];
export type LoyaltyHistoryRow = Database['public']['Tables']['loyalty_history']['Row'];
