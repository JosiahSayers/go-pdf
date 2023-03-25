import {
  Anchor,
  Button,
  Card,
  Collapse,
  Grid,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { File } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { IconFileText } from "@tabler/icons-react";
import { useCallback } from "react";
import PdfCardDeleteButton from "~/components/dashbaord/pdf-card/delete-button";

interface Props {
  file: SerializeFrom<File>;
}

export default function PdfCard({ file }: Props) {
  const [opened, { close }] = useDisclosure(true);
  const fetcher = useFetcher();

  const deleteFile = useCallback(() => {
    close();
    fetcher.submit(
      {
        id: file.id,
      },
      {
        method: "delete",
        action: "/api/delete-file",
      }
    );
  }, [fetcher, file, close]);

  return (
    <Collapse in={opened} transitionDuration={500}>
      <Card shadow="sm" padding="lg" withBorder>
        <Grid align="center">
          <Grid.Col span="content">
            <IconFileText height={75} width={50} />
          </Grid.Col>
          <Grid.Col span={5}>
            <Stack ml="sm">
              <Text weight="bold" size="lg">
                {file.name}
              </Text>
              <Anchor href={`/${file.url}`}>pdf.me/{file.url}</Anchor>
            </Stack>
          </Grid.Col>
          <Grid.Col span="auto">
            <Stack px="5rem">
              <Button
                compact
                variant="subtle"
                styles={{
                  root: {
                    width: "fit-content",
                  },
                }}
              >
                Analytics
              </Button>
              <Button
                compact
                variant="subtle"
                styles={{ root: { width: "fit-content" } }}
              >
                Password Protection
              </Button>
            </Stack>
          </Grid.Col>
          <Grid.Col span="content">
            <PdfCardDeleteButton onDelete={deleteFile} />
          </Grid.Col>
        </Grid>
      </Card>
    </Collapse>
  );
}
