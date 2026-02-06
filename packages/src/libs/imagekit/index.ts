import Imagekit from 'imagekit';
import { env } from '../../env/index.js';

export const imagekit = new Imagekit({
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
});
