import type { ContextModalProps } from "@mantine/modals";
import { Button, Group, Image, Text } from "@mantine/core";

export default function QrCodeModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ fileId: string }>) {
  const url = `/api/qr-code?id=${innerProps.fileId}`;

  return (
    <>
      <Text size="sm">
        This QR code links directly to your PDF when scanned. Download it, print
        it, add it to your social media. This QR code will work as long as the
        PDF is not deleted from PdfMe, even if you decide to change the URL or
        update the PDF itself.
      </Text>

      <Image src={url} />

      <Group position="right">
        <Button component="a" mt="md" download href={url}>
          Download
        </Button>
        <Button mt="md" onClick={() => context.closeModal(id)}>
          Close
        </Button>
      </Group>
    </>
  );
}