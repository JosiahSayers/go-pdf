import { Stack, Anchor, Text } from '@mantine/core';
import { Link } from '@remix-run/react';

export interface FooterLink {
  text: string;
  href: string;
}

interface Props {
  title: string;
  links: FooterLink[];
}

export default function FooterLinkSection({ title, links }: Props) {
  return (
    <Stack>
      <Text weight="bold">{title}</Text>
      {links.map((link) => (
        <Anchor component={Link} key={link.href} to={link.href}>
          {link.text}
        </Anchor>
      ))}
    </Stack>
  );
}
