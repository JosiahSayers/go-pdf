import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import { MantineProvider, createEmotionCache } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { StylesPlaceholder } from '@mantine/remix';
import { theme } from '~/theme';
import { definedModals } from '~/components/modals';
import { Notifications } from '@mantine/notifications';
import { Session } from '~/utils/session.server';
import { UserProvider } from '~/components/context/user';
import { AuthenticityTokenProvider } from 'remix-utils';
import useRevalidateOnFocus from '~/components/hooks/revalidate-on-focus';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'GoPDF',
  viewport: 'width=device-width,initial-scale=1',
});

createEmotionCache({ key: 'mantine' });

export async function loader({ request }: LoaderArgs) {
  const session = await Session.get(request);
  const csrf = await Session.generateCsrfToken(session);
  const userInfo = Session.getUserInfo(session);
  return json(
    { csrf, userInfo },
    { headers: await Session.headersWithSession(session) }
  );
}

export default function App() {
  const { csrf, userInfo } = useLoaderData<typeof loader>();
  useRevalidateOnFocus();

  return (
    <AuthenticityTokenProvider token={csrf}>
      <UserProvider value={userInfo}>
        <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
          <Notifications />
          <ModalsProvider modals={definedModals}>
            <html lang="en">
              <head>
                <StylesPlaceholder />
                <Meta />
                <Links />
              </head>
              <body>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
              </body>
            </html>
          </ModalsProvider>
        </MantineProvider>
      </UserProvider>
    </AuthenticityTokenProvider>
  );
}
