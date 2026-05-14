import type { Booking, Env } from '../types';
import { error, json } from '../lib/responses';
import { addDays, isDateOnly, todayInSweden } from '../lib/validation';

function getAdminCode(env: Env): string {
  return env.ADMIN_CODE || 'admin-dev';
}

function readAdminSession(request: Request, env: Env): boolean {
  const cookie = request.headers.get('cookie') || '';
  return cookie.includes(`admin_session=${getAdminCode(env)}`);
}

function adminCookie(env: Env): string {
  return `admin_session=${getAdminCode(env)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400; Secure`;
}

function clearAdminCookie(): string {
  return 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure';
}

export async function adminLogin(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => null) as { code?: unknown } | null;

  if (!body || typeof body.code !== 'string') {
    return error('Ange adminkod.', 400);
  }

  if (body.code !== getAdminCode(env)) {
    return error('Fel adminkod.', 401);
  }

  const response = json({ ok: true });
  response.headers.append('set-cookie', adminCookie(env));

  return response;
}

export async function adminLogout(): Promise<Response> {
  const response = json({ ok: true });
  response.headers.append('set-cookie', clearAdminCookie());

  return response;
}

export async function adminMe(request: Request, env: Env): Promise<Response> {
  if (!readAdminSession(request, env)) {
    return error('Inte inloggad som admin.', 401);
  }

  return json({ ok: true });
}

export async function adminListBookings(request: Request, env: Env): Promise<Response> {
  if (!readAdminSession(request, env)) {
    return error('Inte inloggad som admin.', 401);
  }

  const url = new URL(request.url);
  const from = url.searchParams.get('from') || todayInSweden();
  const to = url.searchParams.get('to') || addDays(from, 60);

  if (!isDateOnly(from) || !isDateOnly(to)) {
    return error('Felaktigt datum.', 400);
  }

  const bookings = await env.DB.prepare(
    `SELECT
       bookings.*,
       apartments.apartment_number AS apartment_number
     FROM bookings
     JOIN apartments ON apartments.id = bookings.apartment_id
     WHERE bookings.booking_date >= ?
       AND bookings.booking_date <= ?
       AND bookings.status = 'booked'
     ORDER BY bookings.booking_date ASC`
  ).bind(from, to).all<Booking & { apartment_number: string }>();

  return json({
    ok: true,
    bookings: bookings.results.map((booking) => ({
      id: booking.id,
      date: booking.booking_date,
      apartmentNumber: booking.apartment_number,
      createdAt: booking.created_at
    }))
  });
}

export async function adminCancelBooking(request: Request, env: Env, bookingId: number): Promise<Response> {
  if (!readAdminSession(request, env)) {
    return error('Inte inloggad som admin.', 401);
  }

  const booking = await env.DB.prepare(
    `SELECT * FROM bookings
     WHERE id = ? AND status = 'booked'
     LIMIT 1`
  ).bind(bookingId).first<Booking>();

  if (!booking) {
    return error('Bokningen hittades inte.', 404);
  }

  await env.DB.prepare(
    `UPDATE bookings
     SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(bookingId).run();

  await env.DB.prepare(
    'INSERT INTO audit_log (apartment_id, action, details) VALUES (?, ?, ?)'
  ).bind(booking.apartment_id, 'admin_booking_cancelled', JSON.stringify({
    bookingId,
    bookingDate: booking.booking_date,
    laundryRoomId: booking.laundry_room_id
  })).run();

  return json({ ok: true });
}
