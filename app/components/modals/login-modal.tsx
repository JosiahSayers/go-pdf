import type { ContextModalProps } from '@mantine/modals';
import { Button, Group, Stack } from '@mantine/core';
import { useFetcher, useNavigate } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';
import { loginFormValidator } from '~/routes/api/login';
import ValidatedTextInput from '~/components/ValidatedTextInput';
import CsrfInput from '~/components/csrf-input';
import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';

export default function LoginModal({ context, id }: ContextModalProps<{}>) {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data?.success) {
      notifications.show({
        title: `Logged In`,
        message: `Welcome back ${fetcher.data?.name}`,
        color: 'green',
        autoClose: 10000,
      });
      navigate('/dashboard');
      context.closeModal(id);
    }
  }, [fetcher.data]);

  return (
    <ValidatedForm
      fetcher={fetcher}
      validator={loginFormValidator}
      method="post"
      action="/api/login"
    >
      <Stack>
        <ValidatedTextInput label="Email" name="email" />
        <ValidatedTextInput label="Password" name="password" type="password" />
        <CsrfInput />

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
    </ValidatedForm>
  );
}
