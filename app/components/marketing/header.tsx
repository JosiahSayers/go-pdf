import { Anchor, Button, Group, Image } from '@mantine/core';
import { Header as MantineHeader } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { Link } from '@remix-run/react';
import { useCallback } from 'react';

export default function Header() {
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

  return (
    <MantineHeader height={60} px="3rem">
      <Group sx={{ height: '100%' }} position="apart">
        <Image src="/logo.png" width={100} alt="GoPDF" />
        <Group>
          <Anchor component={Link} to="/faq">
            FAQs
          </Anchor>
          <Anchor component={Link} to="/pricing">
            Pricing
          </Anchor>
          <Button variant="subtle" onClick={openLoginModal}>
            Login
          </Button>
        </Group>
      </Group>
    </MantineHeader>
  );
}
