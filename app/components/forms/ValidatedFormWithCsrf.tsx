import type { ComponentProps } from 'react';
import { AuthenticityTokenInput } from 'remix-utils';
import { ValidatedForm } from 'remix-validated-form';

export default function ValidatedFormWithCsrf({
  children,
  ...props
}: ComponentProps<typeof ValidatedForm>) {
  return (
    <ValidatedForm {...props}>
      <AuthenticityTokenInput />
      {children}
    </ValidatedForm>
  );
}
