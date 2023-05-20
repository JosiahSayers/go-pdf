import { useRevalidator } from '@remix-run/react';
import { useEffect } from 'react';

export default function useRevalidateOnFocus() {
  let { revalidate } = useRevalidator();

  useEffect(() => {
    window.addEventListener('focus', revalidate);
    window.addEventListener('visibilitychange', revalidate);

    return () => {
      window.removeEventListener('focus', revalidate);
      window.removeEventListener('visibilitychange', revalidate);
    };
  }, [revalidate]);
}
