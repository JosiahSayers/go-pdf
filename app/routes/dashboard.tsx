import { AppShell, Container } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import Header from '~/components/dashboard/header';
import AppFooter from '~/components/footer';
import { Session } from '~/utils/session.server';

export async function loader({ request }: LoaderArgs) {
  const session = await Session.get(request);
  const name = session.get('name');
  if (!name) {
    return redirect('/');
  }
  return json({ user: { name } });
}

export default function Dashboard() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AppShell
      fixed={false}
      header={<Header user={user} />}
      footer={<AppFooter />}
    >
      <Container mih="100vh">
        <Outlet />
      </Container>
    </AppShell>
  );
}
