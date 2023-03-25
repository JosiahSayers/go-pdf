import { Space, Stack } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { PDF_MIME_TYPE } from "@mantine/dropzone";
import type { ActionArgs } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useCallback } from "react";
import PdfCard from "~/components/dashbaord/pdf-card";
import PdfCardSkeleton from "~/components/dashbaord/pdf-card/skeleton";
import Dropzone from "~/components/dropzone";
import { Storage } from "~/utils/storage.server";
import { uploadHandler } from "~/utils/upload-handler";

const TEN_MB = 1e7;

export async function loader() {
  const objects = await Storage.getAllObjects();
  return json({ existingObjects: objects ?? [] });
}

export async function action({ request }: ActionArgs) {
  await unstable_parseMultipartFormData(request, uploadHandler);
  return null;
}

export default function TestUpload() {
  const { existingObjects } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

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
      <Dropzone
        onDrop={handleDrop}
        onReject={console.log}
        accept={PDF_MIME_TYPE}
        maxSize={TEN_MB}
        maxFiles={1}
        multiple={false}
        name="file"
        loading={fetcher.state !== "idle"}
      />

      <Space h="xl" />

      <Stack>
        {existingObjects.map((obj) => (
          <PdfCard file={obj} key={obj.id} />
        ))}

        {fetcher.state !== "submitting" && <PdfCardSkeleton />}
        {fetcher.state === "submitting" && <PdfCardSkeleton />}
      </Stack>
    </>
  );
}
