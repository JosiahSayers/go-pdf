import { useMantineTheme, Text, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconX } from '@tabler/icons-react';
import { useState } from 'react';

interface Props {
  onDelete: () => void;
}

export default function PdfCardDeleteButton({ onDelete }: Props) {
  const theme = useMantineTheme();
  const [hovered, setHovered] = useState(false);

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Delete this PDF',
      centered: true,
      children: (
        <Text>
          Are you sure you want to delete this PDF? Any shared links and QR
          codes will stop working. This action cannot be reversed.
        </Text>
      ),
      labels: { confirm: 'Delete PDF', cancel: "No don't delete it" },
      confirmProps: { color: 'red' },
      onConfirm: () => onDelete(),
    });

  return (
    <Button
      variant="subtle"
      color="red"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={openDeleteModal}
    >
      <IconX
        width={30}
        height={30}
        stroke={1.5}
        color={
          hovered
            ? theme.colors.red[6]
            : theme.colors.red[theme.colorScheme === 'dark' ? 2 : 4]
        }
      />
    </Button>
  );
}
