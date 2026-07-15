-- =============================================================================
-- RideVault — Supabase Full Integration Migration
-- Run this entire script in: Supabase Dashboard > SQL Editor > New query
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTEND EXISTING TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend users table with profile & identity fields
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username         TEXT,
  ADD COLUMN IF NOT EXISTS phone            TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth    DATE,
  ADD COLUMN IF NOT EXISTS gender           TEXT,
  ADD COLUMN IF NOT EXISTS nationality      TEXT DEFAULT 'Indonesia',
  ADD COLUMN IF NOT EXISTS address          TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS emergency_phone  TEXT,
  ADD COLUMN IF NOT EXISTS loyalty_points   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS membership_status TEXT DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS membership_starts_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_id_number TEXT,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

-- Extend bookings table with reservation flow data
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS review          TEXT,
  ADD COLUMN IF NOT EXISTS review_rating   INTEGER,
  ADD COLUMN IF NOT EXISTS bike_name       TEXT,
  ADD COLUMN IF NOT EXISTS bike_id         INTEGER,
  ADD COLUMN IF NOT EXISTS user_id         TEXT,
  ADD COLUMN IF NOT EXISTS user_name       TEXT,
  ADD COLUMN IF NOT EXISTS start_date      TEXT,
  ADD COLUMN IF NOT EXISTS end_date        TEXT,
  ADD COLUMN IF NOT EXISTS total           NUMERIC,
  -- Kolom reservasi premium baru
  ADD COLUMN IF NOT EXISTS pickup_method   TEXT DEFAULT 'showroom',
  ADD COLUMN IF NOT EXISTS pickup_address  TEXT,
  ADD COLUMN IF NOT EXISTS pickup_time     TEXT DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS return_time     TEXT DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS addons          JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS addon_total     NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code      TEXT,
  ADD COLUMN IF NOT EXISTS promo_discount  NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_used     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS points_earned   INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method  TEXT DEFAULT 'kartu_kredit',
  ADD COLUMN IF NOT EXISTS payment_status  TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS pickup_pin      TEXT,
  ADD COLUMN IF NOT EXISTS deposit         NUMERIC DEFAULT 500000,
  ADD COLUMN IF NOT EXISTS pajak           NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tier_discount   NUMERIC DEFAULT 0;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. NEW TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- Tabel kode promo
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('persen', 'nominal')),
  discount_value NUMERIC NOT NULL,
  min_tier      TEXT DEFAULT 'default',
  valid_until   DATE NOT NULL,
  max_uses      INTEGER DEFAULT 100,
  current_uses  INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert kode promo awal
INSERT INTO public.promo_codes (code, discount_type, discount_value, min_tier, valid_until, max_uses)
VALUES
  ('RIDEVAULT10', 'persen', 10, 'default', '2026-12-31', 1000),
  ('FIRSTRIDE50K', 'nominal', 50000, 'default', '2026-12-31', 500),
  ('GOLDPASS', 'persen', 20, 'gold', '2026-12-31', 200),
  ('ELITE25', 'persen', 25, 'elite', '2026-12-31', 100)
ON CONFLICT (code) DO NOTHING;

-- RLS untuk promo_codes (semua user bisa baca, admin bisa semua)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promo_codes_public_read" ON public.promo_codes;
CREATE POLICY "promo_codes_public_read" ON public.promo_codes
  FOR SELECT USING (true);


-- Documents table (driver license, national ID, selfie)
CREATE TABLE IF NOT EXISTS public.documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('driver_license', 'national_id', 'selfie_id')),
  url           TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('credit_card', 'debit_card', 'ewallet', 'bank_account')),
  label           TEXT NOT NULL,
  masked_number   TEXT NOT NULL,
  expiry          TEXT,
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification preferences (one row per user, upsert pattern)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_updates       BOOLEAN NOT NULL DEFAULT TRUE,
  promotions            BOOLEAN NOT NULL DEFAULT FALSE,
  membership_updates    BOOLEAN NOT NULL DEFAULT TRUE,
  payment_reminders     BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications    BOOLEAN NOT NULL DEFAULT FALSE,
  email_notifications   BOOLEAN NOT NULL DEFAULT TRUE,
  sms_notifications     BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User preferences (one row per user, upsert pattern)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language    TEXT NOT NULL DEFAULT 'id',
  currency    TEXT NOT NULL DEFAULT 'IDR',
  dark_mode   BOOLEAN NOT NULL DEFAULT TRUE,
  timezone    TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  units       TEXT NOT NULL DEFAULT 'km',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vouchers table
CREATE TABLE IF NOT EXISTS public.vouchers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  discount      TEXT NOT NULL,
  description   TEXT,
  expires_at    DATE NOT NULL,
  used          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Loyalty history table
CREATE TABLE IF NOT EXISTS public.loyalty_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  points        INTEGER NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('earned', 'redeemed')),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount          NUMERIC NOT NULL,
  payment_method  TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  type            TEXT NOT NULL CHECK (type IN ('membership', 'rental')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Membership history table
CREATE TABLE IF NOT EXISTS public.membership_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier          TEXT NOT NULL,
  start_date    TIMESTAMPTZ NOT NULL,
  end_date      TIMESTAMPTZ NOT NULL,
  amount_paid   NUMERIC NOT NULL,
  invoice_url   TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Favorite bikes table
CREATE TABLE IF NOT EXISTS public.favorite_bikes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bike_id       INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, bike_id)
);

