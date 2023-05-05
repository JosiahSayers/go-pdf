import { AppShell, Container } from '@mantine/core';
import { Outlet } from '@remix-run/react';
import AppFooter from '~/components/footer';
import Header from '~/components/marketing/header';

export default function MarketingLayout() {
  return (
    <AppShell
      fixed={false}
      padding="3rem"
      header={<Header />}
      footer={<AppFooter />}
    >
      <Container>
        <Outlet />
      </Container>
    </AppShell>
  );
}
