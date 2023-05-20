import type { ContextModalProps } from '@mantine/modals';
import { Button, Group, Space, Stack, Text } from '@mantine/core';
import { useFetcher, useNavigate } from '@remix-run/react';
import ValidatedTextInput from '~/components/forms/ValidatedTextInput';
import { useEffect } from 'react';
import { registerFormValidator } from '~/routes/api/register';
import { notifications } from '@mantine/notifications';
import ValidatedFormWithCsrf from '~/components/forms/ValidatedFormWithCsrf';

export default function RegisterModal({ context, id }: ContextModalProps<{}>) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.success) {
      notifications.show({
        title: 'Account Created!',
        message: "Your registration is complete. Now let's upload some PDFs!",
        color: 'green',
        autoClose: 10000,
      });
      navigate('/dashboard');
      context.closeModal(id);
    }
  }, [fetcher.data]);

  return (
    <ValidatedFormWithCsrf
      fetcher={fetcher}
      validator={registerFormValidator}
      method="post"
      action="/api/register"
    >
      <Stack>
        <Text>
          You're one step away from uploading your first PDF. Let's get to know
          each other.
        </Text>
        <Group position="apart">
          <ValidatedTextInput label="Name" name="name" withAsterisk />
          <ValidatedTextInput label="Company" name="company" />
        </Group>
        <Space />
        <ValidatedTextInput label="Email" name="email" withAsterisk />
        <ValidatedTextInput
          label="Password"
          name="password"
          type="password"
          withAsterisk
        />
        <ValidatedTextInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          withAsterisk
        />

        <Group position="right">
          <Button
            variant="outline"
            color="dark"
            mt="md"
            type="button"
            onClick={() => context.closeModal(id)}
            disabled={fetcher.state === 'submitting'}
          >
            Close
          </Button>
          <Button
            mt="md"
            type="submit"
            loading={fetcher.state === 'submitting'}
          >
            Login
          </Button>
        </Group>
      </Stack>
    </ValidatedFormWithCsrf>
  );
}
