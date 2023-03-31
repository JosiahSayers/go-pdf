import { Text } from '@mantine/core';

interface Props {
  remainingUploadCount: number | null;
}

export default function SubscriptionStatus({ remainingUploadCount }: Props) {
  if (remainingUploadCount === null) {
    return null;
  }

  return (
    <Text>
      {/* TODO: Flush out this message with more information. Link to subscription page 
        where a user can edit their subscription. Change the text if there are no 
        more uploads available or if remaining uploads === Infinity. */}
      You can upload {remainingUploadCount} more PDFs. If you need more you can
      upgrade your account.
    </Text>
  );
}
