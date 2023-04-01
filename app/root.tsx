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
import { CsrfProvider } from '~/components/context/csrf';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'GoPDF',
  viewport: 'width=device-width,initial-scale=1',
});

createEmotionCache({ key: 'mantine' });

export async function loader({ request }: LoaderArgs) {
  const session = await Session.get(request);
  const csrf = Session.generateCsrfToken();
  session.set('csrfToken', csrf);
  return json({ csrf }, { headers: await Session.headersWithSession(session) });
}

export default function App() {
  const { csrf } = useLoaderData<typeof loader>();

  return (
    <CsrfProvider value={{ csrf }}>
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
    </CsrfProvider>
  );
}
