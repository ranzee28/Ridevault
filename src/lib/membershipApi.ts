import { supabase } from './supabase';

export interface MembershipDetails {
  tier: string;
  membership_status: string;
  membership_starts_at: string;
  membership_expires_at: string;
  membership_id_number: string;
  loyalty_points: number;
}

export const membershipApi = {
  /**
   * Processes a simulated membership payment and activates the membership.
   */
  async processMembershipPayment(
    userId: string,
    tier: string,
    amount: number,
    paymentMethod: string,
    months: number = 1
  ): Promise<boolean> {
    try {
      const startsAt = new Date();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + months);
      const membershipIdNumber = `RV-${Math.floor(10000 + Math.random() * 90000)}`;

      // 1. Insert transaction
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: userId,
        amount,
        payment_method: paymentMethod,
        status: 'completed',
        type: 'membership'
      });
      if (txError) throw txError;

      // 2. Insert membership history
      const { error: historyError } = await supabase.from('membership_history').insert({
        user_id: userId,
        tier,
        start_date: startsAt.toISOString(),
        end_date: expiresAt.toISOString(),
        amount_paid: amount,
        status: 'active'
      });
      if (historyError) throw historyError;

      // 3. Update user profile
      const { error: userError } = await supabase.from('users').update({
        tier,
        membership_status: 'active',
        membership_starts_at: startsAt.toISOString(),
        membership_expires_at: expiresAt.toISOString(),
        membership_id_number: membershipIdNumber
      }).eq('id', userId);
      if (userError) throw userError;

      return true;
    } catch (error) {
      console.error('Membership payment failed:', error);
      return false;
    }
  },

  /**
   * Fetches the current membership details for a user.
   */
  async getMembershipDashboard(userId: string): Promise<MembershipDetails | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('tier, membership_status, membership_starts_at, membership_expires_at, membership_id_number, loyalty_points')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data as MembershipDetails;
    } catch (error) {
      console.error('Error fetching membership dashboard:', error);
      return null;
    }
  },

  /**
   * Fetches membership history.
   */
  async getMembershipHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('membership_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching membership history:', error);
      return [];
    }
  },

  /**
   * Fetches active bookings (reservations) for a user.
   */
  async getActiveBookings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  /**
   * Fetches favorite bikes.
   */
  async getFavoriteBikes(userId: string) {
    try {
      const { data, error } = await supabase
        .from('favorite_bikes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  /**
   * Fetches upcoming events.
   */
  async getUpcomingEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  /**
   * Fetches user notifications.
   */
  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Fetches active vouchers.
   */
  async getActiveVouchers(userId: string) {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .eq('user_id', userId)
        .eq('used', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      return [];
    }
  }
};
