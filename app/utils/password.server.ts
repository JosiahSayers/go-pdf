import bcrypt from 'bcrypt';

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function compare(candidate: string, hash: string) {
  return bcrypt.compare(candidate, hash);
}

export const Password = {
  hash,
  compare,
};
