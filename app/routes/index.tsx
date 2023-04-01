import { AppShell, Container, Stack, Title } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { redirect } from '@remix-run/node';
import { useCallback } from 'react';
import AppFooter from '~/components/footer';
import Header from '~/components/marketing/header';

export async function loader() {
  return redirect('/pdf-hosting');
}

export default function Index() {
  const openLoginModal = useCallback(
    () =>
      openContextModal({
        modal: 'login',
        title: 'Login',
        centered: true,
        innerProps: {},
      }),
    []
  );

  const openRegisterModal = useCallback(
    () =>
      openContextModal({
        modal: 'register',
        title: 'Register',
        centered: true,
        innerProps: {},
      }),
    []
  );

  return (
    <AppShell fixed={false} header={<Header />} footer={<AppFooter />}>
      <Container mih="100vh">
        <Stack align="center">
          <Title order={1}>We make document sharing easy</Title>
        </Stack>
      </Container>
    </AppShell>
  );
}
