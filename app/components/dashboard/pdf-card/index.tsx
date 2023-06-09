import {
  Anchor,
  Card,
  Collapse,
  Grid,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { File, SubscriptionLevel } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { IconFileText } from '@tabler/icons-react';
import { useCallback } from 'react';
import { openContextModal } from '@mantine/modals';
import PdfCardDeleteButton from '~/components/dashboard/pdf-card/delete-button';
import PdfCardActionButton from '~/components/dashboard/pdf-card/action-button';
import { useAuthenticityToken } from 'remix-utils';

interface Props {
  file: SerializeFrom<File>;
  subscriptionLevel: SubscriptionLevel;
  paymentFailure: boolean;
}

export default function PdfCard({
  file,
  subscriptionLevel,
  paymentFailure,
}: Props) {
  const [displayed, { close: hide }] = useDisclosure(true);
  const fetcher = useFetcher();
  const csrf = useAuthenticityToken();

  const openAnalyticsModal = () =>
    openContextModal({
      modal: 'analytics',
      title: `Analytics for ${file.name}`,
      centered: true,
      innerProps: {
        fileId: file.id,
        subscriptionLevel,
        paymentFailure,
      },
    });

  const openEditModal = () =>
    openContextModal({
      modal: 'edit',
      title: `Set custom URL`,
      centered: true,
      innerProps: {
        file,
        subscriptionLevel,
        paymentFailure,
      },
    });

  const openQrCodeModal = () =>
    openContextModal({
      modal: 'qrCode',
      title: 'Get A QR Code',
      centered: true,
      innerProps: {
        fileId: file.id,
        subscriptionLevel,
        paymentFailure,
      },
    });

  const deleteFile = useCallback(() => {
    hide();
    fetcher.submit(
      {
        id: file.id,
        csrf,
      },
      {
        method: 'delete',
        action: '/api/delete-file',
      }
    );
  }, [fetcher, file, hide, csrf]);

  return (
    <Collapse in={displayed} transitionDuration={500}>
      <Card shadow="sm" padding="lg" withBorder>
        <Grid align="center">
          <Grid.Col span="content">
            <IconFileText height={75} width={50} />
          </Grid.Col>

          <Grid.Col span={5}>
            <Stack ml="sm">
              <Text weight="bold">{file.name}</Text>
              <Anchor size="sm" href={`/${file.url}`}>
                gopdf.app/{file.url}
              </Anchor>
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto">
            <Group position="right">
              <Stack spacing="xs">
                <PdfCardActionButton onClick={openAnalyticsModal}>
                  Analytics
                </PdfCardActionButton>
                <PdfCardActionButton onClick={openEditModal}>
                  Set Custom URL
                </PdfCardActionButton>
                <PdfCardActionButton onClick={openQrCodeModal}>
                  QR Code
                </PdfCardActionButton>
              </Stack>
            </Group>
          </Grid.Col>

          <Grid.Col span="content">
            <PdfCardDeleteButton onDelete={deleteFile} />
          </Grid.Col>
        </Grid>
      </Card>
    </Collapse>
  );
}