-- Events table (Admin managed)
CREATE TABLE IF NOT EXISTS public.events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  date          TIMESTAMPTZ NOT NULL,
  location      TEXT NOT NULL,
  image_url     TEXT,
  required_tier TEXT NOT NULL DEFAULT 'Silver',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id      UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('system', 'event', 'promotion', 'membership', 'reward')),
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. UPDATED_AT TRIGGER (reusable)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_notif_updated_at ON public.notification_preferences;
CREATE TRIGGER trg_notif_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_prefs_updated_at ON public.user_preferences;
CREATE TRIGGER trg_prefs_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ENABLE ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_history      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_bikes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications           ENABLE ROW LEVEL SECURITY;

-- bikes table: public read, admin write
ALTER TABLE public.bikes ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Helper function to safely check admin role and break RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id uuid)
RETURNS boolean SECURITY DEFINER LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id::text = p_user_id::text AND role = 'admin'
  );
END;
$$;

-- DROP existing policies first to avoid conflicts
DROP POLICY IF EXISTS "users_select_own"    ON public.users;
DROP POLICY IF EXISTS "users_insert_own"    ON public.users;
DROP POLICY IF EXISTS "users_update_own"    ON public.users;
DROP POLICY IF EXISTS "users_delete_own"    ON public.users;
DROP POLICY IF EXISTS "admin_full_access"   ON public.users;

DROP POLICY IF EXISTS "bookings_select_own"  ON public.bookings;
DROP POLICY IF EXISTS "bookings_insert_own"  ON public.bookings;
DROP POLICY IF EXISTS "bookings_update_own"  ON public.bookings;
DROP POLICY IF EXISTS "bookings_delete_own"  ON public.bookings;
DROP POLICY IF EXISTS "admin_bookings_all"   ON public.bookings;

DROP POLICY IF EXISTS "bikes_public_select"  ON public.bikes;
DROP POLICY IF EXISTS "bikes_admin_insert"   ON public.bikes;
DROP POLICY IF EXISTS "bikes_admin_update"   ON public.bikes;
DROP POLICY IF EXISTS "bikes_admin_delete"   ON public.bikes;

DROP POLICY IF EXISTS "docs_select_own"     ON public.documents;
DROP POLICY IF EXISTS "docs_insert_own"     ON public.documents;
DROP POLICY IF EXISTS "docs_update_own"     ON public.documents;
DROP POLICY IF EXISTS "docs_delete_own"     ON public.documents;

DROP POLICY IF EXISTS "pm_select_own"       ON public.payment_methods;
DROP POLICY IF EXISTS "pm_insert_own"       ON public.payment_methods;
DROP POLICY IF EXISTS "pm_update_own"       ON public.payment_methods;
DROP POLICY IF EXISTS "pm_delete_own"       ON public.payment_methods;

DROP POLICY IF EXISTS "notif_select_own"    ON public.notification_preferences;
DROP POLICY IF EXISTS "notif_upsert_own"    ON public.notification_preferences;

DROP POLICY IF EXISTS "prefs_select_own"    ON public.user_preferences;
DROP POLICY IF EXISTS "prefs_upsert_own"    ON public.user_preferences;

DROP POLICY IF EXISTS "vouchers_select_own" ON public.vouchers;
DROP POLICY IF EXISTS "vouchers_update_own" ON public.vouchers;

DROP POLICY IF EXISTS "loyalty_select_own"  ON public.loyalty_history;
DROP POLICY IF EXISTS "loyalty_insert_own"  ON public.loyalty_history;

DROP POLICY IF EXISTS "tx_select_own"       ON public.transactions;
DROP POLICY IF EXISTS "tx_insert_own"       ON public.transactions;

DROP POLICY IF EXISTS "mh_select_own"       ON public.membership_history;
DROP POLICY IF EXISTS "mh_insert_own"       ON public.membership_history;

DROP POLICY IF EXISTS "favs_select_own"     ON public.favorite_bikes;
DROP POLICY IF EXISTS "favs_insert_own"     ON public.favorite_bikes;
DROP POLICY IF EXISTS "favs_delete_own"     ON public.favorite_bikes;

DROP POLICY IF EXISTS "events_public_read"  ON public.events;
DROP POLICY IF EXISTS "events_admin_all"    ON public.events;

DROP POLICY IF EXISTS "evreg_select_own"    ON public.event_registrations;
DROP POLICY IF EXISTS "evreg_insert_own"    ON public.event_registrations;
DROP POLICY IF EXISTS "evreg_delete_own"    ON public.event_registrations;

DROP POLICY IF EXISTS "notif_msg_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notif_msg_update_own" ON public.notifications;

-- ── users ────────────────────────────────────────────────────────────────────
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "users_delete_own" ON public.users
  FOR DELETE USING (auth.uid()::text = id::text);

