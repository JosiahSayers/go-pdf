import type { ContextModalProps } from '@mantine/modals';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import type { File } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';
import { editPdfValidator } from '~/routes/api/edit/$id';
import ValidatedTextInput from '~/components/ValidatedTextInput';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useCsrf } from '~/components/context/csrf';

export default function AnalyticsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ file: SerializeFrom<File> }>) {
  const fetcher = useFetcher();
  const csrf = useCsrf();

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
      <ValidatedForm
        validator={editPdfValidator}
        fetcher={fetcher}
        method="post"
        action={`/api/edit/${innerProps.file.id}`}
      >
        {/* TODO: Create UI for user who does not have an active subscription */}
        <Stack>
          <ValidatedTextInput
            defaultValue={innerProps.file.url}
            label="Custom URL"
            description="Set a memorable URL to access this PDF"
            icon={<Text>pdf.me/</Text>}
            iconWidth={65}
            name="url"
            disabled={fetcher.state === 'submitting'}
          />
          <input type="hidden" defaultValue={csrf} name="csrf" />

          {fetcher.state === 'idle' && fetcher.data?.success && (
            <Alert title="Saved!" color="green">
              We've got your new URL all queued up and ready to go.
            </Alert>
          )}

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
            >
              Save
            </Button>
          </Group>
        </Stack>
      </ValidatedForm>
    </>
  );
}
