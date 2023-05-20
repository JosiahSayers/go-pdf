import { createCookieSessionStorage, redirect } from '@remix-run/node';
import { createAuthenticityToken, verifyAuthenticityToken } from 'remix-utils';

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

const generateCsrfToken = createAuthenticityToken;

const validateCsrf = async (request: Request) => {
  const session = await get(request);
  await verifyAuthenticityToken(request, session);
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

const getUserInfo = (session: Awaited<ReturnType<typeof get>>) => {
  const id = session.get('userId');
  const name = session.get('name');
  if (id && name) {
    return { id, name };
  }
  return null;
};

const isLoggedIn = async (request: Request) => {
  const session = await get(request);
  return Boolean(session.get('userId'));
};

export const Session = {
  get,
  getUserInfo,
  isLoggedIn,
  commitSession,
  headersWithSession,
  destroySessionWithHeaders,
  generateCsrfToken,
  validateCsrf,
  requireLoggedInUser,
};
