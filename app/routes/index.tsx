import { AppShell, Container, Stack, Title } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import AppFooter from '~/components/footer';
import Header from '~/components/marketing/header';
import { Session } from '~/utils/session.server';

export async function loader({ request }: LoaderArgs) {
  const isLoggedIn = await Session.isLoggedIn(request);
  return redirect(isLoggedIn ? '/dashboard' : '/pdf-hosting');
}

export default function Index() {
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
