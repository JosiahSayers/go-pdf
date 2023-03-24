import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_ACCESS_KEY!,
  }
});
const Bucket = process.env.R2_BUCKET;

async function getFile(Key: string) {
  try {
    return await client.send(new GetObjectCommand({ Bucket, Key }));
  } catch (e) {
    console.error('Error getting file from bucket', { Key, error: e });
    throw e;
  }
}

async function storeFile(Key: string, Body: PutObjectCommandInput['Body']) {
  try {
    return await client.send(new PutObjectCommand({ Bucket, Key, Body }));
  } catch (e) {
    console.error('Error storing file in bucket', { Key, error: e });
    throw e;
  }
}

async function getAllObjects() {
  try {
    return await client.send(new ListObjectsV2Command({ Bucket }));
  } catch (e) {
    console.error('Error grabbing bucket objects', e);
    throw e;
  }
}

export const Storage = {
  getFile,
  storeFile,
  getAllObjects,
};
