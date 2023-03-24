import { Button } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { PDF_MIME_TYPE } from "@mantine/dropzone";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback } from "react";
import Dropzone from "~/components/dropzone";
import { Storage } from "~/utils/storage.server";
import { uploadHandler } from "~/utils/upload-handler";

const TEN_MB = 1e7;

export const loader: LoaderFunction = async () => {
  const objects = await Storage.getAllObjects();
  return json({ existingObjects: objects ?? [] });
};

export const action: ActionFunction = async ({ request }) => {
  const fullUploadHandler = unstable_composeUploadHandlers(
    uploadHandler,
    unstable_createMemoryUploadHandler()
  );
  await unstable_parseMultipartFormData(request, fullUploadHandler);
  return null;
};

export default function TestUpload() {
  const { existingObjects } = useLoaderData();
  const fetcher = useFetcher();

  const handleDrop = useCallback(
    (newFile: FileWithPath[]) => {
      console.log(newFile);
      const formData = new FormData();
      formData.append("file", newFile[0]);
      fetcher.submit(formData, {
        method: "post",
        encType: "multipart/form-data",
      });
    },
    [fetcher]
  );

  return (
    <>
      <h1>Test Page</h1>
      <Form method="post" encType="multipart/form-data">
        <Dropzone
          onDrop={handleDrop}
          onReject={console.log}
          accept={PDF_MIME_TYPE}
          maxSize={TEN_MB}
          maxFiles={1}
          multiple={false}
          name="file"
        />
        <Button type="submit">Upload</Button>
      </Form>

      <br />
      <ul>
        {existingObjects.map((obj) => (
          <li key={obj.id}>
            <a href={`/get-contents/${obj.url}`}>{obj.name}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
