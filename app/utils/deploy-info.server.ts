const baseUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.VERCEL_URL
    : 'localhost:3000';

const url = `${
  process.env.NODE_ENV === 'production' ? 'https://' : 'http://'
}${baseUrl}`;

export const DeployInfo = {
  baseUrl,
  url,
};
