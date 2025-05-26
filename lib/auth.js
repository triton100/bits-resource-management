// lib/auth.js
import { admin } from './firebaseAdmin';
import { serialize } from 'cookie';

const SESSION_COOKIE_NAME = 'session';

export async function setSessionCookie(res, idToken) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

  const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

  const cookie = serialize(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: expiresIn / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export async function verifySession(req) {
  const cookie = req.cookies?.[SESSION_COOKIE_NAME];
  if (!cookie) return null;

  try {
    const decoded = await admin.auth().verifySessionCookie(cookie, true);
    return decoded;
  } catch (err) {
    return null;
  }
}

export function clearSessionCookie(res) {
  const cookie = serialize(SESSION_COOKIE_NAME, '', {
    maxAge: -1,
    path: '/',
  });
  res.setHeader('Set-Cookie', cookie);
}
