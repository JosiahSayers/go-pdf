import { Space, Stack } from '@mantine/core';
import type { FileWithPath } from '@mantine/dropzone';
import type { FileRejection } from 'react-dropzone';
import { PDF_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { unstable_parseMultipartFormData } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useCallback, useEffect } from 'react';
import { useCsrf } from '~/components/context/csrf';
import PdfCard from '~/components/dashboard/pdf-card';
import PdfCardSkeleton from '~/components/dashboard/pdf-card/skeleton';
import Dropzone from '~/components/dropzone';
import { Session } from '~/utils/session.server';
import { Storage } from '~/utils/storage.server';
import { FileTooLargeError, Uploads } from '~/utils/upload-handler';
import { filesize } from 'filesize';

export async function loader({ request }: LoaderArgs) {
  const userId = await Session.requireLoggedInUser(request);
  const objects = await Storage.getAllObjects(userId);
  const maxSize = Uploads.ONE_MB;
  return json({
    existingObjects: objects ?? [],
    maxSize,
  });
}

export async function action({ request }: ActionArgs) {
  await Session.validateCsrf(request);
  const userId = await Session.requireLoggedInUser(request);
  try {
    const uploadHandler = await Uploads.createUploadHandler({ userId });
    await unstable_parseMultipartFormData(request, uploadHandler);
  } catch (e) {
    console.error(e);
    if (e instanceof FileTooLargeError) {
      return json({ error: 'File is too large' });
    }
    return json({
      error: 'Unexpected error, please try again in a little bit.',
    });
  }

  return null;
}

export default function Dashboard() {
  const csrf = useCsrf();
  const { existingObjects, maxSize } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const showErrorNotification = useCallback(
    (message: string, title = 'Error') =>
      notifications.show({
        title,
        message,
        color: 'red',
        autoClose: 10000,
      }),
    []
  );

  useEffect(() => {
    if (fetcher.data?.error) {
      showErrorNotification(fetcher.data.error);
    }
  }, [fetcher.data, showErrorNotification]);

  const handleDrop = useCallback(
    (newFile: FileWithPath[]) => {
      const formData = new FormData();
      formData.append('file', newFile[0]);
      formData.append('csrf', csrf);
      fetcher.submit(formData, {
        method: 'post',
        encType: 'multipart/form-data',
      });
    },
    [fetcher, csrf]
  );

  const handleReject = useCallback(
    (fileRejections: FileRejection[]) => {
      console.log(fileRejections);
      fileRejections.forEach((file) => {
        const errorMessage =
          file.errors[0].code === 'file-too-large'
            ? `File is larger than the maximum allowed size (${filesize(
                maxSize
              )})`
            : file.errors[0].message;
        showErrorNotification(
          errorMessage,
          `Unable to upload ${file.file.name}`
        );
      });
    },
    [showErrorNotification, maxSize]
  );

  return (
    <>
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        accept={PDF_MIME_TYPE}
        maxSize={maxSize}
        maxFiles={1}
        multiple={false}
        name="file"
        loading={fetcher.state !== 'idle'}
      />

      <Space h="xl" />

      <Stack>
        {existingObjects.map((obj) => (
          <PdfCard file={obj} key={obj.id} />
        ))}

        {fetcher.state !== 'idle' && <PdfCardSkeleton />}
      </Stack>
    </>
  );
}
