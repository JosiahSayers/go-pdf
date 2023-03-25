import { Card, Collapse, Group, Stack, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { File } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { IconFile } from "@tabler/icons-react";
import { useCallback } from "react";
import PdfCardDeleteButton from "~/components/dashbaord/pdf-card/delete-button";

interface Props {
  file: SerializeFrom<File>;
}

export default function PdfCard({ file }: Props) {
  const [show, { toggle }] = useDisclosure(true);
  const fetcher = useFetcher();
  const deleteFile = useCallback(() => {
    toggle();
    fetcher.submit(
      {
        id: file.id,
      },
      {
        method: "delete",
        action: "/api/delete-file",
      }
    );
  }, [fetcher, file, toggle]);

  return (
    <Collapse in={show} transitionDuration={500}>
      <Card shadow="sm" padding="lg" withBorder>
        <Group position="apart">
          <Group w={600}>
            <IconFile height={75} width={50} />
            <Stack ml="sm">
              <Text weight="bold">{file.name}</Text>
              <TextInput
                aria-label="URL"
                type="text"
                name="url"
                defaultValue={file.url}
              />
            </Stack>
          </Group>
          <PdfCardDeleteButton onDelete={deleteFile} />
        </Group>
      </Card>
    </Collapse>
  );
}
