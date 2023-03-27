import bcrypt from 'bcrypt';

async function hash(newPassword: string) {
  const saltRounds = 10;
  return bcrypt.hash(newPassword, saltRounds);
}

async function compare(hash: string, candidate: string) {
  return bcrypt.compare(candidate, hash);
}

export const Password = {
  hash,
  compare,
};
