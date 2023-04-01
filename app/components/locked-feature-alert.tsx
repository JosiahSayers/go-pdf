import type { AlertProps } from '@mantine/core';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface Props extends AlertProps {
  paymentFailure?: boolean;
}

export default function LockedFeatureAlert({
  title = 'Upgrade to use this feature',
  children,
  paymentFailure = false,
}: Props) {
  if (paymentFailure) {
    return (
      <Alert
        icon={<IconAlertCircle size="1rem" />}
        title="Payment Failure"
        color={'red'}
      >
        Your last payment failed to process. Please update your payment
        information and make a payment to continue using this feature.
      </Alert>
    );
  }

  return (
    <Alert icon={<IconAlertCircle size="1rem" />} title={title} color="cyan">
      {children}
    </Alert>
  );
}