-- Admin gets full read on users table (for AdminDashboard)
CREATE POLICY "admin_full_access" ON public.users
  FOR SELECT USING (public.is_admin(auth.uid()));

-- ── bookings ─────────────────────────────────────────────────────────────────
CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "bookings_update_own" ON public.bookings
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "bookings_delete_own" ON public.bookings
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Admin full access to bookings
CREATE POLICY "admin_bookings_all" ON public.bookings
  FOR ALL USING (public.is_admin(auth.uid()));

-- ── bikes ─────────────────────────────────────────────────────────────────────
CREATE POLICY "bikes_public_select" ON public.bikes
  FOR SELECT USING (true);

CREATE POLICY "bikes_admin_insert" ON public.bikes
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "bikes_admin_update" ON public.bikes
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "bikes_admin_delete" ON public.bikes
  FOR DELETE USING (public.is_admin(auth.uid()));

-- ── documents ────────────────────────────────────────────────────────────────
CREATE POLICY "docs_select_own" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "docs_insert_own" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "docs_update_own" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "docs_delete_own" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- ── payment_methods ───────────────────────────────────────────────────────────
CREATE POLICY "pm_select_own" ON public.payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "pm_insert_own" ON public.payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "pm_update_own" ON public.payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "pm_delete_own" ON public.payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- ── notification_preferences ──────────────────────────────────────────────────
CREATE POLICY "notif_select_own" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notif_upsert_own" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── user_preferences ──────────────────────────────────────────────────────────
CREATE POLICY "prefs_select_own" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "prefs_upsert_own" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── vouchers ──────────────────────────────────────────────────────────────────
CREATE POLICY "vouchers_select_own" ON public.vouchers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "vouchers_update_own" ON public.vouchers
  FOR UPDATE USING (auth.uid() = user_id);

-- ── loyalty_history ───────────────────────────────────────────────────────────
CREATE POLICY "loyalty_select_own" ON public.loyalty_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "loyalty_insert_own" ON public.loyalty_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── transactions ──────────────────────────────────────────────────────────────
CREATE POLICY "tx_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tx_insert_own" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── membership_history ────────────────────────────────────────────────────────
CREATE POLICY "mh_select_own" ON public.membership_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "mh_insert_own" ON public.membership_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── favorite_bikes ────────────────────────────────────────────────────────────
CREATE POLICY "favs_select_own" ON public.favorite_bikes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "favs_insert_own" ON public.favorite_bikes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favs_delete_own" ON public.favorite_bikes
  FOR DELETE USING (auth.uid() = user_id);

-- ── events ────────────────────────────────────────────────────────────────────
CREATE POLICY "events_public_read" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_admin_all" ON public.events
  FOR ALL USING (public.is_admin(auth.uid()));

-- ── event_registrations ───────────────────────────────────────────────────────
CREATE POLICY "evreg_select_own" ON public.event_registrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "evreg_insert_own" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "evreg_delete_own" ON public.event_registrations
  FOR DELETE USING (auth.uid() = user_id);

-- ── notifications ─────────────────────────────────────────────────────────────
CREATE POLICY "notif_msg_select_own" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notif_msg_update_own" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKET SETUP (run these separately if needed)
-- ─────────────────────────────────────────────────────────────────────────────
-- Create the profile-photos bucket (if not already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create the user-documents bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-documents', 'user-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: profile-photos (public read, auth write own folder)
DROP POLICY IF EXISTS "profile_photos_select" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_insert" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_update" ON storage.objects;
DROP POLICY IF EXISTS "profile_photos_delete" ON storage.objects;

CREATE POLICY "profile_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "profile_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_photos_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "profile_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS: user-documents (private, user-scoped)
DROP POLICY IF EXISTS "user_docs_select" ON storage.objects;
DROP POLICY IF EXISTS "user_docs_insert" ON storage.objects;
DROP POLICY IF EXISTS "user_docs_update" ON storage.objects;
DROP POLICY IF EXISTS "user_docs_delete" ON storage.objects;

CREATE POLICY "user_docs_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "user_docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "user_docs_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "user_docs_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-documents' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. WELCOME VOUCHER FUNCTION (auto-grant on signup)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.grant_welcome_bonus()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Insert welcome voucher
  INSERT INTO public.vouchers (user_id, code, discount, description, expires_at)
  VALUES (
    NEW.id,
    'WELCOME' || UPPER(SUBSTRING(NEW.id::text, 1, 4)),
    '10%',
    'Welcome to RideVault! First rental discount.',
    CURRENT_DATE + INTERVAL '90 days'
  );

  -- Insert welcome loyalty points
  INSERT INTO public.loyalty_history (user_id, description, points, type, date)
  VALUES (NEW.id, 'Welcome bonus', 50, 'earned', CURRENT_DATE);

  -- Update user loyalty_points
  UPDATE public.users SET loyalty_points = 50 WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Trigger: run after user profile is created in public.users
DROP TRIGGER IF EXISTS trg_welcome_bonus ON public.users;
CREATE TRIGGER trg_welcome_bonus
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_welcome_bonus();

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE! All tables, RLS, and triggers are configured.
-- ─────────────────────────────────────────────────────────────────────────────
