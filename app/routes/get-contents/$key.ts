import type { LoaderFunction } from "@remix-run/node";
import { Storage } from "~/utils/storage.server";

export const loader: LoaderFunction = async ({ params }) => {
  const file = await Storage.getFile(params.key!);
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  return new Response(file.Body?.transformToWebStream(), { headers });
};
