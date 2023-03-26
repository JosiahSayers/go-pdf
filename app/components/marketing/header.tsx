import { Anchor, Group } from '@mantine/core';
import { Header as MantineHeader, Title } from '@mantine/core';
import { Link } from '@remix-run/react';

export default function Header() {
  return (
    <MantineHeader height={60} px="3rem">
      <Group sx={{ height: '100%' }} position="apart">
        <Title order={1}>PdfMe</Title>
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
