import type { ContextModalProps } from '@mantine/modals';
import { Button, Group, Space, Stack } from '@mantine/core';
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';
import ValidatedTextInput from '~/components/ValidatedTextInput';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import type { ClientFile } from '~/models/client-file';
import { updatePasswordValidator } from '~/routes/api/update-password.$id';

export default function UpdatePasswordModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ file: SerializeFrom<ClientFile> }>) {
  const fetcher = useFetcher();

  const isRemovePasswordSubmitting =
    fetcher.state === 'submitting' &&
    fetcher.submission?.formData.get('removePassword') === 'true';
  const isUpdatePasswordSubmitting =
    fetcher.state === 'submitting' &&
    fetcher.submission.formData.get('removePassword') !== 'true';

  const removePassword = () =>
    fetcher.submit(
      {
        removePassword: 'true',
      },
      {
        action: `/api/update-password/${innerProps.file.id}`,
        method: 'post',
      }
    );

  useEffect(() => {
    if (fetcher.data?.success) {
      context.closeModal(id);
      const removed =
        fetcher.submission?.formData.get('removePassword') === 'true';
      const message = removed
        ? 'The password was removed'
        : 'The password was updated';
      notifications.show({
        title: 'Success!',
        message,
        color: 'green',
        autoClose: 10000,
      });
    }
  }, [fetcher.data]);

  return (
    <>
      <ValidatedForm
        validator={updatePasswordValidator}
        fetcher={fetcher}
        method="post"
        action={`/api/update-password/${innerProps.file.id}`}
      >
        <Stack>
          <ValidatedTextInput
            label={`${
              innerProps.file.isPasswordProtected ? 'Updated' : 'New'
            } Password`}
            description={
              innerProps.file.isPasswordProtected
                ? 'Once updated, the old password will no longer work'
                : 'Once set, the password will be required to view this PDF'
            }
            iconWidth={65}
            name="password"
            disabled={fetcher.state === 'submitting'}
            type="password"
            placeholder="**********"
          />

          <Group position="apart">
            {innerProps.file.isPasswordProtected ? (
              <Button
                type="button"
                mt="md"
                onClick={removePassword}
                color="red"
                disabled={
                  fetcher.state === 'submitting' && !isRemovePasswordSubmitting
                }
                loading={isRemovePasswordSubmitting}
              >
                Remove Password
              </Button>
            ) : (
              <Space />
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
                disabled={
                  fetcher.state === 'submitting' && !isUpdatePasswordSubmitting
                }
                loading={isUpdatePasswordSubmitting}
              >
                Save
              </Button>
            </Group>
          </Group>
        </Stack>
      </ValidatedForm>
    </>
  );
}
