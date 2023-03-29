import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { randomBytes } from 'crypto';

type SessionData = {
  userId?: string;
  name?: string;
  csrfToken: string;
};

type SessionFlashData = {
  error: string;
};

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET not set');
}

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      httpOnly: true,
      maxAge: 1200, // 1 hour in seconds
      path: '/',
      sameSite: 'strict',
      secrets: [process.env.SESSION_SECRET],
      secure: process.env.NODE_ENV === 'production',
    },
  });

const get = async (request: Request) =>
  getSession(request.headers.get('Cookie'));
const headersWithSession = async (
  session: Parameters<typeof commitSession>[0],
  inputHeaders: HeadersInit = {}
) => {
  const headers = new Headers(inputHeaders);
  headers.set('Set-Cookie', await commitSession(session));
  return headers;
};
const destroySessionWithHeaders = async (
  session: Parameters<typeof destroySession>[0],
  inputHeaders: HeadersInit = {}
) => {
  const headers = new Headers(inputHeaders);
  headers.set('Set-Cookie', await destroySession(session));
  return headers;
};
const generateCsrfToken = () => randomBytes(100).toString('base64');
const validateCsrf = async (request: Request) => {
  const requestCopy = request.clone();
  const session = await get(requestCopy);
  const body = await requestCopy.formData();
  if (
    !session.has('csrfToken') ||
    !body.get('csrf') ||
    session.get('csrfToken') !== body.get('csrf')
  ) {
    throw new Error('CSRF error');
  }
  return session;
};
const requireLoggedInUser = async (request: Request) => {
  const session = await get(request);
  const userId = session.get('userId');
  if (!userId) {
    throw redirect('/');
  }
  return userId;
};

export const Session = {
  get,
  headersWithSession,
  destroySessionWithHeaders,
  generateCsrfToken,
  validateCsrf,
  requireLoggedInUser,
};
