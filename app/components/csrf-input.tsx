import { useCsrf } from '~/components/context/csrf';

export default function CsrfInput() {
  const csrf = useCsrf();
  return <input type="hidden" name="csrf" defaultValue={csrf} />;
}
