import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { z } from 'zod';
import { db } from '~/utils/db.server';
import { Password } from '~/utils/password.server';
import { Session } from '~/utils/session.server';

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export const loginFormValidator = withZod(loginFormSchema);

export async function action({ request }: ActionArgs) {
  const session = await Session.validateCsrf(request);
  const form = await loginFormValidator.validate(await request.formData());
  if (form.error) {
    return validationError(form.error);
  }
  const createRes = await db.user.create({
    data: {
      email: form.data.email,
      password: await Password.hash(form.data.password),
      profile: {
        create: {
          name: 'John Smith',
          company: 'Microsoft',
        },
      },
    },
  });
  console.log(createRes);
  const user = await db.user.findUnique({
    where: { email: form.data.email },
    include: { profile: true },
  });
  if (!user) {
    return json({ error: 'Unable to log you in' });
  }
  session.set('userId', user.id);
  session.set('name', user.profile?.name);
  return json(
    { success: true },
    { headers: await Session.headersWithSession(session) }
  );
}
