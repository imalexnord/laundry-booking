CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_booking_per_apartment_per_day
  ON bookings(apartment_id, booking_date)
  WHERE status = 'booked';
