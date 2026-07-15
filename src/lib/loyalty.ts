import { supabase } from './supabase';

/**
 * Adds loyalty points to the user and logs the activity to loyalty_history.
 * Also updates users.loyalty_points column.
 */
export async function addLoyaltyPoints(
  userId: string,
  points: number,
  description: string,
  type: 'earned' | 'redeemed' = 'earned'
): Promise<void> {
  try {
    // Insert history entry
    const { error: histErr } = await supabase
      .from('loyalty_history')
      .insert({
        user_id: userId,
        description,
        points: type === 'redeemed' ? -Math.abs(points) : Math.abs(points),
        type,
        date: new Date().toISOString().split('T')[0],
      });

    if (histErr) throw histErr;

    // Increment points on users table
    const { error: updateErr } = await supabase.rpc
      ? await (supabase as any).rpc('increment_loyalty_points', {
          p_user_id: userId,
          p_points: type === 'redeemed' ? -Math.abs(points) : Math.abs(points),
        })
      : await supabase
          .from('users')
          .select('loyalty_points')
          .eq('id', userId)
          .single()
          .then(async ({ data }) => {
            const current = data?.loyalty_points ?? 0;
            const next = Math.max(0, current + (type === 'redeemed' ? -points : points));
            return supabase.from('users').update({ loyalty_points: next }).eq('id', userId);
          });

    if (updateErr) console.warn('[Loyalty] Could not update loyalty_points:', updateErr);
  } catch (err) {
    console.error('[Loyalty] Failed to add loyalty points:', err);
  }
}

/**
 * Awards points when a booking is completed.
 * Standard rate: 100 points per completed booking.
 */
export async function awardBookingCompletionPoints(
  userId: string,
  bikeName: string,
  totalPrice: number
): Promise<void> {
  // Award 100 base points + 1 per 10,000 IDR spent
  const bonusPoints = Math.floor(totalPrice / 10000);
  const totalPoints = 100 + bonusPoints;
  await addLoyaltyPoints(
    userId,
    totalPoints,
    `Rental completed: ${bikeName}`,
    'earned'
  );
}
