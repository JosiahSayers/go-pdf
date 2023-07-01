import { Group, Text, useMantineTheme, rem } from '@mantine/core';
import { IconUpload, IconX, IconFile } from '@tabler/icons-react';
import type { DropzoneProps } from '@mantine/dropzone';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import { filesize } from 'filesize';
import type { SerializeFrom } from '@remix-run/node';
import type { loader } from '~/routes/dashboard/index';

interface Props extends Omit<DropzoneProps, 'children'> {
  fullscreen?: boolean;
  canUpload: SerializeFrom<typeof loader>['canUpload'];
}

export default function Dropzone({ fullscreen, canUpload, ...props }: Props) {
  const theme = useMantineTheme();

  const DropzoneComponent = fullscreen
    ? MantineDropzone.FullScreen
    : MantineDropzone;

  return (
    <DropzoneComponent
      {...props}
      active={fullscreen ? true : undefined}
      maxSize={canUpload.canUpload ? props.maxSize : undefined}
    >
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: rem(220), pointerEvents: 'none' }}
      >
        <MantineDropzone.Accept>
          <IconUpload
            size="3.2rem"
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor][
                theme.colorScheme === 'dark' ? 4 : 6
              ]
            }
          />
        </MantineDropzone.Accept>
        <MantineDropzone.Reject>
          <IconX
            size="3.2rem"
            stroke={1.5}
            color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
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
              ? `, it can be as large as ${filesize(props.maxSize)}`
              : ''}
          </Text>
        </div>
      </Group>
    </DropzoneComponent>
  );
}
