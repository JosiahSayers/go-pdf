import { Text } from '@mantine/core';
import type { SerializeFrom } from '@remix-run/node';
import type { loader } from '~/routes/dashboard/index';

interface Props {
  remainingUploadCount: number | null;
  canUpload: SerializeFrom<typeof loader>['canUpload'];
}

export default function SubscriptionStatus({
  remainingUploadCount,
  canUpload,
}: Props) {
  if (remainingUploadCount === null) {
    return null;
  }

  const remainingCountText = `You can upload ${remainingUploadCount} more PDF ${
    remainingUploadCount > 1 ? 's' : ''
  }.`;

  if (!canUpload.canUpload) {
    return <Text>* {canUpload.reason}</Text>;
  }

  return (
    <Text>
      {/* TODO: Flush out this message with more information. Link to subscription page 
        where a user can edit their subscription. Change the text if there are no 
        more uploads available or if remaining uploads === Infinity. */}
      * {remainingCountText} Upgrading your account will allow you to upload
      more PDF files as well as unlock features like analytics and QR codes.
    </Text>
  );
}
