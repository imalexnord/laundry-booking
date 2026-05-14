import type { Env } from '../types';
import { readSession } from '../lib/auth';
import { error, json } from '../lib/responses';

function isEmail(value: unknown): value is string {
  return typeof value === 'string'
    && value.trim().length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function updateReminderSettings(request: Request, env: Env): Promise<Response> {
  const session = await readSession(request, env);

  if (!session) return error('Inte inloggad.', 401);

  const body = await request.json().catch(() => null) as {
    email?: unknown;
    enabled?: unknown;
  } | null;

  if (!body || typeof body.enabled !== 'boolean') {
    return error('Felaktiga inställningar.', 400);
  }

  const enabled = body.enabled;

  if (enabled && !isEmail(body.email)) {
    return error('Ange en giltig e-postadress.', 400);
  }

  const email = enabled ? String(body.email).trim() : null;

  await env.DB.prepare(
    `UPDATE apartments
     SET email = ?, email_reminders_enabled = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(email, enabled ? 1 : 0, session.apartmentId).run();

  await env.DB.prepare(
    'INSERT INTO audit_log (apartment_id, action, details) VALUES (?, ?, ?)'
  ).bind(session.apartmentId, 'reminder_settings_updated', JSON.stringify({
    enabled
  })).run();

  return json({
    ok: true,
    email,
    emailRemindersEnabled: enabled
  });
}
