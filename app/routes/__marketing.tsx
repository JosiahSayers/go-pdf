import { AppShell, Container } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import AppFooter from '~/components/footer';
import Header from '~/components/marketing/header';
import { Session } from '~/utils/session.server';

export async function loader({ request }: LoaderArgs) {
  const session = await Session.get(request);
  const isLoggedIn = !!session.get('userId');
  const name = session.get('name');
  return json({ isLoggedIn, name });
}

export default function MarketingLayout() {
  const { isLoggedIn, name } = useLoaderData<typeof loader>();

  return (
    <AppShell
      fixed={false}
      padding="3rem"
      header={<Header isLoggedIn={isLoggedIn} name={name} />}
      footer={<AppFooter />}
    >
      <Container>
        <Outlet />
      </Container>
    </AppShell>
  );
}
