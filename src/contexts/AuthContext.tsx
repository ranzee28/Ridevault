import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User as SupabaseUser, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// ─── UserProfile — maps DB columns to frontend model ─────────────────────────
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  tier: 'default' | 'bronze' | 'silver' | 'gold' | 'elite';
  createdAt: any;
  photoURL: string;
  favorites: number[];
  // Extended personal info fields
  username: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  loyaltyPoints: number;
}

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  dbError: string | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  updateUserTier: (tier: UserProfile['tier']) => Promise<void>;
  updateUserProfile: (name: string, photoURL: string) => Promise<void>;
  updateExtendedProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfilePhoto: (file: File) => Promise<string>;
  toggleFavoriteBike: (bikeId: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Map DB row → UserProfile ─────────────────────────────────────────────────
function mapRowToProfile(data: any): UserProfile {
  return {
    uid: data.id,
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'user',
    tier: data.tier || 'default',
    createdAt: data.created_at,
    photoURL: data.photo_url || '',
    favorites: data.favorites || [],
    username: data.username || '',
    phone: data.phone || '',
    dateOfBirth: data.date_of_birth || '',
    gender: data.gender || '',
    nationality: data.nationality || 'Indonesia',
    address: data.address || '',
    emergencyContact: data.emergency_contact || '',
    emergencyPhone: data.emergency_phone || '',
    loyaltyPoints: data.loyalty_points || 0,
  };
}

// ─── Build initial insert payload ─────────────────────────────────────────────
function buildNewProfilePayload(authUser: SupabaseUser) {
  return {
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || 'RideVault Member',
    email: authUser.email || '',
    role: 'user' as const,
    tier: 'default' as const,
    photo_url: authUser.user_metadata?.avatar_url || '',
    favorites: [] as number[],
    username: '',
    phone: null,
    date_of_birth: null,
    gender: null,
    nationality: 'Indonesia',
    address: null,
    emergency_contact: null,
    emergency_phone: null,
    loyalty_points: 0,
  };
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  // ── Fetch profile from Supabase ──────────────────────────────────────────
  const fetchUserProfile = useCallback(async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        // Profile doesn't exist yet — auto-create on first login
        if (error.code === 'PGRST116') {
          const payload = buildNewProfilePayload(authUser);
          const { data: inserted, error: insertErr } = await supabase
            .from('users')
            .insert(payload)
            .select()
            .single();

          if (insertErr) throw insertErr;
          if (inserted) {
            const profile = mapRowToProfile(inserted);
            setUserProfile(profile);
            syncFavoritesToStorage(profile.favorites);
          }
        } else {
          throw error;
        }
      } else if (data) {
        const profile = mapRowToProfile(data);
        setUserProfile(profile);
        syncFavoritesToStorage(profile.favorites);
      }
      setDbError(null);
    } catch (err: any) {
      console.error('[AuthContext] Error fetching user profile:', err);
      setDbError(`Failed to load profile: ${err.message}`);
      // Graceful fallback so UI doesn't break
      const fallback: UserProfile = {
        uid: authUser.id,
        name: authUser.user_metadata?.name || 'RideVault Member',
        email: authUser.email || '',
        role: 'user',
        tier: 'default',
        createdAt: new Date(),
        photoURL: authUser.user_metadata?.avatar_url || '',
        favorites: [],
        username: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        nationality: 'Indonesia',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        loyaltyPoints: 0,
      };
      setUserProfile(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Real-time subscription for user row ──────────────────────────────────
  const subscribeToUserProfile = useCallback((userId: string) => {
    // Clean up any existing subscription
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`user-profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const updatedProfile = mapRowToProfile(payload.new);
            setUserProfile(updatedProfile);
            syncFavoritesToStorage(updatedProfile.favorites);
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }, []);

  // ── Sync favorites to localStorage (for BikeContext compatibility) ────────
  const syncFavoritesToStorage = (favorites: number[]) => {
    localStorage.setItem('favoriteBikes', JSON.stringify(favorites));
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser).then(() => {
          subscribeToUserProfile(currentUser.id);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setDbError(null);
      if (currentUser) {
        await fetchUserProfile(currentUser);
        subscribeToUserProfile(currentUser.id);
      } else {
        setUserProfile(null);
        setLoading(false);
        // Clean up real-time
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [fetchUserProfile, subscribeToUserProfile]);

  // ── refreshProfile (manual refresh) ─────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchUserProfile(user);
  }, [user, fetchUserProfile]);

  // ── signInWithGoogle ──────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
      setDbError(null);
    } catch (error: any) {
      setDbError(`Google login failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── signUpWithEmail ───────────────────────────────────────────────────────
  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { name } },
      });
      if (error) throw error;
      setDbError(null);
    } catch (error: any) {
      setDbError(`Registration failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── signInWithEmail ───────────────────────────────────────────────────────
  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      setDbError(null);
    } catch (error: any) {
      setDbError(`Login failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ── updateUserTier ────────────────────────────────────────────────────────
  const updateUserTier = async (tier: UserProfile['tier']) => {
    if (!user || !userProfile) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({ tier })
        .eq('id', user.id);
      if (error) throw error;
      setUserProfile((prev) => prev ? { ...prev, tier } : prev);
      setDbError(null);
    } catch (error: any) {
      setDbError(`Failed to update tier: ${error.message}`);
      throw error;
    }
  };

  // ── updateUserProfile (name + photo) ─────────────────────────────────────
  const updateUserProfile = async (name: string, photoURL: string) => {
    if (!user || !userProfile) return;
    try {
      const { error: authErr } = await supabase.auth.updateUser({ data: { name } });
      if (authErr) throw authErr;

      const { error } = await supabase
        .from('users')
        .update({ name, photo_url: photoURL })
        .eq('id', user.id);
      if (error) throw error;

      setUserProfile((prev) => prev ? { ...prev, name, photoURL } : prev);
      setDbError(null);
    } catch (error: any) {
      setDbError(`Failed to update profile: ${error.message}`);
      throw error;
    }
  };

  // ── updateExtendedProfile (all personal info fields) ─────────────────────
  const updateExtendedProfile = async (data: Partial<UserProfile>) => {
    if (!user || !userProfile) return;
    try {
      const dbPayload: any = {};
      if (data.name !== undefined)             dbPayload.name = data.name;
      if (data.photoURL !== undefined)         dbPayload.photo_url = data.photoURL;
      if (data.phone !== undefined)            dbPayload.phone = data.phone || null;
      if (data.dateOfBirth !== undefined)      dbPayload.date_of_birth = data.dateOfBirth || null;
      if (data.gender !== undefined)           dbPayload.gender = data.gender || null;
      if (data.nationality !== undefined)      dbPayload.nationality = data.nationality || null;
      if (data.address !== undefined)          dbPayload.address = data.address || null;
      if (data.emergencyContact !== undefined) dbPayload.emergency_contact = data.emergencyContact || null;
      if (data.emergencyPhone !== undefined)   dbPayload.emergency_phone = data.emergencyPhone || null;
      if (data.loyaltyPoints !== undefined)    dbPayload.loyalty_points = data.loyaltyPoints;
      if (data.tier !== undefined)             dbPayload.tier = data.tier;

      const { error } = await supabase
        .from('users')
        .update(dbPayload)
        .eq('id', user.id);
      if (error) throw error;

      // Update auth metadata for name changes
      if (data.name) {
        await supabase.auth.updateUser({ data: { name: data.name } });
      }

      setUserProfile((prev) => prev ? { ...prev, ...data } : prev);
      setDbError(null);
    } catch (error: any) {
      setDbError(`Failed to update profile: ${error.message}`);
      throw error;
    }
  };

  // ── uploadProfilePhoto ────────────────────────────────────────────────────
  const uploadProfilePhoto = async (file: File): Promise<string> => {
    if (!user || !userProfile) throw new Error('User not authenticated');
    try {
      if (!file.type.startsWith('image/')) throw new Error('File must be an image');
      if (file.size > 5 * 1024 * 1024) throw new Error('Maximum file size is 5MB');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadErr } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

      const { error: dbErr } = await supabase
        .from('users')
        .update({ photo_url: publicUrl })
        .eq('id', user.id);
      if (dbErr) throw dbErr;

      setUserProfile((prev) => prev ? { ...prev, photoURL: publicUrl } : prev);
      setDbError(null);
      return publicUrl;
    } catch (error: any) {
      setDbError(`Failed to upload photo: ${error.message}`);
      throw error;
    }
  };

  // ── toggleFavoriteBike ────────────────────────────────────────────────────
  const toggleFavoriteBike = async (bikeId: number) => {
    if (!user || !userProfile) return;
    try {
      const currentFavs = userProfile.favorites || [];
      const isFav = currentFavs.includes(bikeId);
      const newFavs = isFav
        ? currentFavs.filter((id) => id !== bikeId)
        : [...currentFavs, bikeId];

      const { error } = await supabase
        .from('users')
        .update({ favorites: newFavs })
        .eq('id', user.id);
      if (error) throw error;

      setUserProfile((prev) => prev ? { ...prev, favorites: newFavs } : prev);
      syncFavoritesToStorage(newFavs);
      setDbError(null);
    } catch (error: any) {
      setDbError(`Failed to update favorites: ${error.message}`);
    }
  };

  // ── logOut ────────────────────────────────────────────────────────────────
  const logOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      syncFavoritesToStorage([]);
    } catch (error) {
      console.error('[AuthContext] Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        dbError,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        updateUserTier,
        updateUserProfile,
        updateExtendedProfile,
        uploadProfilePhoto,
        toggleFavoriteBike,
        refreshProfile,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
