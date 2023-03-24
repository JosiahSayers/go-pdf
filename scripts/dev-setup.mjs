#!/usr/bin/env zx

import { $, spinner, question, chalk, fs } from 'zx';
import { paramCase } from 'change-case';

const existingBuckets = await spinner('Logging in to cloudflare with wrangler', getBucketList);
const chosenUserName = await getName();
const bucketName = paramCase(`${chosenUserName} development`);

if (!existingBuckets.some(bucket => bucket.name === bucketName)) {
  await $`wrangler r2 bucket create ${bucketName}`;
}

await writeBucketToEnv();

console.log(chalk.green(`Setup complete. r2 bucket "${bucketName}" has been created.`));



// FUNCTIONS
async function getBucketList() {
  let bucketList;
  const bucketListCommand = () => $`wrangler r2 bucket list`;
  try {
    bucketList = await bucketListCommand();
  } catch (e) {
    await $`wrangler login`;
  }
  return bucketList ? JSON.parse(bucketList) : JSON.parse(await bucketListCommand());
}

async function getName() {
  let gitUserName = await $`git config user.name`.quiet();
  gitUserName = gitUserName.toString().trim();
  const userNameInput = await question(gitUserName ? `What is your name? [default ${gitUserName}]: ` : 'What is your name?: ');
  const chosenUserName = userNameInput.trim().length > 0 ? userNameInput : gitUserName;
  
  if (chosenUserName.length === 0) {
    console.log(chalk.red('A name must be provided'));
  }

  return chosenUserName;
}

async function writeBucketToEnv() {
  if (!fs.existsSync('./.env')) {
    await fs.writeFile('./.env', `R2_BUCKET=${bucketName}`);
  } else {
    let envFile = await fs.readFile('./.env', { encoding: 'utf8' });
    console.log(envFile);
    const searchExpression = /^R2_BUCKET=[a-zA-Z0-9-]+$/gm;
    const bucketExists = searchExpression.test(envFile);
    if (!bucketExists) {
      envFile += `\nR2_BUCKET=${bucketName}`;
    } else {
      envFile = envFile.replace(searchExpression, `R2_BUCKET=${bucketName}`);
    }
    await fs.writeFile('./.env', envFile.trim());
  }
}
