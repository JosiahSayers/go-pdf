import type { ContextModalProps } from '@mantine/modals';
import { Button } from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import type { loader } from '~/routes/api/analytics/$id';
import AnalyticsModalNoEvents from '~/components/modals/AnalyticsModal/NoEvents';
import AnalyticsModalEvents from '~/components/modals/AnalyticsModal/Events';
import AnalyticsModalSkeleton from '~/components/modals/AnalyticsModal/Skeleton';

export default function AnalyticsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ fileId: string }>) {
  const fetcher = useFetcher<typeof loader>();

  useEffect(() => {
    if (fetcher.type === 'init') {
      fetcher.load(`/api/analytics/${innerProps.fileId}`);
    }
  }, [fetcher, innerProps]);

  const loading = fetcher.state === 'loading';
  const noEvents =
    fetcher.state === 'idle' && fetcher.data?.events.length === 0;
  const showEvents = fetcher.state === 'idle' && !!fetcher.data?.events.length;

  return (
    <>
      {loading && <AnalyticsModalSkeleton />}
      {noEvents && <AnalyticsModalNoEvents />}
      {showEvents && <AnalyticsModalEvents events={fetcher.data!} />}

      <Button fullWidth mt="md" onClick={() => context.closeModal(id)}>
        Close
      </Button>
    </>
  );
}
