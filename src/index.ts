import type { Env } from './types';
import { login, logout, me } from './routes/auth';
import { createBooking, cancelBooking, listMyBookings } from './routes/bookings';
import { listSlots } from './routes/slots';
import { error, notFound } from './lib/responses';
import { adminCancelBooking, adminListBookings, adminLogin, adminLogout, adminMe } from './routes/admin';
import { cleanupOldBookingHistory } from './lib/cleanup';

function bookingIdFromPath(pathname: string): number | null {
  const match = pathname.match(/^\/api\/bookings\/(\d+)$/);

  if (!match) return null;

  const id = Number(match[1]);
  return Number.isInteger(id) ? id : null;
}

function adminBookingIdFromPath(pathname: string): number | null {
  const match = pathname.match(/^\/api\/admin\/bookings\/(\d+)$/);

  if (!match) return null;

  const id = Number(match[1]);
  return Number.isInteger(id) ? id : null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

    if (!isLocalhost && url.protocol === 'http:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    try {
      if (request.method === 'POST' && pathname === '/api/admin/login') return adminLogin(request, env);
      if (request.method === 'POST' && pathname === '/api/admin/logout') return adminLogout();
      if (request.method === 'GET' && pathname === '/api/admin/me') return adminMe(request, env);
      if (request.method === 'GET' && pathname === '/api/admin/bookings') return adminListBookings(request, env);

      const adminBookingId = adminBookingIdFromPath(pathname);
      if (request.method === 'DELETE' && adminBookingId !== null) {
        return adminCancelBooking(request, env, adminBookingId);
      }

      if (request.method === 'POST' && pathname === '/api/login') return login(request, env);
      if (request.method === 'POST' && pathname === '/api/logout') return logout(env);
      if (request.method === 'GET' && pathname === '/api/me') return me(request, env);

      if (request.method === 'GET' && pathname === '/api/slots') return listSlots(request, env);
      if (request.method === 'POST' && pathname === '/api/bookings') return createBooking(request, env);
      if (request.method === 'GET' && pathname === '/api/bookings/me') return listMyBookings(request, env);

      const bookingId = bookingIdFromPath(pathname);
      if (request.method === 'DELETE' && bookingId !== null) {
        return cancelBooking(request, env, bookingId);
      }

      if (pathname.startsWith('/api/')) return notFound();

      if (pathname === '/admin') {
        const indexUrl = new URL(request.url);
        indexUrl.pathname = '/';
        return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
      }

      return env.ASSETS.fetch(request);
    } catch (caught) {
      console.error(caught);
      return error('Något gick fel.', 500);
    }
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(cleanupOldBookingHistory(env));
  }
};
