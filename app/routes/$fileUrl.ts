import type { LoaderArgs } from '@remix-run/node';
import { db } from '~/utils/db.server';
import type { GetFileParams } from '~/utils/storage.server';
import { Storage } from '~/utils/storage.server';

function getFileParams({
  params,
  request,
}: Pick<LoaderArgs, 'params' | 'request'>): GetFileParams & {
  isQrLoad: boolean;
} {
  const fileUrl = params.fileUrl;
  const id = new URL(request.url).searchParams.get('id') ?? undefined;
  const isQrLoad = fileUrl === 'qr' && !!id;
  return { fileUrl: isQrLoad ? undefined : fileUrl, id, isQrLoad };
}

export async function loader({ params, request }: LoaderArgs) {
  try {
    const { isQrLoad, ...rest } = getFileParams({ params, request });
    const { file, fileStore } = await Storage.getFile(rest);
    await db.fileEvent.create({
      data: {
        fileId: file.id,
        event: isQrLoad ? 'qr_code_view' : 'view',
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
