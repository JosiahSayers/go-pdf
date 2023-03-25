import { Button } from "@mantine/core";
import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  onClick: () => void;
  children: string;
}

export default function PdfCardActionButton({ onClick, children }: Props) {
  return (
    <Button
      compact
      variant="subtle"
      styles={{ root: { width: "fit-content" } }}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
