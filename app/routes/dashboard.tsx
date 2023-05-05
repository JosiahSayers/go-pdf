import { AppShell, Container } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import Header from '~/components/dashboard/header';
import AppFooter from '~/components/footer';
import { Session } from '~/utils/session.server';

export async function loader({ request }: LoaderArgs) {
  await Session.requireLoggedInUser(request);
  return null;
}

export default function Dashboard() {
  return (
    <AppShell fixed={false} header={<Header />} footer={<AppFooter />}>
      <Container mih="100vh">
        <Outlet />
      </Container>
    </AppShell>
  );
}
