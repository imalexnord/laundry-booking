import type { Env } from '../types';

function cutoffDate(daysBack: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - daysBack);
  return date.toISOString().slice(0, 10);
}

export async function cleanupOldBookingHistory(env: Env): Promise<void> {
  const cutoff = cutoffDate(30);

  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM bookings
       WHERE booking_date < ?`
    ).bind(cutoff),

    env.DB.prepare(
      `DELETE FROM audit_log
       WHERE date(created_at) < ?`
    ).bind(cutoff)
  ]);
}
