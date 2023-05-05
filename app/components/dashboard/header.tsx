import type { HeaderProps } from '@mantine/core';
import { Anchor } from '@mantine/core';
import { Group } from '@mantine/core';
import { Header as MantineHeader, Image } from '@mantine/core';
import { Link } from '@remix-run/react';
import { useUser } from '~/components/context/user';

interface Props extends Omit<HeaderProps, 'children' | 'height'> {
  height?: HeaderProps['height'];
}

export default function Header({ height = 60, px = '3rem', ...props }: Props) {
  const user = useUser();

  return (
    <MantineHeader height={height} px={px} {...props}>
      <Group sx={{ height: '100%' }} position="apart">
        <Anchor component={Link} to="/">
          <Image src="/logo.png" width={100} alt="GoPDF" />
        </Anchor>
        <Group>
          <p>{user?.name}</p>
        </Group>
      </Group>
    </MantineHeader>
  );
}
