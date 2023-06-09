import type { PassThrough } from 'stream';
import aws from 'aws-sdk';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { db } from '~/utils/db.server';

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_ACCESS_KEY!,
  },
});
const Bucket = process.env.R2_BUCKET!;

export interface GetFileParams {
  fileUrl?: string;
  id?: string;
}

async function getFile({ fileUrl, id }: GetFileParams) {
  try {
    const where = fileUrl ? { url: fileUrl } : { id };
    const file = await db.file.findUnique({ where });
    if (!file) {
      throw new Error(`Unable to find file in database`);
    }
    return {
      file,
      fileStore: await client.send(
        new GetObjectCommand({ Bucket, Key: file.id })
      ),
    };
  } catch (e) {
    console.error('Error getting file from bucket', { fileUrl, error: e });
    throw e;
  }
}

async function uploadStream(
  key: string,
  contentType: string,
  stream: PassThrough
) {
  const s3 = new aws.S3({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_ACCESS_KEY!,
    },
  });

  return s3
    .upload({ Bucket, Key: key, Body: stream, ContentType: contentType })
    .promise();
}

async function deleteFile(id: string) {
  try {
    const file = await db.file.delete({ where: { id } });
    return client.send(new DeleteObjectCommand({ Bucket, Key: file.id }));
  } catch (e) {
    console.error('Error deleting file', { fileUrl: id, error: e });
    throw e;
  }
}

async function getAllObjects(userId: string) {
  try {
    return db.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  } catch (e) {
    console.error('Error grabbing bucket objects', e);
    throw e;
  }
}

export const Storage = {
  deleteFile,
  getFile,
  uploadStream,
  getAllObjects,
};
