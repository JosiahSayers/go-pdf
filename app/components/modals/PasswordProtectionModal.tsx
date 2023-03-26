import type { ContextModalProps } from '@mantine/modals';
import { Button, Text } from '@mantine/core';

export default function AnalyticsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ modalBody: string }>) {
  return (
    <>
      <Text size="sm">{innerProps.modalBody}</Text>
      <Button fullWidth mt="md" onClick={() => context.closeModal(id)}>
        Close modal
      </Button>
    </>
  );
}
