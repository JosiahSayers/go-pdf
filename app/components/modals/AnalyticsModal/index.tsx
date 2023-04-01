import type { ContextModalProps } from '@mantine/modals';
import { Button, Stack } from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import type { loader } from '~/routes/api/analytics/$id';
import AnalyticsModalNoEvents from '~/components/modals/AnalyticsModal/NoEvents';
import AnalyticsModalEvents from '~/components/modals/AnalyticsModal/Events';
import AnalyticsModalSkeleton from '~/components/modals/AnalyticsModal/Skeleton';
import type { SubscriptionLevel } from '@prisma/client';
import LockedFeatureAlert from '~/components/locked-feature-alert';

export default function AnalyticsModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  fileId: string;
  subscriptionLevel: SubscriptionLevel;
  paymentFailure: boolean;
}>) {
  const fetcher = useFetcher<typeof loader>();
  const canView =
    innerProps.subscriptionLevel !== 'free' && !innerProps.paymentFailure;

  useEffect(() => {
    if (fetcher.type === 'init' && canView) {
      fetcher.load(`/api/analytics/${innerProps.fileId}`);
    }
  }, [fetcher, innerProps, canView]);

  const loading = fetcher.state === 'loading';
  const noEvents =
    fetcher.state === 'idle' && fetcher.data?.events.length === 0;
  const showEvents = fetcher.state === 'idle' && !!fetcher.data?.events.length;

  return (
    <Stack>
      {!canView && (
        <LockedFeatureAlert paymentFailure={innerProps.paymentFailure}>
          Upgrade to a paid subscription to unlock the ability to view detailed
          analytics about your PDF's usage.
        </LockedFeatureAlert>
      )}
      {(loading || !canView) && <AnalyticsModalSkeleton animate={canView} />}
      {noEvents && <AnalyticsModalNoEvents />}
      {showEvents && <AnalyticsModalEvents events={fetcher.data!} />}

      <Button fullWidth mt="md" onClick={() => context.closeModal(id)}>
        Close
      </Button>
    </Stack>
  );
}
