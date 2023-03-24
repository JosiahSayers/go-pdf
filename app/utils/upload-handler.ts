import type { UploadHandler} from "@remix-run/node";
import { writeAsyncIterableToWritable } from "@remix-run/node";
import { paramCase } from 'change-case';
import { db } from "~/utils/db.server";
import { Storage } from "~/utils/storage.server";

export const uploadHandler: UploadHandler = async ({ data, filename, name, contentType }) => {
  const url = paramCase(filename!.replace('.pdf', ''));
  console.log({ filename, url, name });
  const existingFile = await db.file.findUnique({ where: { url } });
  const file = existingFile ?? await db.file.create({ data: { name: filename!, url } });
  const stream = await Storage.uploadStream(file.id);
  await writeAsyncIterableToWritable(data, stream.writeStream);
  await stream.promise;
  return file.id;
};
