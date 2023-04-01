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
import { Subscriptions } from '~/utils/subscription.server';
import SubscriptionStatus from '~/components/dashboard/subscription-status';

export async function loader({ request }: LoaderArgs) {
  const userId = await Session.requireLoggedInUser(request);
  const files = await Storage.getAllObjects(userId);
  // TODO: if account is free and any file is over max size disable that file
  const { maxUploadCount, maxUploadSize, canUpload, subscription } =
    await Subscriptions.find(userId, files);
  const remainingUploadCount =
    maxUploadCount === null ? null : maxUploadCount - files.length;
  return json({
    existingObjects: files,
    maxUploadSize,
    canUpload,
    maxUploadCount,
    remainingUploadCount,
    subscriptionLevel: subscription.level,
    paymentFailure: subscription.status === 'payment_issue',
  });
}

export async function action({ request }: ActionArgs) {
  await Session.validateCsrf(request);
  const userId = await Session.requireLoggedInUser(request);
  const { maxUploadSize } = await Subscriptions.find(userId);
  try {
    const uploadHandler = await Uploads.createUploadHandler({
      userId,
      maxSize: maxUploadSize,
    });
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
  const {
    existingObjects,
    maxUploadSize,
    canUpload,
    remainingUploadCount,
    subscriptionLevel,
    paymentFailure,
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const showErrorNotification = useCallback(
    (message: string, title = 'Error') =>
      notifications.show({
        title,
        message,
        color: 'red',
        autoClose: false,
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
      fileRejections.forEach((file) => {
        const errorMessage =
          file.errors[0].code === 'file-too-large'
            ? `File is larger than the maximum allowed size (${filesize(
                maxUploadSize
              )})`
            : file.errors[0].message;
        showErrorNotification(
          errorMessage,
          `Unable to upload ${file.file.name}`
        );
      });
    },
    [showErrorNotification, maxUploadSize]
  );

  return (
    <>
      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        accept={PDF_MIME_TYPE}
        maxSize={maxUploadSize}
        maxFiles={1}
        multiple={false}
        name="file"
        loading={fetcher.state !== 'idle'}
        validator={() =>
          !canUpload.canUpload
            ? { message: canUpload.reason, code: 'uploads-disabled' }
            : null
        }
        canUpload={canUpload}
      />

      <Space h="xl" />

      <Stack>
        {existingObjects.map((obj) => (
          <PdfCard
            file={obj}
            subscriptionLevel={subscriptionLevel}
            key={obj.id}
            paymentFailure={paymentFailure}
          />
        ))}

        {fetcher.state !== 'idle' && <PdfCardSkeleton />}
      </Stack>

      <Space h="5rem" />

      <SubscriptionStatus
        remainingUploadCount={remainingUploadCount}
        canUpload={canUpload}
      />
    </>
  );
}
