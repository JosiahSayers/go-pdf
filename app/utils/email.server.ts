import type { User } from '@prisma/client';

const magicLink = async (user: User, link: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `Log in by visiting: http://localhost:3000/login?key=${link.key}`
    );
    return;
  }
};

export const Email = {
  magicLink,
};
