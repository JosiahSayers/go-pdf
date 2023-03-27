import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { Storage } from '~/utils/storage.server';

function getFileParams({ params, request }: LoaderArgs | ActionArgs) {
  const searchParams = new URL(request.url).searchParams;
  const id = searchParams.get('id');
  const isQrCodeView = params.fileIdentifier === 'qr' && !!id;
  const fileParams = isQrCodeView
    ? { id }
    : { fileUrl: params.fileIdentifier! };
  return { ...fileParams, isQrCodeView };
}

export async function loader(loaderData: LoaderArgs) {
  try {
    const fileParams = getFileParams(loaderData);
    const isPasswordProtected = await Storage.isFilePasswordProtected(
      fileParams
    );
    if (isPasswordProtected) {
      const redirectParams = new URLSearchParams();
      if (fileParams.id) {
        redirectParams.append('id', fileParams.id);
      }
      if (fileParams.fileUrl) {
        redirectParams.append('fileUrl', fileParams.fileUrl);
      }
      return redirect(`/password-prompt?${redirectParams}`);
    }

    const { file, fileStore } = await Storage.getFile(fileParams);
    await db.fileEvent.create({
      data: {
        fileId: file.id,
        event: 'view',
      },
    });

    return new Response(fileStore.Body?.transformToWebStream(), {
      headers: { 'Content-Type': 'application/pdf' },
    });
  } catch (e) {
    console.error(e);
    return new Response('Not Found', { status: 404 });
  }
}
