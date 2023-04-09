import {
  Button,
  Center,
  Grid,
  Space,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconPdf } from '@tabler/icons-react';
import MarketingFeature from '~/components/marketing/feature';

export default function PdfHosting() {
  return (
    <Stack>
      <Title order={2} align="center" size={65}>
        PDF Hosting
      </Title>
      <Space />
      <Center>
        <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
          Upload a PDF
        </Button>
      </Center>

      <Space h="5rem" />

      <Grid grow>
        <Grid.Col span={4}>
          <Stack>
            <Title order={3}>PDF Hosting, Made Easy</Title>
            <Text>
              Getting a hosting provider setup can be complicated, we think that
              sucks. PdfMe is the easiest way to upload and share your PDF
              files. We provide simple to use tools that make your job a breeze.
              Try us out today with a free account.
            </Text>
          </Stack>
        </Grid.Col>

        <Grid.Col span={4}>
          <Center h="100%">
            <ThemeIcon size="3rem">
              <IconPdf size="3rem" />
            </ThemeIcon>
          </Center>
        </Grid.Col>
      </Grid>

      <Space h="8rem" />

      <Grid>
        <MarketingFeature title="Low Cost, High Performance">
          We're powered by CloudFlare which lets us offer you competitive prices
          while tapping into the speed of a worldwide storage provider.
        </MarketingFeature>

        <MarketingFeature title="Breezy PDF Uploading">
          All you have to do is drag and drop your PDF file to get started.
          Within seconds it will be ready to view worldwide.
        </MarketingFeature>

        <MarketingFeature title="QR Code Built In">
          Need an easy way to share your PDF? We'll create a unique QR code for
          each of your PDFs. This is great for restaurants who want to share
          their menu with patrons.
        </MarketingFeature>

        <MarketingFeature title="Free Shareable Link">
          Each PDF you upload will be given a random link. If you don't like
          what we generated you're free to change it as many times as you want.
        </MarketingFeature>

        <MarketingFeature title="Analytics & Insights">
          See how often your PDF is being viewed with analytics built in to the
          platform.
        </MarketingFeature>
      </Grid>

      <Space h="8rem" />

      <Center>
        <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}>
          Upload your PDF now
        </Button>
      </Center>
    </Stack>
  );
}
