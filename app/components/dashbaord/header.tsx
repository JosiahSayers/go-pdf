import type { HeaderProps } from "@mantine/core";
import { Group } from "@mantine/core";
import { Header as MantineHeader, Title } from "@mantine/core";

interface Props extends Omit<HeaderProps, "children" | "height"> {
  user: {
    name: string;
  };
  height?: HeaderProps["height"];
}

export default function Header({
  user,
  height = 60,
  px = "3rem",
  ...props
}: Props) {
  return (
    <MantineHeader height={height} px={px} {...props}>
      <Group sx={{ height: "100%" }} position="apart">
        <Title order={1}>PdfMe</Title>
        <Group>
          <p>{user.name}</p>
        </Group>
      </Group>
    </MantineHeader>
  );
}
