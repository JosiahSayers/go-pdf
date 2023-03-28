import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { z } from 'zod';
import { db } from '~/utils/db.server';
import { Session } from '~/utils/session.server';

export const editPdfSchema = z.object({
  url: z
    .string()
    .min(1, 'A custom URL is required')
    .max(100, "A custom URL can't be more than 100 characters"),
});
export const editPdfValidator = withZod(editPdfSchema);

export async function action({ request, params }: ActionArgs) {
  await Session.validateCsrf(request);
  const result = await editPdfValidator.validate(await request.formData());
  if (result.error) {
    return validationError(result.error);
  }

  const file = await db.file.findUnique({ where: { id: params.id } });
  if (!file) {
    throw new Response('Not Found', { status: 404 });
  }

  if (file.url === result.data.url) {
    return json({ success: true });
  }

  const existingFileWithNewUrl = await db.file.findUnique({
    where: { url: result.data.url },
  });
  if (existingFileWithNewUrl) {
    return validationError({
      fieldErrors: {
        url: 'That URL is already in use',
      },
    });
  }

  await db.file.update({
    where: { id: params.id },
    data: { url: result.data.url },
  });
  return json({ success: true });
}
