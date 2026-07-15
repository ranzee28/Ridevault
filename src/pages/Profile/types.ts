// ─── Booking ─────────────────────────────────────────────────────────────────
export interface Booking {
  id: string;
  bikeId: number;
  bikeName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'active' | 'upcoming' | 'overdue';
  createdAt: any;
  review?: string;
  reviewRating?: number;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export type Tab =
  | 'overview'
  | 'personal'
  | 'license'
  | 'membership-card'
  | 'membership-progress'
  | 'rentals'
  | 'favorites'
  | 'notifications'
  | 'security'
  | 'payment'
  | 'loyalty'
  | 'reviews'
  | 'preferences';

// ─── Toast ────────────────────────────────────────────────────────────────────
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ─── Personal Info ────────────────────────────────────────────────────────────
export interface PersonalInfo {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}

// ─── Document ─────────────────────────────────────────────────────────────────
export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface DocumentRecord {
  type: 'driver_license' | 'national_id' | 'selfie_id';
  url: string;
  status: VerificationStatus;
  uploadedAt: string;
}

// ─── Payment Method ───────────────────────────────────────────────────────────
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'ewallet' | 'bank_account';
  label: string;
  maskedNumber: string;
  expiry?: string;
  isDefault: boolean;
  icon?: string;
}

// ─── Notification Preferences ─────────────────────────────────────────────────
export interface NotificationPrefs {
  bookingUpdates: boolean;
  promotions: boolean;
  membershipUpdates: boolean;
  paymentReminders: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// ─── Loyalty ─────────────────────────────────────────────────────────────────
export interface Voucher {
  id: string;
  code: string;
  discount: string;
  description: string;
  expiresAt: string;
  used: boolean;
}

export interface LoyaltyHistoryItem {
  id: string;
  description: string;
  points: number;
  type: 'earned' | 'redeemed';
  date: string;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  bookingId: string;
  bikeName: string;
  bikeImage: string;
  rating: number;
  text: string;
  createdAt: string;
}

// ─── Preferences ─────────────────────────────────────────────────────────────
export interface UserPreferences {
  language: 'id' | 'en';
  currency: 'IDR' | 'USD';
  darkMode: boolean;
  timezone: string;
  units: 'km' | 'miles';
}

// ─── Active Session ───────────────────────────────────────────────────────────
export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}
