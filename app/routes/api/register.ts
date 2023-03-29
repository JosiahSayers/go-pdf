import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { z } from 'zod';
import { db } from '~/utils/db.server';
import { Password } from '~/utils/password.server';
import { Session } from '~/utils/session.server';

const registerFormSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
    company: z.string().optional(),
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: 'Password and Confirm Password must match',
    path: ['confirmPassword'],
  });

export const registerFormValidator = withZod(registerFormSchema);

export async function action({ request }: ActionArgs) {
  await Session.validateCsrf(request);
  const session = await Session.get(request);
  const formResult = await registerFormValidator.validate(
    await request.formData()
  );
  if (formResult.error) {
    return validationError(formResult.error);
  }
  const user = await db.user.create({
    data: {
      email: formResult.data.email,
      password: await Password.hash(formResult.data.password),
      profile: {
        create: {
          name: formResult.data.name,
          company: formResult.data.company,
        },
      },
    },
  });
  session.set('name', formResult.data.name);
  session.set('userId', user.id);
  return json(
    { success: true },
    { headers: await Session.headersWithSession(session) }
  );
}
