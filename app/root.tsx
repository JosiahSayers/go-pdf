import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { MantineProvider, createEmotionCache } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { StylesPlaceholder } from '@mantine/remix';
import { theme } from '~/theme';
import { definedModals } from '~/components/modals';
import { Notifications } from '@mantine/notifications';

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
});

createEmotionCache({ key: 'mantine' });

export default function App() {
  return (
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
  );
}
