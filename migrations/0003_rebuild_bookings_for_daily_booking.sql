PRAGMA foreign_keys = OFF;

ALTER TABLE bookings RENAME TO bookings_old;

CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id INTEGER NOT NULL,
  laundry_room_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  start_time TEXT NOT NULL DEFAULT '00:00',
  end_time TEXT NOT NULL DEFAULT '23:59',
  status TEXT NOT NULL DEFAULT 'booked',
  reminder_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TEXT,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
  FOREIGN KEY (laundry_room_id) REFERENCES laundry_rooms(id) ON DELETE CASCADE
);

INSERT INTO bookings (
  id,
  apartment_id,
  laundry_room_id,
  booking_date,
  start_time,
  end_time,
  status,
  reminder_sent,
  created_at,
  cancelled_at
)
SELECT
  id,
  apartment_id,
  laundry_room_id,
  booking_date,
  start_time,
  end_time,
  status,
  reminder_sent,
  created_at,
  cancelled_at
FROM bookings_old;

DROP TABLE bookings_old;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_booking_per_room_per_day
  ON bookings(laundry_room_id, booking_date)
  WHERE status = 'booked';

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_booking_per_apartment_per_day
  ON bookings(apartment_id, booking_date)
  WHERE status = 'booked';

CREATE INDEX IF NOT EXISTS idx_bookings_apartment_status_date
  ON bookings(apartment_id, status, booking_date);

CREATE INDEX IF NOT EXISTS idx_bookings_room_date
  ON bookings(laundry_room_id, booking_date);

PRAGMA foreign_keys = ON;
