import type { File } from '@prisma/client';

export interface ClientFile extends Omit<File, 'password'> {
  isPasswordProtected: boolean;
}
