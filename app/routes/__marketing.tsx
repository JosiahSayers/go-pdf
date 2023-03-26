import { AppShell, Container } from '@mantine/core';
import { Outlet } from '@remix-run/react';
import Header from '~/components/marketing/header';

export default function MarketingLayout() {
  return (
    <AppShell fixed={false} padding="3rem" header={<Header />}>
      <Container>
        <Outlet />
      </Container>
    </AppShell>
  );
}
