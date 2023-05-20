import { Badge, Grid, Group, Stack, Text, Title } from '@mantine/core';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  title: string;
  paidOnly?: boolean;
}

export default function MarketingFeature({
  title,
  children,
  paidOnly = false,
}: Props) {
  return (
    <Grid.Col sm={4} xs={12}>
      <Stack mih={250} mt="sm">
        <Group align="top">
          <Title order={4} mih={55}>
            {title}
          </Title>
          {paidOnly && (
            <Badge
              sx={(theme) => ({
                background: theme.fn.gradient(),
                color: 'white',
                marginLeft: '1rem',
              })}
            >
              Paid
            </Badge>
          )}
        </Group>
        <Text>{children}</Text>
      </Stack>
    </Grid.Col>
  );
}
