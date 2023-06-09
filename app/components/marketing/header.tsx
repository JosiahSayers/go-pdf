import { Anchor, Button, Group, Image, Text } from '@mantine/core';
import { Header as MantineHeader } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { Link } from '@remix-run/react';
import { useCallback } from 'react';
import { useUser } from '~/components/context/user';

export default function Header() {
  const user = useUser();

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
        title: 'Create an account',
        centered: true,
        innerProps: {},
      }),
    []
  );

  return (
    <MantineHeader height={60} px="3rem">
      <Group sx={{ height: '100%' }} position="apart">
        <Anchor component={Link} to="/">
          <Image src="/logo.png" width={100} alt="GoPDF" />
        </Anchor>
        <Group>
          <Anchor component={Link} to="/faq">
            FAQs
          </Anchor>
          <Anchor component={Link} to="/pricing">
            Pricing
          </Anchor>
          {user ? (
            <Text>{user.name}</Text>
          ) : (
            <>
              <Button variant="subtle" onClick={openLoginModal}>
                Login
              </Button>
              <Button variant="subtle" onClick={openRegisterModal}>
                Create an account
              </Button>
            </>
          )}
        </Group>
      </Group>
    </MantineHeader>
  );
}
