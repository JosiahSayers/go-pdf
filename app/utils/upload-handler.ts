import type { UploadHandler } from '@remix-run/node';
import { writeAsyncIterableToWritable } from '@remix-run/node';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
  colors,
} from 'unique-names-generator';
import { db } from '~/utils/db.server';
import { Storage } from '~/utils/storage.server';

const getUrl = (seed?: string) =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    seed,
  });

export const uploadHandler: UploadHandler = async ({
  data,
  filename,
  name,
  contentType,
}) => {
  if (name !== 'file') return;

  const url = getUrl();
  const file = await db.file.create({
    data: { name: filename!, url, mimeType: contentType },
  });
  const stream = await Storage.uploadStream(file.id, contentType);
  await writeAsyncIterableToWritable(data, stream.writeStream);
  await stream.promise;
  return file.id;
};
