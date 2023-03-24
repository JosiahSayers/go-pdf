import { PassThrough } from 'stream';
import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import aws from 'aws-sdk';
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "~/utils/db.server";

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_ACCESS_KEY!,
  }
});
const Bucket = process.env.R2_BUCKET!;

async function getFile(fileUrl: string) {
  try {
    const file = await db.file.findUnique({ where: { url: fileUrl } });
    if (!file) {
      throw new Error(`Unable to find file in database`);
    }
    return await client.send(new GetObjectCommand({ Bucket, Key: file.id }));
  } catch (e) {
    console.error('Error getting file from bucket', { fileUrl, error: e });
    throw e;
  }
}

async function storeFile(Key: string, Body: PutObjectCommandInput['Body']) {
  try {
    const file = await db.file.create({ data: { name: Key, url: Key } });
    return await client.send(new PutObjectCommand({ Bucket, Key: file.id, Body }));
  } catch (e) {
    console.error('Error storing file in bucket', { Key, error: e });
    throw e;
  }
}

async function uploadStream(key: string) {
  const s3 = new aws.S3({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_ACCESS_KEY!,
    }
  });
  const pass = new PassThrough();
  return {
    writeStream: pass,
    promise: s3.upload({ Bucket, Key: key, Body: pass }).promise()
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
  getFile,
  storeFile,
  uploadStream,
  getAllObjects,
};
