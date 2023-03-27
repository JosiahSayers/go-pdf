import { PassThrough } from 'stream';
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

interface GetFileByUrlParams {
  fileUrl: string;
  id?: undefined;
}

interface GetFileByIdParams {
  id: string;
  fileUrl?: undefined;
}

type GetFileParams = GetFileByUrlParams | GetFileByIdParams;

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

async function uploadStream(key: string, contentType: string) {
  const s3 = new aws.S3({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_ACCESS_KEY!,
    },
  });

  const pass = new PassThrough();

  return {
    writeStream: pass,
    promise: s3
      .upload({ Bucket, Key: key, Body: pass, ContentType: contentType })
      .promise(),
  };
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

async function getAllObjects() {
  try {
    return db.file.findMany();
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
