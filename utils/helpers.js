import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import crypto from 'node:crypto';

// __dirname
const getDirName = (metaURL) => dirname(fileURLToPath(metaURL));

// generate crypto token
const generateCryptoToken = () => {
  const randomString = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto
    .createHmac('sha256', process.env.CRYPTO_SECRET_KEY)
    .update(randomString)
    .digest('hex');
  return hashedToken;
};

// compare
const compareValues = (val1, val2) => {
  return val1 === val2;
};

export { getDirName, generateCryptoToken, compareValues };
