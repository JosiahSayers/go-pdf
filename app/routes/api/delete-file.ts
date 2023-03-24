import type { ActionFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Storage } from "~/utils/storage.server";

export const action: ActionFunction = async ({ request }) => {
  const fileUrl = (await request.formData()).get('url');
  if (!fileUrl) {
    return json({ msg: 'fileUrl must be provided' }, { status: 403 });
  }
  await Storage.deleteFile(fileUrl.toString());
  return null;
};
