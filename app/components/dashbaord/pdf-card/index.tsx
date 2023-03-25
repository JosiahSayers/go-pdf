import {
  Anchor,
  Card,
  Collapse,
  Grid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { File } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
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
        <Grid align="center">
          <Grid.Col span="content">
            <IconFile height={75} width={50} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Stack ml="sm">
              <Text weight="bold" size="lg">
                {file.name}
              </Text>
              <Anchor href={`/${file.url}`}>pdf.me/{file.url}</Anchor>
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto" />
          <Grid.Col span="content">
            <PdfCardDeleteButton onDelete={deleteFile} />
          </Grid.Col>
        </Grid>
      </Card>
    </Collapse>
  );
}
