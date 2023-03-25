import type { LoaderArgs } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { Storage } from "~/utils/storage.server";

export async function loader({ params }: LoaderArgs) {
  try {
    const {file, fileStore} = await Storage.getFile(params.fileUrl!);
    await db.fileEvent.create({ data: {
      fileId: file.id,
      event: 'view'
    }});
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    return new Response(fileStore.Body?.transformToWebStream(), { headers });
  } catch (e) {
    console.error(e);
    return new Response('Not Found', { status: 404 });
  }
};
