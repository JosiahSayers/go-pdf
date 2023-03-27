import type { LoaderArgs } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { Storage } from '~/utils/storage.server';

export async function loader({ params }: LoaderArgs) {
  try {
    const { file, fileStore } = await Storage.getFile({ id: params.id! });
    await db.fileEvent.create({
      data: {
        fileId: file.id,
        event: 'qr_code_view',
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
