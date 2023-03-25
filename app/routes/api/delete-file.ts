import type { ActionFunction} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Storage } from "~/utils/storage.server";

export const action: ActionFunction = async ({ request }) => {
  const fileId = (await request.formData()).get('id');
  if (!fileId) {
    return json({ msg: 'id must be provided' }, { status: 403 });
  }
  await Storage.deleteFile(fileId.toString());
  return null;
};
