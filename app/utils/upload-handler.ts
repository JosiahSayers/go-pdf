import { PassThrough } from 'stream';
import type { UploadHandler } from '@remix-run/node';
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

export class FileTooLargeError extends Error {}

const ONE_MB = 1e6;
const ONE_HUNDRED_MB = 1e8;

const createUploadHandler = async ({
  namesOfFile = 'file',
  maxSize = ONE_MB,
  userId,
}: {
  namesOfFile?: string;
  maxSize?: number;
  userId: string;
}) => {
  const fileRecord = await db.file.create({ data: { url: getUrl(), userId } });
  const uploadHandler: UploadHandler = async ({
    data,
    filename,
    name,
    contentType,
  }) => {
    try {
      if (namesOfFile !== name) return;

      await db.file.update({
        where: { id: fileRecord.id },
        data: { name: filename, mimeType: contentType },
      });

      let totalSize = 0;
      const stream = new PassThrough();
      const uploadResult = Storage.uploadStream(
        fileRecord.id,
        contentType,
        stream
      );

      for await (const chunk of data) {
        totalSize += chunk.byteLength;
        if (totalSize > maxSize) {
          throw new FileTooLargeError();
        }
        stream.write(chunk);
      }
      stream.end();

      await uploadResult;
      return fileRecord.id;
    } catch (e) {
      console.error('Error in uploadHandler', e);
      await db.file.delete({ where: { id: fileRecord.id } });
      throw e;
    }
  };

  return uploadHandler;
};

export const Uploads = {
  getUrl,
  createUploadHandler,
  ONE_MB,
  ONE_HUNDRED_MB,
};
