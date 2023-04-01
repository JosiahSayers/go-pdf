import type { ContextModalProps } from '@mantine/modals';
import { Button, Group, Image, Skeleton, Stack, Text } from '@mantine/core';
import type { SubscriptionLevel } from '@prisma/client';
import LockedFeatureAlert from '~/components/locked-feature-alert';
import { useEffect, useRef, useState } from 'react';

export default function QrCodeModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  fileId: string;
  subscriptionLevel: SubscriptionLevel;
  paymentFailure: boolean;
}>) {
  const url = `/api/qr-code?id=${innerProps.fileId}`;
  const canView =
    innerProps.subscriptionLevel !== 'free' && !innerProps.paymentFailure;
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoading, setImageLoading] = useState(canView);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.onload = () =>
        setImageLoading(!imageRef.current?.complete);
    }
  }, []);

  return (
    <Stack>
      {!canView && (
        <LockedFeatureAlert paymentFailure={innerProps.paymentFailure}>
          Upgrade to a paid subscriptionto gain access to an automatically
          generated QR code that can be used to access this PDF.
        </LockedFeatureAlert>
      )}

      <Text size="sm">
        This QR code links directly to your PDF. Download it, print it, add it
        to your social media. It code will work as long as the PDF is not
        deleted from PdfMe, even if you decide to change the URL or update the
        PDF itself.
      </Text>

      {imageLoading && <Skeleton h={408} w={408} />}

      {canView ? (
        <Image src={url} imageRef={imageRef} />
      ) : (
        <Skeleton h={408} w={408} animate={false} />
      )}

      <Group position="right">
        <Button component="a" mt="md" download href={url} disabled={!canView}>
          Download
        </Button>
        <Button mt="md" onClick={() => context.closeModal(id)}>
          Close
        </Button>
      </Group>
    </Stack>
  );
}
