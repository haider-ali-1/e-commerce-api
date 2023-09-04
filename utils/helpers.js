import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const getDirName = (metaURL) => dirname(fileURLToPath(metaURL));

export { getDirName };
