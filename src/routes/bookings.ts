import type { Booking, Env } from '../types';
import { readSession } from '../lib/auth';
import { error, json } from '../lib/responses';
import { isDateOnly, todayInSweden } from '../lib/validation';

export async function createBooking(request: Request, env: Env): Promise<Response> {
  const session = await readSession(request, env);

  if (!session) return error('Inte inloggad.', 401);

  const body = await request.json().catch(() => null) as {
    date?: unknown;
    laundryRoomId?: unknown;
  } | null;

  if (!body || !isDateOnly(body.date)) {
    return error('Välj en giltig dag.', 400);
  }

  if (body.date < todayInSweden()) {
    return error('Du kan inte boka en dag som redan varit.', 400);
  }

  const laundryRoomId = typeof body.laundryRoomId === 'number' ? body.laundryRoomId : 1;

  const existingRoomBooking = await env.DB.prepare(
    `SELECT id FROM bookings
     WHERE laundry_room_id = ? AND booking_date = ? AND status = 'booked'
     LIMIT 1`
  ).bind(laundryRoomId, body.date).first<{ id: number }>();

  if (existingRoomBooking) {
    return error('Den dagen är redan bokad.', 409);
  }

  const existingApartmentBooking = await env.DB.prepare(
    `SELECT id FROM bookings
     WHERE apartment_id = ? AND booking_date = ? AND status = 'booked'
     LIMIT 1`
  ).bind(session.apartmentId, body.date).first<{ id: number }>();

  if (existingApartmentBooking) {
    return error('Din lägenhet har redan tvättid den dagen.', 409);
  }

  try {
    const result = await env.DB.prepare(
      `INSERT INTO bookings (apartment_id, laundry_room_id, booking_date, start_time, end_time, status)
       VALUES (?, ?, ?, '00:00', '23:59', 'booked')`
    ).bind(session.apartmentId, laundryRoomId, body.date).run();

    await env.DB.prepare(
      'INSERT INTO audit_log (apartment_id, action, details) VALUES (?, ?, ?)'
    ).bind(session.apartmentId, 'booking_created', JSON.stringify({
      bookingDate: body.date,
      laundryRoomId
    })).run();

    return json({ ok: true, bookingId: result.meta.last_row_id });
  } catch {
    return error('Den dagen är redan bokad.', 409);
  }
}

export async function listMyBookings(request: Request, env: Env): Promise<Response> {
  const session = await readSession(request, env);

  if (!session) return error('Inte inloggad.', 401);

  const bookings = await env.DB.prepare(
    `SELECT * FROM bookings
     WHERE apartment_id = ? AND status = 'booked' AND booking_date >= ?
     ORDER BY booking_date ASC`
  ).bind(session.apartmentId, todayInSweden()).all<Booking>();

  return json({ ok: true, bookings: bookings.results });
}

export async function cancelBooking(request: Request, env: Env, bookingId: number): Promise<Response> {
  const session = await readSession(request, env);

  if (!session) return error('Inte inloggad.', 401);

  const booking = await env.DB.prepare(
    `SELECT * FROM bookings
     WHERE id = ? AND apartment_id = ? AND status = 'booked'
     LIMIT 1`
  ).bind(bookingId, session.apartmentId).first<Booking>();

  if (!booking) return error('Bokningen hittades inte.', 404);

  await env.DB.prepare(
    `UPDATE bookings
     SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
     WHERE id = ? AND apartment_id = ?`
  ).bind(bookingId, session.apartmentId).run();

  await env.DB.prepare(
    'INSERT INTO audit_log (apartment_id, action, details) VALUES (?, ?, ?)'
  ).bind(session.apartmentId, 'booking_cancelled', JSON.stringify({
    bookingId,
    bookingDate: booking.booking_date,
    laundryRoomId: booking.laundry_room_id
  })).run();

  return json({ ok: true });
}
