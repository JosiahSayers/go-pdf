import { Group, Text, useMantineTheme, rem } from "@mantine/core";
import { IconUpload, IconX, IconFile } from "@tabler/icons-react";
import type { DropzoneProps } from "@mantine/dropzone";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";
import { filesize } from "filesize";

type Props = Omit<DropzoneProps, "children">;

export default function Dropzone(props: Props) {
  const theme = useMantineTheme();
  return (
    <MantineDropzone {...props}>
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: rem(220), pointerEvents: "none" }}
      >
        <MantineDropzone.Accept>
          <IconUpload
            size="3.2rem"
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor][
                theme.colorScheme === "dark" ? 4 : 6
              ]
            }
          />
        </MantineDropzone.Accept>
        <MantineDropzone.Reject>
          <IconX
            size="3.2rem"
            stroke={1.5}
            color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
          />
        </MantineDropzone.Reject>
        <MantineDropzone.Idle>
          <IconFile size="3.2rem" stroke={1.5} />
        </MantineDropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag PDFs here or click to select files
          </Text>
          <Text size="sm" color="dimmed" inline mt={7}>
            Drop your file here
            {props.maxSize
              ? `, it should not exceed ${filesize(props.maxSize, {
                  spacer: "",
                })}`
              : ""}
          </Text>
        </div>
      </Group>
    </MantineDropzone>
  );
}
