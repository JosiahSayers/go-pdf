import {
  Button,
  Card,
  Center,
  Container,
  Group,
  Stack,
  Title,
} from '@mantine/core';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import * as yup from 'yup';
import {
  useFormContext,
  ValidatedForm,
  validationError,
} from 'remix-validated-form';
import ValidatedTextInput from '~/components/ValidatedTextInput';
import { withYup } from '@remix-validated-form/with-yup';
import { IncorrectPasswordError, Storage } from '~/utils/storage.server';
import { db } from '~/utils/db.server';

const formId = 'password-protected-file-form';

const passwordProtectionSchema = yup.object({
  password: yup.string().required('Password is required'),
  fileUrl: yup.string(),
  id: yup.string(),
});
export const passwordProtectionValidator = withYup(passwordProtectionSchema);

export async function loader({ request }: LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const fileUrl = searchParams.get('fileUrl') ?? '';
  const id = searchParams.get('id') ?? '';
  if (!fileUrl && !id) {
    throw new Response('fileUrl or id search param is required');
  }
  return json({ fileUrl, id });
}

export async function action(loaderData: ActionArgs) {
  const validationResult = await passwordProtectionValidator.validate(
    await loaderData.request.formData()
  );
  if (validationResult.error) {
    return validationError(
      validationResult.error,
      validationResult.submittedData
    );
  }

  try {
    let { fileUrl, id } = validationResult.data;
    const isQrCodeView = !!id;
    const { file, fileStore } = await Storage.getFile({
      fileUrl,
      id,
      password: validationResult.data.password,
    } as any);
    await db.fileEvent.create({
      data: {
        fileId: file.id,
        event: isQrCodeView ? 'qr_code_view' : 'view',
      },
    });

    return new Response(fileStore.Body?.transformToWebStream(), {
      headers: { 'Content-Type': 'application/pdf' },
    });
  } catch (e) {
    console.error(e);
    if (e instanceof IncorrectPasswordError) {
      return validationError(
        {
          fieldErrors: {
            password: 'Incorrect password',
          },
        },
        validationResult.submittedData
      );
    }
    return new Response('Not Found', { status: 404 });
  }
}

export default function PasswordPrompt() {
  const { fileUrl, id } = useLoaderData<typeof loader>();
  const formContext = useFormContext(formId);

  return (
    <Container h="100vh">
      <Center h="100%">
        <Stack>
          <Title order={1}>This file is password protected</Title>
          <Card withBorder shadow="sm" padding="lg">
            <ValidatedForm
              validator={passwordProtectionValidator}
              method="post"
              id={formId}
              reloadDocument
            >
              <ValidatedTextInput
                name="password"
                label="Password"
                description="Enter the password to view this file"
                type="password"
              />
              <input type="hidden" defaultValue={fileUrl} name="fileUrl" />
              <input type="hidden" defaultValue={id} name="id" />
              <Group position="right">
                <Button
                  mt="md"
                  type="submit"
                  loading={formContext.isSubmitting}
                >
                  View File
                </Button>
              </Group>
            </ValidatedForm>
          </Card>
        </Stack>
      </Center>
    </Container>
  );
}
