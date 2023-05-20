import type { ContextModalProps } from '@mantine/modals';
import { Button, Group, Stack, Text } from '@mantine/core';
import type { File, SubscriptionLevel } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { editPdfValidator } from '~/routes/api/edit/$id';
import ValidatedTextInput from '~/components/forms/ValidatedTextInput';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import LockedFeatureAlert from '~/components/locked-feature-alert';
import ValidatedFormWithCsrf from '~/components/forms/ValidatedFormWithCsrf';

export default function AnalyticsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  file: SerializeFrom<File>;
  subscriptionLevel: SubscriptionLevel;
  paymentFailure: boolean;
}>) {
  const fetcher = useFetcher();
  const canEdit =
    innerProps.subscriptionLevel !== 'free' && !innerProps.paymentFailure;

  useEffect(() => {
    if (fetcher.data?.success) {
      context.closeModal(id);
      notifications.show({
        title: 'Success!',
        message: 'Your custom URL has been updated',
        color: 'green',
        autoClose: 10000,
      });
    }
  }, [fetcher.data]);

  return (
    <>
      <ValidatedFormWithCsrf
        validator={editPdfValidator}
        fetcher={fetcher}
        method="post"
        action={`/api/edit/${innerProps.file.id}`}
      >
        <Stack>
          {!canEdit && (
            <LockedFeatureAlert paymentFailure={innerProps.paymentFailure}>
              Upgrade to a paid subscription to unlock the ability to create a
              custom URL for your PDFs.
            </LockedFeatureAlert>
          )}
          <ValidatedTextInput
            defaultValue={innerProps.file.url}
            label="Custom URL"
            description="Set a memorable URL to access this PDF"
            icon={<Text>gopdf.app/</Text>}
            iconWidth={85}
            name="url"
            disabled={!canEdit || fetcher.state === 'submitting'}
          />

          <Group position="right">
            <Button
              variant="outline"
              color="dark"
              mt="md"
              onClick={() => context.closeModal(id)}
              type="button"
              disabled={fetcher.state === 'submitting'}
            >
              Cancel
            </Button>
            <Button
              mt="md"
              type="submit"
              loading={fetcher.state === 'submitting'}
              disabled={!canEdit}
            >
              Save
            </Button>
          </Group>
        </Stack>
      </ValidatedFormWithCsrf>
    </>
  );
}
