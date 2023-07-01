import type { User } from '@prisma/client';

const magicLink = async (user: User, link: any) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `Log in by visiting: http://localhost:3000/login?key=${link.key}`
    );
    return;
  }
};

const subscriptionLowered = async (user: User) => {
  if (process.env.NODE_ENV === 'production') {
    console.log(
      'Your subscription has been lowered. Some files you have uploaded may no longer be available until you restart your subscription.'
    );
  }
  return;
};

export const Email = {
  magicLink,
  subscriptionLowered,
};
