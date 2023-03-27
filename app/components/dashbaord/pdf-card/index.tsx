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
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { IconFileText } from '@tabler/icons-react';
import { useCallback } from 'react';
import { openContextModal } from '@mantine/modals';
import PdfCardDeleteButton from '~/components/dashbaord/pdf-card/delete-button';
import PdfCardActionButton from '~/components/dashbaord/pdf-card/action-button';
import type { ClientFile } from '~/models/client-file';

interface Props {
  file: SerializeFrom<ClientFile>;
}

export default function PdfCard({ file }: Props) {
  const [opened, { close }] = useDisclosure(true);
  const fetcher = useFetcher();

  const openAnalyticsModal = () =>
    openContextModal({
      modal: 'analytics',
      title: `Analytics for ${file.name}`,
      centered: true,
      innerProps: {
        fileId: file.id,
      },
    });

  const openEditModal = () =>
    openContextModal({
      modal: 'edit',
      title: `Set custom URL`,
      centered: true,
      innerProps: {
        file,
      },
    });

  const openQrCodeModal = () =>
    openContextModal({
      modal: 'qrCode',
      title: 'Get A QR Code',
      centered: true,
      innerProps: {
        fileId: file.id,
      },
    });

  const openPasswordModal = () =>
    openContextModal({
      modal: 'password',
      title: file.isPasswordProtected ? 'Update Password' : 'Set Password',
      centered: true,
      innerProps: {
        file,
      },
    });

  const deleteFile = useCallback(() => {
    close();
    fetcher.submit(
      {
        id: file.id,
      },
      {
        method: 'delete',
        action: '/api/delete-file',
      }
    );
  }, [fetcher, file, close]);

  return (
    <Collapse in={opened} transitionDuration={500}>
      <Card shadow="sm" padding="lg" withBorder>
        <Grid align="center">
          <Grid.Col span="content">
            <IconFileText height={75} width={50} />
          </Grid.Col>

          <Grid.Col span={5}>
            <Stack ml="sm">
              <Text weight="bold">{file.name}</Text>
              <Anchor size="sm" href={`/${file.url}`}>
                pdf.me/{file.url}
              </Anchor>
            </Stack>
          </Grid.Col>

          <Grid.Col span="auto">
            <Group position="right">
              <Stack spacing="xs">
                <PdfCardActionButton onClick={openAnalyticsModal}>
                  Analytics
                </PdfCardActionButton>
                <PdfCardActionButton onClick={openQrCodeModal}>
                  QR Code
                </PdfCardActionButton>
              </Stack>
            </Group>
          </Grid.Col>

          <Grid.Col span="auto">
            <Group position="right">
              <Stack spacing="xs">
                <PdfCardActionButton onClick={openEditModal}>
                  Set Custom URL
                </PdfCardActionButton>
                <PdfCardActionButton onClick={openPasswordModal}>
                  {`${file.isPasswordProtected ? 'Update' : 'Set'} Password`}
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
