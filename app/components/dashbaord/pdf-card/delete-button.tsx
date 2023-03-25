import { useMantineTheme } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
  onDelete: () => void;
}

export default function PdfCardDeleteButton({ onDelete }: Props) {
  const theme = useMantineTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <IconX
      width={30}
      height={30}
      stroke={1.5}
      color={
        hovered
          ? theme.colors.red[6]
          : theme.colors.red[theme.colorScheme === "dark" ? 2 : 4]
      }
      style={{ cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDelete}
    />
  );
}
