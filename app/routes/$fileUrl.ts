import type { LoaderArgs } from "@remix-run/node";
import { Storage } from "~/utils/storage.server";

export async function loader({ params }: LoaderArgs) {
  try {
    const file = await Storage.getFile(params.fileUrl!);
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    return new Response(file.Body?.transformToWebStream(), { headers });
  } catch (e) {
    return new Response('Not Found', { status: 404 });
  }
};
