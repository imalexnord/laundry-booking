export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  APP_NAME: string;
  MAX_ACTIVE_BOOKINGS: string;
  SESSION_COOKIE_NAME: string;
  SESSION_TTL_SECONDS: string;
  SESSION_SECRET?: string;
  ADMIN_CODE?: string;
}

export interface Apartment {
  id: number;
  apartment_number: string;
  booking_code_hash: string;
  email: string | null;
  email_reminders_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface BookingSlot {
  id: number;
  laundry_room_id: number;
  start_time: string;
  end_time: string;
  is_active: number;
}

export interface Booking {
  id: number;
  apartment_id: number;
  laundry_room_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'booked' | 'cancelled';
  reminder_sent: number;
  created_at: string;
  cancelled_at: string | null;
}

export interface SessionPayload {
  apartmentId: number;
  apartmentNumber: string;
  exp: number;
}
