import { Anchor, Group, Image } from '@mantine/core';
import { Header as MantineHeader } from '@mantine/core';
import { Link } from '@remix-run/react';

export default function Header() {
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
        </Group>
      </Group>
    </MantineHeader>
  );
}
