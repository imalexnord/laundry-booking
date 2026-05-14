const isAdminPage = window.location.pathname === '/admin';

const loginView = document.querySelector('#login-view');
const appView = document.querySelector('#app-view');
const loginForm = document.querySelector('#login-form');
const logoutButton = document.querySelector('#logout-button');
const apartmentLabel = document.querySelector('#apartment-label');
const calendar = document.querySelector('#calendar');
const message = document.querySelector('#message');
const loginMessage = document.querySelector('#login-message');

const adminLoginView = document.querySelector('#admin-login-view');
const adminView = document.querySelector('#admin-view');
const adminLoginForm = document.querySelector('#admin-login-form');
const adminLogoutButton = document.querySelector('#admin-logout-button');
const adminBookings = document.querySelector('#admin-bookings');
const adminMessage = document.querySelector('#admin-message');
const adminLoginMessage = document.querySelector('#admin-login-message');

function setMessage(element, text, type = 'error') {
  element.textContent = text || '';
  element.className = text ? `message-${type}` : '';
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Något gick fel.');
  }

  return data;
}

function hideTenantViews() {
  loginView.classList.add('hidden');
  appView.classList.add('hidden');
}

function hideAdminViews() {
  adminLoginView.classList.add('hidden');
  adminView.classList.add('hidden');
}

function showLoggedIn(apartment) {
  apartmentLabel.textContent = `Inloggad som lägenhet ${apartment.number}`;
  setMessage(loginMessage, '');
  loginView.classList.add('hidden');
  appView.classList.remove('hidden');
}

function showLoggedOut() {
  loginView.classList.remove('hidden');
  appView.classList.add('hidden');
  calendar.innerHTML = '';
  setMessage(message, '');
}

function showAdminLoggedIn() {
  setMessage(adminLoginMessage, '');
  adminLoginView.classList.add('hidden');
  adminView.classList.remove('hidden');
}

function showAdminLoggedOut() {
  adminLoginView.classList.remove('hidden');
  adminView.classList.add('hidden');
  adminBookings.innerHTML = '';
  setMessage(adminMessage, '');
}

