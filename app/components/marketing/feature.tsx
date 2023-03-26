import { Grid, Stack, Text, Title } from '@mantine/core';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  title: string;
}

export default function MarketingFeature({ title, children }: Props) {
  return (
    <Grid.Col sm={4} xs={12}>
      <Stack mih={300}>
        <Title order={4} mih={65}>
          {title}
        </Title>
        <Text>{children}</Text>
      </Stack>
    </Grid.Col>
  );
}
