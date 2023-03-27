import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { validationError } from 'remix-validated-form';
import * as yup from 'yup';
import { Storage } from '~/utils/storage.server';
import { withYup } from '@remix-validated-form/with-yup';

export const updatePasswordSchema = yup.object({
  password: yup
    .string()
    .max(30, 'A password needs to be 30 characters or less')
    .when('removePassword', (removePassword, schema) => {
      if (removePassword !== 'true') {
        return schema.min(4, 'A password needs to be at least 4 characters');
      }
    }),
  removePassword: yup.string(),
});
export const updatePasswordValidator = withYup(updatePasswordSchema);

export async function action({ request, params }: ActionArgs) {
  const result = await updatePasswordValidator.validate(
    await request.formData()
  );
  if (result.error) {
    return validationError(result.error);
  }

  const removePassword = result.data.removePassword === 'true';
  const newPassword = removePassword ? null : result.data.password!;
  await Storage.updateFilePassword(params.id!, newPassword);

  return json({ success: true });
}
