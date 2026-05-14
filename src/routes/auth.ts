import type { Apartment, Env } from '../types';
import { clearSessionCookie, createSession, readSession, sessionCookie, verifyBookingCode } from '../lib/auth';
import { error, json } from '../lib/responses';
import { isApartmentNumber, isBookingCode } from '../lib/validation';

export async function login(request: Request, env: Env): Promise<Response> {
  const body = await request.json().catch(() => null) as { apartmentNumber?: unknown; bookingCode?: unknown } | null;

  if (!body || !isApartmentNumber(body.apartmentNumber) || !isBookingCode(body.bookingCode)) {
    return error('Ange lägenhetsnummer och bokningskod.', 400);
  }

  const apartmentNumber = body.apartmentNumber.trim();
  const bookingCode = body.bookingCode.trim();

  const apartment = await env.DB.prepare(
    'SELECT * FROM apartments WHERE apartment_number = ? LIMIT 1'
  ).bind(apartmentNumber).first<Apartment>();

  if (!apartment) {
    return error('Fel lägenhetsnummer eller bokningskod.', 401);
  }

  const valid = await verifyBookingCode(apartment, bookingCode);

  if (!valid) {
    return error('Fel lägenhetsnummer eller bokningskod.', 401);
  }

  await env.DB.prepare(
    'INSERT INTO audit_log (apartment_id, action, details) VALUES (?, ?, ?)'
  ).bind(apartment.id, 'login', JSON.stringify({ apartmentNumber })).run();

  const token = await createSession(apartment, env);

  const response = json({
    ok: true,
    apartment: {
      number: apartment.apartment_number,
      email: apartment.email,
      emailRemindersEnabled: apartment.email_reminders_enabled === 1
    }
  });

  response.headers.append('set-cookie', sessionCookie(token, env));
  return response;
}

export async function logout(env: Env): Promise<Response> {
  const response = json({ ok: true });
  response.headers.append('set-cookie', clearSessionCookie(env));
  return response;
}

export async function me(request: Request, env: Env): Promise<Response> {
  const session = await readSession(request, env);

  if (!session) return error('Inte inloggad.', 401);

  const apartment = await env.DB.prepare(
    'SELECT apartment_number, email, email_reminders_enabled FROM apartments WHERE id = ? LIMIT 1'
  ).bind(session.apartmentId).first<{
    apartment_number: string;
    email: string | null;
    email_reminders_enabled: number;
  }>();

  if (!apartment) return error('Inte inloggad.', 401);

  return json({
    ok: true,
    apartment: {
      number: apartment.apartment_number,
      email: apartment.email,
      emailRemindersEnabled: apartment.email_reminders_enabled === 1
    }
  });
}
