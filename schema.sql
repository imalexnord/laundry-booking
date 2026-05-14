PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS apartments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_number TEXT NOT NULL UNIQUE,
  booking_code_hash TEXT NOT NULL,
  email TEXT,
  email_reminders_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS laundry_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS booking_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  laundry_room_id INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (laundry_room_id) REFERENCES laundry_rooms(id) ON DELETE CASCADE,
  UNIQUE(laundry_room_id, start_time)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id INTEGER NOT NULL,
  laundry_room_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  reminder_sent INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TEXT,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
  FOREIGN KEY (laundry_room_id) REFERENCES laundry_rooms(id) ON DELETE CASCADE,
  UNIQUE(laundry_room_id, booking_date, start_time)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  apartment_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bookings_apartment_status_date
  ON bookings(apartment_id, status, booking_date);

CREATE INDEX IF NOT EXISTS idx_bookings_room_date
  ON bookings(laundry_room_id, booking_date);

CREATE INDEX IF NOT EXISTS idx_audit_log_apartment_created
  ON audit_log(apartment_id, created_at);

INSERT OR IGNORE INTO laundry_rooms (id, name, is_active)
VALUES (1, 'Tvättstuga', 1);

INSERT OR IGNORE INTO booking_slots (laundry_room_id, start_time, end_time, is_active)
VALUES
  (1, '07:00', '10:00', 1),
  (1, '10:00', '13:00', 1),
  (1, '13:00', '16:00', 1),
  (1, '16:00', '19:00', 1),
  (1, '19:00', '22:00', 1);

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_booking_per_apartment_per_day
  ON bookings(apartment_id, booking_date)
  WHERE status = 'booked';
