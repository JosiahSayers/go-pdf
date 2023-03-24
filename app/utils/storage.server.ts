import { PassThrough } from 'stream';
import aws from 'aws-sdk';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

async function uploadStream(key: string, contentType: string) {
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
    promise: s3.upload({ Bucket, Key: key, Body: pass, ContentType: contentType }).promise()
  }
}

async function deleteFile(fileUrl: string) {
  try {
    const file = await db.file.delete({ where: { url: fileUrl } });
    return client.send(new DeleteObjectCommand({ Bucket, Key: file.id }));
  } catch (e) {
    console.error('Error deleting file', { fileUrl, error: e });
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
