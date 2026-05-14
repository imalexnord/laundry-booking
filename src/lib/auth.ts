import type { Apartment, Env, SessionPayload } from '../types';
import { decodePayload, encodePayload, hmacSign, sha256Hex, timingSafeEqual } from './crypto';

function getSecret(env: Env): string {
  return env.SESSION_SECRET || 'local-dev-change-me';
}

function cookieName(env: Env): string {
  return env.SESSION_COOKIE_NAME || 'laundry_session';
}

export async function hashBookingCode(apartmentNumber: string, bookingCode: string): Promise<string> {
  return sha256Hex(`${apartmentNumber.trim()}:${bookingCode.trim()}`);
}

export async function verifyBookingCode(apartment: Apartment, bookingCode: string): Promise<boolean> {
  const candidate = await hashBookingCode(apartment.apartment_number, bookingCode);
  return timingSafeEqual(candidate, apartment.booking_code_hash);
}

export async function createSession(apartment: Apartment, env: Env): Promise<string> {
  const ttl = Number(env.SESSION_TTL_SECONDS || '604800');

  const payload: SessionPayload = {
    apartmentId: apartment.id,
    apartmentNumber: apartment.apartment_number,
    exp: Math.floor(Date.now() / 1000) + ttl
  };

  const encodedPayload = encodePayload(payload);
  const signature = await hmacSign(encodedPayload, getSecret(env));

  return `${encodedPayload}.${signature}`;
}

export async function readSession(request: Request, env: Env): Promise<SessionPayload | null> {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${cookieName(env)}=([^;]+)`));

  if (!match) return null;

  const token = match[1];
  const [payloadPart, signaturePart] = token.split('.');

  if (!payloadPart || !signaturePart) return null;

  const expectedSignature = await hmacSign(payloadPart, getSecret(env));
  if (!(await timingSafeEqual(signaturePart, expectedSignature))) return null;

  const payload = decodePayload<SessionPayload>(payloadPart);
  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export function sessionCookie(token: string, env: Env): string {
  const ttl = Number(env.SESSION_TTL_SECONDS || '604800');
  return `${cookieName(env)}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttl}; Secure`;
}

export function clearSessionCookie(env: Env): string {
  return `${cookieName(env)}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}
