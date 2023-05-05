import { Flex, Footer, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMemo } from 'react';
import type { FooterLink } from '~/components/footer/link-section';
import FooterLinkSection from '~/components/footer/link-section';

export default function AppFooter() {
  const theme = useMantineTheme();

  const supportLinks: FooterLink[] = useMemo(
    () => [
      { text: 'FAQs', href: '/faq' },
      { text: 'Contact Us', href: '/contact-us' },
    ],
    []
  );

  const GoPdfLinks: FooterLink[] = useMemo(
    () => [
      { text: 'Pricing', href: '/pricing' },
      { text: 'Terms & Conditions', href: '/terms-conditions' },
    ],
    []
  );

  return (
    <Footer height={200} bg={theme.colors.dark[5]} style={{ color: 'white' }}>
      <Flex h="100%" w="100vw" align="center" justify="space-around">
        <Stack>
          <Text>GoPDF</Text>
          <Text>&#169; {new Date().getFullYear()}</Text>
        </Stack>
        <FooterLinkSection title="Support" links={supportLinks} />
        <FooterLinkSection title="About" links={GoPdfLinks} />
      </Flex>
    </Footer>
  );
}
