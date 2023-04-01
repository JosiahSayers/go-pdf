import type { AlertProps } from '@mantine/core';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function LockedFeatureAlert({
  title = 'Upgrade to use this feature',
  children,
}: AlertProps) {
  return (
    <Alert icon={<IconAlertCircle size="1rem" />} title={title} color="cyan">
      {children}
    </Alert>
  );
}
