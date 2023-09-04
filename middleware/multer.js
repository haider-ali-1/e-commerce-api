import path from 'node:path';
import multer from 'multer';
import { getDirName } from '../utils/helpers.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(getDirName(import.meta.url), '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpeg');
  },
});

const upload = multer({ storage });

export default upload;
