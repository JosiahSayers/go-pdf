import { AppShell, Container } from '@mantine/core';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import Header from '~/components/dashboard/header';
import AppFooter from '~/components/footer';

export async function loader() {
  return json({ user: { name: 'John Smith' } });
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
