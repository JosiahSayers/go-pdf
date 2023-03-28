#!/usr/bin/env zx

import { $, spinner, question, chalk, fs } from 'zx';
import { paramCase } from 'change-case';

const existingBuckets = await spinner(
  'Logging in to cloudflare with wrangler',
  getBucketList
);
const chosenUserName = await getName();
const bucketName = paramCase(`${chosenUserName} pdfme development`);
const accountId = await getAccountId();

if (!existingBuckets.some((bucket) => bucket.name === bucketName)) {
  await $`wrangler r2 bucket create ${bucketName}`;
}

await ensureEnvFileExists();
await writeToEnv('R2_BUCKET', bucketName);
await writeToEnv('R2_ACCOUNT_ID', accountId);
await writeToEnv('SESSION_SECRET', 'really-bad-secret');

const databaseUrlExists = await doesEnvVarExist('DATABASE_URL');
if (!databaseUrlExists) {
  await writeToEnv('DATABASE_URL', 'REPLACE_ME_WITH_YOUR_DATABASE_URL');
  console.log(
    chalk.yellow(
      'Please fill in the DATABASE_URL variable in the .env file with your development database connection string'
    )
  );
}

console.log(chalk.green(`r2 bucket "${bucketName}" has been created.`));

await checkAccessKeys();

console.log(chalk.green('All done!'));

// FUNCTIONS
async function getBucketList() {
  let bucketList;
  const bucketListCommand = () => $`wrangler r2 bucket list`;
  try {
    bucketList = await bucketListCommand();
  } catch (e) {
    await $`wrangler login`;
  }
  return bucketList
    ? JSON.parse(bucketList)
    : JSON.parse(await bucketListCommand());
}

async function getAccountId() {
  const whoamiOutput = await $`wrangler whoami`.quiet();
  const result = /[0-9a-z]{20,}/.exec(whoamiOutput);
  return result[0];
}

async function getName() {
  let gitUserName = await $`git config user.name`.quiet();
  gitUserName = gitUserName.toString().trim();
  const userNameInput = await question(
    gitUserName
      ? `What is your name? [default ${gitUserName}]: `
      : 'What is your name?: '
  );
  const chosenUserName =
    userNameInput.trim().length > 0 ? userNameInput : gitUserName;

  if (chosenUserName.length === 0) {
    console.log(chalk.red('A name must be provided'));
    await $`exit 1`;
  }

  return chosenUserName;
}

async function ensureEnvFileExists() {
  if (!fs.existsSync('./.env')) {
    await fs.writeFile('./.env', '');
  }
}

async function writeToEnv(envVar, value) {
  let { exists, envFile, searchExpression } = await doesEnvVarExist(envVar);
  if (!exists) {
    envFile += `\n${envVar}=${value}`;
  } else {
    envFile = envFile.replace(searchExpression, `${envVar}=${value}`);
  }
  await fs.writeFile('./.env', envFile.trim());
}

async function doesEnvVarExist(envVar) {
  const envFile = await fs.readFile('./.env', { encoding: 'utf8' });
  const searchExpression = new RegExp(`^${envVar}=[a-zA-Z0-9-]+$`, 'gm');
  const exists = searchExpression.test(envFile);
  return { exists, envFile, searchExpression };
}

async function checkAccessKeys() {
  const { exists: keyIdExists } = await doesEnvVarExist('R2_ACCESS_KEY_ID');
  const { exists: keyExists } = await doesEnvVarExist('R2_ACCESS_KEY');

  if (!keyIdExists || !keyExists) {
    console.log(`Now, let's get your API access key created`);
    console.log(
      `Opening a browser to cloudflare, please follow the instructions here to create a new key: https://developers.cloudflare.com/r2/api/s3/tokens/`
    );
    await $`open https://dash.cloudflare.com/${accountId}/r2/overview/api-tokens`.quiet();
    const keyId = await question('Access Key ID: ');
    const key = await question('Access Key: ');
    await writeToEnv('R2_ACCESS_KEY_ID', keyId);
    await writeToEnv('R2_ACCESS_KEY', key);
  }
}
