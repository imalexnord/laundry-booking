function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let raw = '';

  for (const byte of array) {
    raw += String.fromCharCode(byte);
  }

  return btoa(raw).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  const raw = atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export async function sha256Hex(value: string): Promise<string> {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hmacSign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return bytesToBase64Url(signature);
}

export async function timingSafeEqual(left: string, right: string): Promise<boolean> {
  const leftHash = await sha256Hex(left);
  const rightHash = await sha256Hex(right);
  return leftHash === rightHash;
}

export function encodePayload(payload: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodePayload<T>(value: string): T | null {
  try {
    const bytes = base64UrlToBytes(value);
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}
