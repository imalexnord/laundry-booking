import type { Booking, Env } from '../types';
import { readSession } from '../lib/auth';
import { error, json } from '../lib/responses';
import { addDays, isDateOnly, todayInSweden } from '../lib/validation';

export async function listSlots(request: Request, env: Env): Promise<Response> {
  const session = await readSession(request, env);

  if (!session) return error('Inte inloggad.', 401);

  const url = new URL(request.url);
  const from = url.searchParams.get('from') || todayInSweden();
  const to = url.searchParams.get('to') || addDays(from, 30);

  if (!isDateOnly(from) || !isDateOnly(to)) {
    return error('Felaktigt datum.', 400);
  }

  const bookings = await env.DB.prepare(
    `SELECT * FROM bookings
     WHERE booking_date >= ? AND booking_date <= ? AND status = 'booked'
     ORDER BY booking_date ASC`
  ).bind(from, to).all<Booking>();

  const bookingMap = new Map<string, Booking>();

  for (const booking of bookings.results) {
    bookingMap.set(booking.booking_date, booking);
  }

  const days = [];
  let current = from;

  while (current <= to) {
    const booking = bookingMap.get(current);

    days.push({
      date: current,
      available: !booking,
      bookedByMe: booking?.apartment_id === session.apartmentId,
      bookingId: booking?.apartment_id === session.apartmentId ? booking.id : null
    });

    current = addDays(current, 1);
  }

  return json({ ok: true, days });
}