function todayDateOnly() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function addDays(dateOnly, days) {
  const date = new Date(`${dateOnly}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(date) {
  const today = todayDateOnly();
  const tomorrow = addDays(today, 1);

  const formatted = new Intl.DateTimeFormat('sv-SE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date(`${date}T12:00:00`));

  const clean = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  if (date === today) return `Idag, ${clean}`;
  if (date === tomorrow) return `Imorgon, ${clean}`;

  return clean;
}

async function loadSlots() {
  setMessage(message, '');

  const data = await api('/api/slots');

  calendar.innerHTML = data.days.map((day) => {
    if (day.bookedByMe) {
      return `
        <section class="day-row mine">
          <div>
            <h2>${formatDate(day.date)}</h2>
            <p><span class="status-pill status-mine">Din bokning</span></p>
          </div>
          <button class="danger" data-cancel="${day.bookingId}" data-date-label="${formatDate(day.date)}">Avboka dag</button>
        </section>
      `;
    }

    if (!day.available) {
      return `
        <section class="day-row busy">
          <div>
            <h2>${formatDate(day.date)}</h2>
            <p><span class="status-pill status-busy">Upptagen</span></p>
          </div>
          <button disabled>Upptagen</button>
        </section>
      `;
    }

    return `
      <section class="day-row free">
        <div>
          <h2>${formatDate(day.date)}</h2>
          <p><span class="status-pill status-free">Ledig hela dagen</span></p>
        </div>
        <button data-book-date="${day.date}" data-date-label="${formatDate(day.date)}">Boka dag</button>
      </section>
    `;
  }).join('');
}

async function loadAdminBookings() {
  setMessage(adminMessage, '');

  const data = await api('/api/admin/bookings');

  if (data.bookings.length === 0) {
    adminBookings.innerHTML = `
      <section class="day-row">
        <div>
          <h2>Inga aktiva bokningar</h2>
          <p>Det finns inga bokade dagar just nu.</p>
        </div>
      </section>
    `;
    return;
  }

  adminBookings.innerHTML = data.bookings.map((booking) => `
    <section class="day-row mine">
      <div>
        <h2>${formatDate(booking.date)}</h2>
        <p><span class="status-pill status-mine">Lägenhet ${booking.apartmentNumber}</span></p>
      </div>
      <button class="danger" data-admin-cancel="${booking.id}" data-date-label="${formatDate(booking.date)}" data-apartment="${booking.apartmentNumber}">
        Avboka
      </button>
    </section>
  `).join('');
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(loginMessage, '');
    setMessage(message, '');

    const formData = new FormData(loginForm);

    try {
      const data = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          apartmentNumber: String(formData.get('apartmentNumber') || ''),
          bookingCode: String(formData.get('bookingCode') || '')
        })
      });

      showLoggedIn(data.apartment);
      await loadSlots();
    } catch (error) {
      setMessage(loginMessage, error.message, 'error');
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    await api('/api/logout', { method: 'POST', body: '{}' }).catch(() => null);
    showLoggedOut();
  });
}

if (calendar) {
  calendar.addEventListener('click', async (event) => {
    const button = event.target.closest('button');

    if (!button) return;

    const cancelId = button.dataset.cancel;
    const bookDate = button.dataset.bookDate;
    const dateLabel = button.dataset.dateLabel || 'den här dagen';

    try {
      button.disabled = true;

      if (cancelId) {
        const confirmed = confirm(`Vill du avboka tvättiden för ${dateLabel}?`);

        if (!confirmed) {
          button.disabled = false;
          return;
        }

        await api(`/api/bookings/${cancelId}`, { method: 'DELETE' });
        setMessage(message, `Tvättiden för ${dateLabel} är avbokad.`, 'success');
      } else if (bookDate) {
        await api('/api/bookings', {
          method: 'POST',
          body: JSON.stringify({
            date: bookDate,
            laundryRoomId: 1
          })
        });

        setMessage(message, `Du har bokat tvättstugan ${dateLabel}.`, 'success');
      }

      await loadSlots();
    } catch (error) {
      setMessage(message, error.message, 'error');
      button.disabled = false;
    }
  });
}

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(adminLoginMessage, '');

    const formData = new FormData(adminLoginForm);

    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          code: String(formData.get('code') || '')
        })
      });

      showAdminLoggedIn();
      await loadAdminBookings();
    } catch (error) {
      setMessage(adminLoginMessage, error.message, 'error');
    }
  });
}

if (adminLogoutButton) {
  adminLogoutButton.addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST', body: '{}' }).catch(() => null);
    showAdminLoggedOut();
  });
}

if (adminBookings) {
  adminBookings.addEventListener('click', async (event) => {
    const button = event.target.closest('button');

    if (!button) return;

    const bookingId = button.dataset.adminCancel;
    const dateLabel = button.dataset.dateLabel || 'den här dagen';
    const apartment = button.dataset.apartment || '';

    if (!bookingId) return;

    const confirmed = confirm(`Vill du avboka ${dateLabel} för lägenhet ${apartment}?`);

    if (!confirmed) return;

    try {
      button.disabled = true;

      await api(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      setMessage(adminMessage, `Bokningen för ${dateLabel} är avbokad.`, 'success');
      await loadAdminBookings();
    } catch (error) {
      setMessage(adminMessage, error.message, 'error');
      button.disabled = false;
    }
  });
}

async function boot() {
  if (isAdminPage) {
    hideTenantViews();

    try {
      await api('/api/admin/me');
      showAdminLoggedIn();
      await loadAdminBookings();
    } catch {
      showAdminLoggedOut();
    }

    return;
  }

  hideAdminViews();

  try {
    const data = await api('/api/me');
    showLoggedIn(data.apartment);
    await loadSlots();
  } catch {
    showLoggedOut();
  }
}

boot();
